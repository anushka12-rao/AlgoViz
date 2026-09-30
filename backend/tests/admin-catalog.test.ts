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

describe('Backend Admin Catalog Management Tests', () => {
  let testDb: Database.Database;
  let originalAdminEmail: string;
  let originalAdminPasswordHash: string;

  const testAdminEmail = 'admin@algoviz.test';
  const testAdminPassword = 'CatalogAdminSecret123!';
  let adminCookie: string;

  before(async () => {
    testDb = initDatabase(':memory:');
    originalAdminEmail = env.ADMIN_EMAIL;
    originalAdminPasswordHash = env.ADMIN_PASSWORD_HASH;

    env.ADMIN_EMAIL = testAdminEmail;
    env.ADMIN_PASSWORD_HASH = await bcrypt.hash(testAdminPassword, 10);

    // Login to obtain valid admin cookie
    const loginRes = await request(app)
      .post('/api/admin/login')
      .send({ email: testAdminEmail, password: testAdminPassword });

    assert.strictEqual(loginRes.status, 200);
    const cookies = loginRes.headers['set-cookie'];
    assert.ok(cookies);
    const rawCookie = Array.isArray(cookies) ? cookies[0] : cookies;
    adminCookie = rawCookie.split(';')[0];
  });

  after(() => {
    env.ADMIN_EMAIL = originalAdminEmail;
    env.ADMIN_PASSWORD_HASH = originalAdminPasswordHash;
    closeDatabase();
  });

  // 1. Unauthenticated requests rejected
  it('1. GET /api/admin/algorithms requires admin authentication (401 without cookie)', async () => {
    const res = await request(app).get('/api/admin/algorithms');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'UNAUTHORIZED');
  });

  // 2. Normal user session rejected
  it('2. GET /api/admin/algorithms rejects normal user session with 403 Forbidden', async () => {
    const authService = new AuthService();
    const userToken = authService.generateToken({
      userId: 'test-user-id',
      email: 'user@algoviz.test',
      username: 'normal_user',
    });

    const res = await request(app)
      .get('/api/admin/algorithms')
      .set('Cookie', `${ADMIN_COOKIE_NAME}=${userToken}`);

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'FORBIDDEN');
  });

  // 3. Authenticated admin retrieves all algorithms
  it('3. GET /api/admin/algorithms returns all 14 algorithms with is_enabled status', async () => {
    const res = await request(app)
      .get('/api/admin/algorithms')
      .set('Cookie', adminCookie);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.strictEqual(res.body.data.length, 14);

    // Verify ordering by display_order
    for (let i = 0; i < res.body.data.length - 1; i++) {
      assert.ok(res.body.data[i].display_order < res.body.data[i + 1].display_order);
    }

    // Verify each has boolean is_enabled
    for (const algo of res.body.data) {
      assert.strictEqual(typeof algo.is_enabled, 'boolean');
      assert.ok(algo.id);
      assert.ok(algo.name);
      assert.ok(algo.category);
    }
  });

  // 4. Validation of invalid algorithm ID
  it('4. PATCH /api/admin/algorithms/:id returns 400 for invalid ID format', async () => {
    const res = await request(app)
      .patch('/api/admin/algorithms/INVALID-UPPERCASE!')
      .set('Cookie', adminCookie)
      .send({ enabled: false });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
  });

  // 5. Validation of invalid body payload
  it('5. PATCH /api/admin/algorithms/:id returns 400 when enabled boolean is missing or invalid', async () => {
    const res = await request(app)
      .patch('/api/admin/algorithms/bubble_sort')
      .set('Cookie', adminCookie)
      .send({ enabled: 'not-a-boolean' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
  });

  // 6. Unknown algorithm ID returns 404
  it('6. PATCH /api/admin/algorithms/:id returns 404 for non-existent algorithm', async () => {
    const res = await request(app)
      .patch('/api/admin/algorithms/nonexistent_algo')
      .set('Cookie', adminCookie)
      .send({ enabled: false });

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'NOT_FOUND');
  });

  // 7. Disabling an algorithm updates database, removes from public catalog, and blocks visualization
  it('7. Disabling an algorithm excludes it from public catalog and prevents visualization', async () => {
    // Disable bubble_sort
    const disableRes = await request(app)
      .patch('/api/admin/algorithms/bubble_sort')
      .set('Cookie', adminCookie)
      .send({ enabled: false });

    assert.strictEqual(disableRes.status, 200);
    assert.strictEqual(disableRes.body.success, true);
    assert.strictEqual(disableRes.body.data.id, 'bubble_sort');
    assert.strictEqual(disableRes.body.data.is_enabled, false);

    // Verify public catalog now only has 13 algorithms and bubble_sort is excluded
    const publicCatalogRes = await request(app).get('/api/algorithms');
    assert.strictEqual(publicCatalogRes.status, 200);
    assert.strictEqual(publicCatalogRes.body.data.length, 13);
    const bubbleSortInPublic = publicCatalogRes.body.data.find((a: any) => a.id === 'bubble_sort');
    assert.strictEqual(bubbleSortInPublic, undefined, 'bubble_sort must not be in public catalog');

    // Verify visualization endpoint rejects disabled algorithm with 404
    const vizRes = await request(app)
      .post('/api/visualize')
      .send({
        algorithm: 'bubble_sort',
        input: { array: [3, 1, 2] },
      });
    assert.strictEqual(vizRes.status, 404);
    assert.strictEqual(vizRes.body.error.code, 'ALGORITHM_NOT_FOUND');

    // Admin endpoint still lists all 14 algorithms
    const adminCatalogRes = await request(app)
      .get('/api/admin/algorithms')
      .set('Cookie', adminCookie);
    assert.strictEqual(adminCatalogRes.status, 200);
    assert.strictEqual(adminCatalogRes.body.data.length, 14);
    const adminBubbleSort = adminCatalogRes.body.data.find((a: any) => a.id === 'bubble_sort');
    assert.strictEqual(adminBubbleSort.is_enabled, false);

    // Re-enable bubble_sort using PUT and is_enabled property
    const enableRes = await request(app)
      .put('/api/admin/algorithms/bubble_sort')
      .set('Cookie', adminCookie)
      .send({ is_enabled: true });

    assert.strictEqual(enableRes.status, 200);
    assert.strictEqual(enableRes.body.success, true);
    assert.strictEqual(enableRes.body.data.is_enabled, true);

    // Verify public catalog has all 14 algorithms again
    const publicCatalogRestored = await request(app).get('/api/algorithms');
    assert.strictEqual(publicCatalogRestored.status, 200);
    assert.strictEqual(publicCatalogRestored.body.data.length, 14);
  });
});
