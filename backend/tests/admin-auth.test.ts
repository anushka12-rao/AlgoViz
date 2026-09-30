import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import { app } from '../src/app';
import { env } from '../src/config/env';
import { ADMIN_COOKIE_NAME } from '../src/config/constants';
import { initDatabase, closeDatabase } from '../src/db/connection';
import { AuthService } from '../src/services/auth.service';

describe('Backend Administrator Authentication Tests', () => {
  let testDb: Database.Database;
  let originalAdminEmail: string;
  let originalAdminPasswordHash: string;

  const testAdminEmail = 'admin@algoviz.test';
  const testAdminPassword = 'SuperSecretAdminPassword123!';
  let adminSessionCookie: string;

  before(async () => {
    testDb = initDatabase(':memory:');
    originalAdminEmail = env.ADMIN_EMAIL;
    originalAdminPasswordHash = env.ADMIN_PASSWORD_HASH;

    env.ADMIN_EMAIL = testAdminEmail;
    env.ADMIN_PASSWORD_HASH = await bcrypt.hash(testAdminPassword, 10);
  });

  after(() => {
    env.ADMIN_EMAIL = originalAdminEmail;
    env.ADMIN_PASSWORD_HASH = originalAdminPasswordHash;
    closeDatabase();
  });

  // 1. Correct admin login
  it('1. Correct admin login returns 200, sets algoviz_admin_session HttpOnly cookie, and returns safe admin data without token in body', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .send({
        email: testAdminEmail,
        password: testAdminPassword,
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.admin, 'Response should contain admin object');
    assert.strictEqual(res.body.admin.email, testAdminEmail.toLowerCase());
    assert.strictEqual(res.body.admin.role, 'admin');

    // Security assertions: no tokens, passwords, or hashes in response body
    assert.strictEqual(res.body.token, undefined, 'Response must NOT contain token');
    assert.strictEqual(res.body.admin.password, undefined, 'Response must NOT contain password');
    assert.strictEqual(res.body.admin.password_hash, undefined, 'Response must NOT contain password_hash');
    assert.strictEqual(JSON.stringify(res.body).includes(testAdminPassword), false);
    assert.strictEqual(JSON.stringify(res.body).includes(env.ADMIN_PASSWORD_HASH), false);

    // Verify Set-Cookie header
    const cookies = res.headers['set-cookie'];
    assert.ok(cookies, 'Set-Cookie header must be present');
    const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
    assert.ok(cookieStr.includes(`${ADMIN_COOKIE_NAME}=`), `Cookie must contain ${ADMIN_COOKIE_NAME}`);
    assert.ok(cookieStr.toLowerCase().includes('httponly'), 'Cookie must be HttpOnly');

    const rawCookie = Array.isArray(cookies) ? cookies[0] : cookies;
    adminSessionCookie = rawCookie.split(';')[0];
  });

  // 2. Incorrect password rejected
  it('2. Admin login with incorrect password returns 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .send({
        email: testAdminEmail,
        password: 'WrongAdminPassword999!',
      });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'UNAUTHORIZED');
    assert.strictEqual(res.body.error.message, 'Invalid email or password.');
    assert.strictEqual(JSON.stringify(res.body).includes(env.ADMIN_PASSWORD_HASH), false);
  });

  // 3. Incorrect email rejected
  it('3. Admin login with incorrect email returns 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .send({
        email: 'wrong-admin@example.com',
        password: testAdminPassword,
      });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'UNAUTHORIZED');
    assert.strictEqual(res.body.error.message, 'Invalid email or password.');
  });

  // 4. No admin signup route exists
  it('4. POST /api/admin/signup does not exist and returns 404 Not Found', async () => {
    const res = await request(app)
      .post('/api/admin/signup')
      .send({
        email: 'newadmin@algoviz.test',
        password: 'AnyPassword123!',
      });

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'NOT_FOUND');
  });

  // 5. Admin /me with valid admin cookie
  it('5. GET /api/admin/me with valid algoviz_admin_session cookie returns 200 and safe admin payload', async () => {
    const res = await request(app)
      .get('/api/admin/me')
      .set('Cookie', adminSessionCookie);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.admin.email, testAdminEmail.toLowerCase());
    assert.strictEqual(res.body.admin.role, 'admin');
    assert.strictEqual(res.body.admin.password, undefined);
    assert.strictEqual(res.body.admin.password_hash, undefined);
  });

  // 6. Admin /me without session cookie
  it('6. GET /api/admin/me without session cookie returns 401 Unauthorized', async () => {
    const res = await request(app).get('/api/admin/me');

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'UNAUTHORIZED');
  });

  // 7. Normal user session cannot access admin routes
  it('7a. Normal user session cookie (algoviz_session=...) cannot access GET /api/admin/me (returns 401 Unauthorized)', async () => {
    // Generate valid normal user session cookie
    const userRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'regularuser@algoviz.test',
        username: 'regular_user',
        password: 'RegularPassword123!',
      });

    assert.strictEqual(userRes.status, 201);
    const userCookies = userRes.headers['set-cookie'];
    assert.ok(userCookies);
    const normalUserCookie = (Array.isArray(userCookies) ? userCookies[0] : userCookies).split(';')[0]; // "token=..."

    // Request admin endpoint using normal user cookie
    const adminRes = await request(app)
      .get('/api/admin/me')
      .set('Cookie', normalUserCookie);

    assert.strictEqual(adminRes.status, 401);
    assert.strictEqual(adminRes.body.success, false);
    assert.strictEqual(adminRes.body.error.code, 'UNAUTHORIZED');
  });

  it('7b. Normal user token in algoviz_admin_session cookie is rejected with 403 Forbidden', async () => {
    const authService = new AuthService();
    const normalUserToken = authService.generateToken({
      userId: 'some-user-id',
      email: 'regularuser@algoviz.test',
      username: 'regular_user',
    });

    const forgedAdminCookie = `${ADMIN_COOKIE_NAME}=${normalUserToken}`;

    const res = await request(app)
      .get('/api/admin/me')
      .set('Cookie', forgedAdminCookie);

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'FORBIDDEN');
    assert.strictEqual(res.body.error.message, 'Forbidden. Admin privileges required.');
  });

  // 8. Admin logout clears session cookie
  it('8. POST /api/admin/logout clears algoviz_admin_session cookie and subsequent /me returns 401', async () => {
    const logoutRes = await request(app)
      .post('/api/admin/logout')
      .set('Cookie', adminSessionCookie);

    assert.strictEqual(logoutRes.status, 200);
    assert.strictEqual(logoutRes.body.success, true);
    assert.strictEqual(logoutRes.body.message, 'Admin logged out successfully');

    const cookies = logoutRes.headers['set-cookie'];
    assert.ok(cookies);
    const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
    assert.ok(
      cookieStr.includes(`${ADMIN_COOKIE_NAME}=;`) ||
      cookieStr.includes('Expires=Thu, 01 Jan 1970') ||
      cookieStr.includes('Max-Age=0'),
      'Admin cookie must be cleared/expired'
    );

    // Subsequent /me call returns 401
    const meRes = await request(app).get('/api/admin/me');
    assert.strictEqual(meRes.status, 401);
  });

  // 9. Password / password hash are never returned in any response
  it('9. Never exposes password or password_hash across all admin endpoints', async () => {
    // Login with invalid data
    const invalidRes = await request(app)
      .post('/api/admin/login')
      .send({ email: 'bad@format', password: '' });
    assert.strictEqual(JSON.stringify(invalidRes.body).includes(env.ADMIN_PASSWORD_HASH), false);
    assert.strictEqual(invalidRes.body.password, undefined);
    assert.strictEqual(invalidRes.body.password_hash, undefined);

    // Logout
    const logoutRes = await request(app).post('/api/admin/logout');
    assert.strictEqual(JSON.stringify(logoutRes.body).includes(env.ADMIN_PASSWORD_HASH), false);
  });
});
