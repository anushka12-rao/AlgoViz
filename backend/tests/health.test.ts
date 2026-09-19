import { describe, it } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { app } from '../src/app';

describe('Phase 9B Backend Skeleton Tests', () => {
  it('GET /api/health returns 200 with ok status', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.body, {
      success: true,
      service: 'algoviz-backend',
      status: 'ok',
    });
  });

  it('GET /api/unknown-route returns 404 with structured error', async () => {
    const res = await request(app).get('/api/unknown-route');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'NOT_FOUND');
    assert.ok(res.body.error.message.includes('/api/unknown-route'));
  });

  it('POST with malformed JSON payload returns 400 with INVALID_JSON error', async () => {
    const res = await request(app)
      .post('/api/health')
      .set('Content-Type', 'application/json')
      .send('{"malformed": true, broken}');
    
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'INVALID_JSON');
    assert.strictEqual(res.body.error.message, 'Malformed JSON payload in request body');
  });

  it('OPTIONS preflight returns 204 with CORS allow headers for allowed origin', async () => {
    const res = await request(app)
      .options('/api/health')
      .set('Origin', 'http://localhost:3000');

    assert.strictEqual(res.status, 204);
    assert.strictEqual(res.headers['access-control-allow-origin'], 'http://localhost:3000');
    assert.strictEqual(res.headers['access-control-allow-methods'], 'GET, POST, OPTIONS');
    assert.ok(res.headers['access-control-allow-headers'].includes('Content-Type'));
  });

  it('GET request with allowed Origin header receives Access-Control-Allow-Origin', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:3000');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers['access-control-allow-origin'], 'http://localhost:3000');
  });
});
