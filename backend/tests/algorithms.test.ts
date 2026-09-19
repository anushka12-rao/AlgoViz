import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import Database from 'better-sqlite3';
import { app } from '../src/app';
import { initDatabase, closeDatabase } from '../src/db/connection';
import { seedAlgorithms } from '../src/db/seed';
import { AlgorithmRepository } from '../src/repositories/algorithm.repository';
import { AlgorithmService } from '../src/services/algorithm.service';
import { ALGORITHM_SEEDS } from '../src/db/seeds/algorithms.data';

describe('Phase 9C SQLite + Algorithm Metadata Tests', () => {
  let testDb: Database.Database;

  before(() => {
    // Isolate tests completely in-memory
    testDb = initDatabase(':memory:');
  });

  after(() => {
    closeDatabase();
  });

  // 1 & 2: Database and Schema creation
  it('1 & 2: Database initializes and algorithms table exists with indexes', () => {
    assert.ok(testDb.open);
    const tableInfo = testDb
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='algorithms'")
      .get() as { name: string } | undefined;
    assert.strictEqual(tableInfo?.name, 'algorithms');

    const indexInfo = testDb
      .prepare("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_algorithms_enabled_order'")
      .get() as { name: string } | undefined;
    assert.strictEqual(indexInfo?.name, 'idx_algorithms_enabled_order');
  });

  // 3: Seed creates exactly 14 records
  it('3: Seed creates exactly 14 records', () => {
    const row = testDb.prepare('SELECT COUNT(*) as count FROM algorithms').get() as { count: number };
    assert.strictEqual(row.count, 14);
  });

  // 4: Seeding twice remains exactly 14 (Idempotency)
  it('4: Seeding twice remains exactly 14 records', () => {
    seedAlgorithms(testDb);
    const row = testDb.prepare('SELECT COUNT(*) as count FROM algorithms').get() as { count: number };
    assert.strictEqual(row.count, 14);
  });

  // 5: All 14 IDs match expected engine IDs
  it('5: All 14 IDs match expected C++ engine whitelist IDs', () => {
    const expectedIds = [
      'bubble_sort',
      'selection_sort',
      'insertion_sort',
      'merge_sort',
      'quick_sort',
      'linear_search',
      'binary_search',
      'stack',
      'queue',
      'linked_list',
      'binary_tree',
      'bst',
      'bfs',
      'dfs',
    ];

    const rows = testDb.prepare('SELECT id FROM algorithms ORDER BY display_order ASC').all() as { id: string }[];
    const actualIds = rows.map(r => r.id);
    assert.deepStrictEqual(actualIds, expectedIds);
  });

  // 6: Display order is exactly 1..14
  it('6: Display order is consecutive from 1 to 14 without gaps', () => {
    const rows = testDb.prepare('SELECT display_order FROM algorithms ORDER BY display_order ASC').all() as {
      display_order: number;
    }[];
    const actualOrders = rows.map(r => r.display_order);
    const expectedOrders = Array.from({ length: 14 }, (_, i) => i + 1);
    assert.deepStrictEqual(actualOrders, expectedOrders);
  });

  // 7: All records initially enabled
  it('7: All 14 records are initially enabled (is_enabled = 1)', () => {
    const rows = testDb.prepare('SELECT COUNT(*) as count FROM algorithms WHERE is_enabled = 1').get() as {
      count: number;
    };
    assert.strictEqual(rows.count, 14);
  });

  // 8: GET /api/algorithms returns 14 records
  it('8: GET /api/algorithms returns HTTP 200 with 14 records', async () => {
    const res = await request(app).get('/api/algorithms');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(Array.isArray(res.body.data), true);
    assert.strictEqual(res.body.data.length, 14);
  });

  // 9: Response is correctly ordered
  it('9: GET /api/algorithms is correctly ordered by display_order ascending', async () => {
    const res = await request(app).get('/api/algorithms');
    const orders = res.body.data.map((item: any) => item.display_order);
    for (let i = 0; i < orders.length; i++) {
      assert.strictEqual(orders[i], i + 1);
    }
  });

  // 10: Response does not expose internal timestamps
  it('10: Response does not expose created_at, updated_at, or is_enabled', async () => {
    const res = await request(app).get('/api/algorithms');
    for (const item of res.body.data) {
      assert.strictEqual(item.created_at, undefined);
      assert.strictEqual(item.updated_at, undefined);
      assert.strictEqual(item.is_enabled, undefined);
    }
  });

  // 11: Complexity DTO is correctly nested
  it('11: Complexity DTO is correctly nested with time (best, average, worst) and space', async () => {
    const res = await request(app).get('/api/algorithms');
    const bubble = res.body.data.find((item: any) => item.id === 'bubble_sort');
    assert.ok(bubble);
    assert.deepStrictEqual(bubble.complexity, {
      time: {
        best: 'O(n)',
        average: 'O(n²)',
        worst: 'O(n²)',
      },
      space: 'O(1)',
    });
  });

  // 12 & 13: GET /api/algorithms/bubble_sort returns 200 with correct metadata
  it('12 & 13: GET /api/algorithms/bubble_sort returns 200 with accurate metadata', async () => {
    const res = await request(app).get('/api/algorithms/bubble_sort');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.id, 'bubble_sort');
    assert.strictEqual(res.body.data.name, 'Bubble Sort');
    assert.strictEqual(res.body.data.category, 'sorting');
    assert.strictEqual(res.body.data.input_type, 'array');
    assert.strictEqual(res.body.data.display_order, 1);
    assert.strictEqual(
      res.body.data.description,
      'Iteratively compares adjacent elements and swaps them if out of order, bubbling the largest elements to the end.'
    );
  });

  // 14: Nonexistent ID returns 404
  it('14: Nonexistent ID returns 404 with structured error', async () => {
    const res = await request(app).get('/api/algorithms/nonexistent_algo');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'NOT_FOUND');
    assert.strictEqual(res.body.error.message, "Algorithm 'nonexistent_algo' not found");
  });

  // 15 & 16: Disabled algorithm behavior
  it('15 & 16: Disabled algorithm is excluded from list and returns 404 individually', async () => {
    // Disable quick_sort temporarily
    testDb.prepare('UPDATE algorithms SET is_enabled = 0 WHERE id = ?').run('quick_sort');

    // List query: should return 13 items, excluding quick_sort
    const listRes = await request(app).get('/api/algorithms');
    assert.strictEqual(listRes.status, 200);
    assert.strictEqual(listRes.body.data.length, 13);
    const foundQuick = listRes.body.data.some((item: any) => item.id === 'quick_sort');
    assert.strictEqual(foundQuick, false);

    // Individual query: should return 404
    const singleRes = await request(app).get('/api/algorithms/quick_sort');
    assert.strictEqual(singleRes.status, 404);
    assert.strictEqual(singleRes.body.success, false);
    assert.strictEqual(singleRes.body.error.code, 'NOT_FOUND');

    // Re-enable quick_sort
    testDb.prepare('UPDATE algorithms SET is_enabled = 1 WHERE id = ?').run('quick_sort');
  });

  // 17: Malformed ID is rejected cleanly
  it('17: Malformed ID containing invalid characters is rejected cleanly with 404', async () => {
    const res = await request(app).get('/api/algorithms/invalid!@#$%^&*()');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'NOT_FOUND');
  });

  // Check specific data structure metadata (Queue linked-node and Binary Tree space complexity)
  it('Verifies specific Queue and Binary Tree metadata requirements', async () => {
    const queueRes = await request(app).get('/api/algorithms/queue');
    assert.strictEqual(queueRes.status, 200);
    assert.ok(queueRes.body.data.description.includes('singly-linked node chain'));

    const btreeRes = await request(app).get('/api/algorithms/binary_tree');
    assert.strictEqual(btreeRes.status, 200);
    assert.strictEqual(btreeRes.body.data.complexity.space, 'O(w) / O(h)');
  });
});
