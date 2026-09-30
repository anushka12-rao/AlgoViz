import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { app } from '../src/app';
import { initDatabase, closeDatabase } from '../src/db/connection';
import { USER_COOKIE_NAME, ADMIN_COOKIE_NAME } from '../src/config/constants';
import { env } from '../src/config/env';

describe('Regression Audit Verification Tests', () => {
  let db: Database.Database;
  const testAdminEmail = 'admin_audit@example.com';
  const testAdminPassword = 'AuditAdminPass123!';

  before(async () => {
    db = initDatabase(':memory:');
    env.ADMIN_EMAIL = testAdminEmail;
    env.ADMIN_PASSWORD_HASH = await bcrypt.hash(testAdminPassword, 10);
  });

  after(() => {
    closeDatabase();
  });

  it('1. GET /api/algorithms without auth returns 200', async () => {
    const res = await request(app).get('/api/algorithms');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.strictEqual(res.body.data.length, 14);
  });

  it('2. GET /api/auth/me without auth returns 401', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'UNAUTHORIZED');
  });

  it('3. GET /api/admin/me without admin auth returns 401', async () => {
    const res = await request(app).get('/api/admin/me');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'UNAUTHORIZED');
  });

  it('4. OPTIONS request for PATCH /api/admin/algorithms/:id has correct CORS response', async () => {
    const res = await request(app)
      .options('/api/admin/algorithms/bubble_sort')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'PATCH');

    assert.strictEqual(res.status, 204);
    assert.strictEqual(res.headers['access-control-allow-origin'], 'http://localhost:3000');
    assert.strictEqual(res.headers['access-control-allow-credentials'], 'true');
    assert.ok(res.headers['access-control-allow-methods'].includes('PATCH'));
  });

  it('5. OPTIONS request for PUT /api/admin/algorithms/:id has correct CORS response', async () => {
    const res = await request(app)
      .options('/api/admin/algorithms/bubble_sort')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'PUT');

    assert.strictEqual(res.status, 204);
    assert.strictEqual(res.headers['access-control-allow-origin'], 'http://localhost:3000');
    assert.strictEqual(res.headers['access-control-allow-credentials'], 'true');
    assert.ok(res.headers['access-control-allow-methods'].includes('PUT'));
  });

  it('6. Normal user flow: signup -> login -> /api/auth/me -> protected visualizer -> logout', async () => {
    // Signup
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'user_flow@algoviz.test',
        username: 'user_flow',
        password: 'ValidUserPassword123!',
      });
    assert.strictEqual(signupRes.status, 201);
    assert.ok(signupRes.headers['set-cookie']);
    const signupCookie = signupRes.headers['set-cookie'][0].split(';')[0];
    assert.ok(signupCookie.startsWith(`${USER_COOKIE_NAME}=`));

    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user_flow@algoviz.test',
        password: 'ValidUserPassword123!',
      });
    assert.strictEqual(loginRes.status, 200);
    const userCookie = loginRes.headers['set-cookie'][0].split(';')[0];
    assert.ok(userCookie.startsWith(`${USER_COOKIE_NAME}=`));

    // /api/auth/me
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', userCookie);
    assert.strictEqual(meRes.status, 200);
    assert.strictEqual(meRes.body.user.email, 'user_flow@algoviz.test');

    // Visualizer execution
    const vizRes = await request(app)
      .post('/api/visualize')
      .send({
        algorithm: 'bubble_sort',
        input: { array: [3, 1, 2] },
      });
    assert.strictEqual(vizRes.status, 200);
    assert.strictEqual(vizRes.body.success, true);

    // Logout
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', userCookie);
    assert.strictEqual(logoutRes.status, 200);
    const logoutCookie = logoutRes.headers['set-cookie'][0];
    assert.ok(logoutCookie.includes(`${USER_COOKIE_NAME}=;`) || logoutCookie.includes('Max-Age=0'));

    // Subsequent /api/auth/me without cookie is 401
    const postLogoutMe = await request(app).get('/api/auth/me');
    assert.strictEqual(postLogoutMe.status, 401);
  });

  it('7. Admin flow: admin login -> /api/admin/me -> admin dashboard -> PATCH/PUT enable/disable -> logout', async () => {
    // Admin login
    const loginRes = await request(app)
      .post('/api/admin/login')
      .send({
        email: testAdminEmail,
        password: testAdminPassword,
      });
    assert.strictEqual(loginRes.status, 200);
    assert.strictEqual(loginRes.body.admin.role, 'admin');
    const adminCookie = loginRes.headers['set-cookie'][0].split(';')[0];
    assert.ok(adminCookie.startsWith(`${ADMIN_COOKIE_NAME}=`));

    // /api/admin/me
    const meRes = await request(app)
      .get('/api/admin/me')
      .set('Cookie', adminCookie);
    assert.strictEqual(meRes.status, 200);
    assert.strictEqual(meRes.body.admin.role, 'admin');

    // Admin dashboard: get all algorithms
    const algosRes = await request(app)
      .get('/api/admin/algorithms')
      .set('Cookie', adminCookie);
    assert.strictEqual(algosRes.status, 200);
    assert.strictEqual(algosRes.body.data.length, 14);

    // PATCH algorithm disable
    const patchRes = await request(app)
      .patch('/api/admin/algorithms/bubble_sort')
      .set('Cookie', adminCookie)
      .send({ enabled: false });
    assert.strictEqual(patchRes.status, 200);
    assert.strictEqual(patchRes.body.data.is_enabled, false);

    // Public catalog should now have 13 enabled algorithms
    const publicRes = await request(app).get('/api/algorithms');
    assert.strictEqual(publicRes.body.data.length, 13);

    // PUT algorithm re-enable
    const putRes = await request(app)
      .put('/api/admin/algorithms/bubble_sort')
      .set('Cookie', adminCookie)
      .send({ enabled: true });
    assert.strictEqual(putRes.status, 200);
    assert.strictEqual(putRes.body.data.is_enabled, true);

    // Admin logout
    const logoutRes = await request(app)
      .post('/api/admin/logout')
      .set('Cookie', adminCookie);
    assert.strictEqual(logoutRes.status, 200);

    // Subsequent /api/admin/me without cookie is 401
    const postLogoutAdminMe = await request(app).get('/api/admin/me');
    assert.strictEqual(postLogoutAdminMe.status, 401);
  });
});
