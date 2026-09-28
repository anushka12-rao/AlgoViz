import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import Database from 'better-sqlite3';
import { app } from '../src/app';
import { initDatabase, closeDatabase } from '../src/db/connection';

describe('Backend User Authentication Tests', () => {
  let testDb: Database.Database;

  before(() => {
    testDb = initDatabase(':memory:');
  });

  after(() => {
    closeDatabase();
  });

  const testUser = {
    email: 'alice@example.com',
    username: 'alice_user',
    password: 'SecurePassword123!',
  };

  let sessionCookie: string;

  // 1. Successful signup
  it('1. Successful signup creates user, sets HttpOnly cookie, and returns safe user data without token in body', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.user);
    assert.strictEqual(res.body.user.email, testUser.email.toLowerCase());
    assert.strictEqual(res.body.user.username, testUser.username);
    assert.ok(res.body.user.id);
    assert.strictEqual(res.body.user.password_hash, undefined, 'password_hash must never be exposed');
    assert.strictEqual(res.body.token, undefined, 'Signup response body must NOT contain a token');

    // Verify Set-Cookie header
    const cookies = res.headers['set-cookie'];
    assert.ok(cookies, 'Set-Cookie header must be present');
    const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
    assert.ok(cookieStr.includes('token='), 'Cookie must contain token');
    assert.ok(cookieStr.toLowerCase().includes('httponly'), 'Cookie must be HttpOnly');

    // Verify database record has hashed password, never plaintext
    const dbRecord = testDb.prepare('SELECT * FROM users WHERE email = ?').get(testUser.email.toLowerCase()) as any;
    assert.ok(dbRecord, 'User must exist in SQLite database');
    assert.notStrictEqual(dbRecord.password_hash, testUser.password, 'Password must be hashed');
    assert.ok(dbRecord.password_hash.startsWith('$2'), 'Must be a valid bcrypt hash');
  });

  // 2. Duplicate email rejected
  it('2. Duplicate email rejected with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: testUser.email.toUpperCase(), // Test case insensitivity
        username: 'alice_different',
        password: 'Password123!',
      });

    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'CONFLICT');
    assert.ok(res.body.error.message.includes('email'));
  });

  // 3. Duplicate username rejected
  it('3. Duplicate username rejected with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'bob@example.com',
        username: testUser.username,
        password: 'Password123!',
      });

    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'CONFLICT');
    assert.ok(res.body.error.message.includes('username'));
  });

  // 4. Invalid signup input rejected
  it('4. Invalid signup input rejected with 400 Validation Error', async () => {
    // Too short password
    const res1 = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'invalid@example.com',
        username: 'validuser',
        password: '123',
      });
    assert.strictEqual(res1.status, 400);
    assert.strictEqual(res1.body.success, false);
    assert.strictEqual(res1.body.error.code, 'VALIDATION_ERROR');

    // Invalid email format
    const res2 = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'not-an-email',
        username: 'validuser',
        password: 'ValidPassword123!',
      });
    assert.strictEqual(res2.status, 400);
    assert.strictEqual(res2.body.error.code, 'VALIDATION_ERROR');

    // Invalid username with forbidden characters
    const res3 = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'valid@example.com',
        username: 'bad user name!',
        password: 'ValidPassword123!',
      });
    assert.strictEqual(res3.status, 400);
    assert.strictEqual(res3.body.error.code, 'VALIDATION_ERROR');
  });

  // 5. Successful login
  it('5. Successful login returns 200, sets cookie, and returns safe user data without token in body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.user.email, testUser.email.toLowerCase());
    assert.strictEqual(res.body.user.username, testUser.username);
    assert.strictEqual(res.body.user.password_hash, undefined);
    assert.strictEqual(res.body.token, undefined, 'Login response body must NOT contain a token');

    const cookies = res.headers['set-cookie'];
    assert.ok(cookies);
    const cookieHeader = Array.isArray(cookies) ? cookies[0] : cookies;
    sessionCookie = cookieHeader.split(';')[0]; // Extract 'token=...'
  });

  // 6. Invalid password rejected
  it('6. Invalid password rejected with 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword!',
      });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'UNAUTHORIZED');
    assert.strictEqual(res.body.error.message, 'Invalid email or password.');
  });

  // 7. Unknown email rejected
  it('7. Unknown email rejected with 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: testUser.password,
      });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'UNAUTHORIZED');
    assert.strictEqual(res.body.error.message, 'Invalid email or password.');
  });

  // 8. /api/auth/me requires authentication
  it('8. GET /api/auth/me requires authentication (returns 401 when no cookie)', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'UNAUTHORIZED');
  });

  // 9. Authenticated /api/auth/me returns safe user data via cookie
  it('9. GET /api/auth/me returns safe user data with valid session cookie', async () => {
    const cookieRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', sessionCookie);

    assert.strictEqual(cookieRes.status, 200);
    assert.strictEqual(cookieRes.body.success, true);
    assert.strictEqual(cookieRes.body.user.email, testUser.email.toLowerCase());
    assert.strictEqual(cookieRes.body.user.username, testUser.username);
    assert.strictEqual(cookieRes.body.user.password_hash, undefined);
  });

  // 9b. Authorization: Bearer token is rejected / ignored without cookie
  it('9b. GET /api/auth/me rejects Bearer token when cookie is missing', async () => {
    const bearerRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer some-arbitrary-token');

    assert.strictEqual(bearerRes.status, 401);
    assert.strictEqual(bearerRes.body.success, false);
    assert.strictEqual(bearerRes.body.error.code, 'UNAUTHORIZED');
  });

  // 10. Logout invalidates session
  it('10. POST /api/auth/logout clears cookie and subsequent request is unauthorized', async () => {
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', sessionCookie);

    assert.strictEqual(logoutRes.status, 200);
    assert.strictEqual(logoutRes.body.success, true);

    const cookies = logoutRes.headers['set-cookie'];
    assert.ok(cookies);
    const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
    assert.ok(
      cookieStr.includes('token=;') || cookieStr.includes('Expires=Thu, 01 Jan 1970') || cookieStr.includes('Max-Age=0'),
      'Cookie must be cleared/expired'
    );

    // Requesting /api/auth/me without a cookie or with cleared cookie returns 401
    const meRes = await request(app).get('/api/auth/me');
    assert.strictEqual(meRes.status, 401);
  });
});
