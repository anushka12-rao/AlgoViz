import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import express from 'express';
import Database from 'better-sqlite3';
import { app } from '../src/app';
import { initDatabase, closeDatabase, getDatabase } from '../src/db/connection';
import { seedAlgorithms } from '../src/db/seed';
import { VisualizeController } from '../src/controllers/visualize.controller';
import { AlgorithmRepository } from '../src/repositories/algorithm.repository';
import {
  runEngine,
  resetConcurrencyForTesting,
  setMockActiveProcessesForTesting,
  verifyEngineBinary,
} from '../src/engine/engine.runner';
import {
  EngineTimeoutError,
  OutputLimitExceededError,
  ServiceUnavailableError,
  EngineExecutionError,
} from '../src/engine/engine.types';

describe('Phase 9D C++ Engine Bridge Tests', () => {
  let testDb: Database.Database;

  before(() => {
    testDb = initDatabase(':memory:');
    seedAlgorithms(testDb);
  });

  after(() => {
    closeDatabase();
    resetConcurrencyForTesting();
  });

  // ==========================================================================
  // SECTION A: All 14 Algorithms Integration with Real Engine
  // ==========================================================================
  describe('A. All 14 Algorithms Integration with Real Engine', () => {
    it('1. bubble_sort executes and returns valid steps, events, and final result', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'bubble_sort',
          input: { array: [5, 1, 4, 2, 8] },
          options: { mode: 'auto' },
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.algorithm, 'bubble_sort');
      assert.strictEqual(res.body.category, 'sorting');
      assert.ok(res.body.total_steps > 0);
      assert.strictEqual(res.body.events.length, res.body.total_steps);
      assert.deepStrictEqual(res.body.final_result.final_array, [1, 2, 4, 5, 8]);

      // Verify event envelope properties
      const firstEvent = res.body.events[0];
      assert.strictEqual(firstEvent.step_index, 1);
      assert.ok(typeof firstEvent.action === 'string');
      assert.ok(typeof firstEvent.message === 'string');
      assert.ok(typeof firstEvent.canonical_duration_ms === 'number');
      assert.ok(firstEvent.canonical_duration_ms >= 0);
    });

    it('2. selection_sort executes correctly', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'selection_sort',
          input: { array: [29, 10, 14, 37, 13] },
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.algorithm, 'selection_sort');
      assert.strictEqual(res.body.category, 'sorting');
      assert.deepStrictEqual(res.body.final_result.final_array, [10, 13, 14, 29, 37]);
      assert.ok(res.body.total_steps > 0);
    });

    it('3. insertion_sort executes correctly', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'insertion_sort',
          input: { array: [12, 11, 13, 5, 6] },
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.algorithm, 'insertion_sort');
      assert.strictEqual(res.body.category, 'sorting');
      assert.deepStrictEqual(res.body.final_result.final_array, [5, 6, 11, 12, 13]);
      assert.ok(res.body.total_steps > 0);
    });

    it('4. merge_sort executes correctly', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'merge_sort',
          input: { array: [38, 27, 43, 3, 9, 82, 10] },
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.algorithm, 'merge_sort');
      assert.strictEqual(res.body.category, 'sorting');
      assert.deepStrictEqual(res.body.final_result.final_array, [3, 9, 10, 27, 38, 43, 82]);
      assert.ok(res.body.total_steps > 0);
    });

    it('5. quick_sort executes correctly', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'quick_sort',
          input: { array: [10, 80, 30, 90, 40, 50, 70] },
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.algorithm, 'quick_sort');
      assert.strictEqual(res.body.category, 'sorting');
      assert.deepStrictEqual(res.body.final_result.final_array, [10, 30, 40, 50, 70, 80, 90]);
      assert.ok(res.body.total_steps > 0);
    });

    it('6. linear_search executes and returns found result', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'linear_search',
          input: { array: [10, 20, 80, 30, 60, 50], target: 30 },
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.algorithm, 'linear_search');
      assert.strictEqual(res.body.category, 'searching');
      assert.strictEqual(res.body.final_result.found, true);
      assert.strictEqual(res.body.final_result.result_index, 3);
      assert.ok(res.body.total_steps > 0);
    });

    it('7. binary_search executes and returns found result', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'binary_search',
          input: { array: [10, 20, 30, 40, 50], target: 40 },
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.algorithm, 'binary_search');
      assert.strictEqual(res.body.category, 'searching');
      assert.strictEqual(res.body.final_result.found, true);
      assert.strictEqual(res.body.final_result.result_index, 3);
      assert.ok(res.body.total_steps > 0);
    });

    it('8. stack executes push/top/pop operations', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'stack',
          input: {
            elements: [10, 20],
            operations: [
              { op: 'push', val: 30 },
              { op: 'top' },
              { op: 'pop' },
            ],
          },
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.algorithm, 'stack');
      assert.strictEqual(res.body.category, 'data_structures');
      assert.strictEqual(res.body.final_result.size, 2);
      assert.deepStrictEqual(res.body.final_result.elements, [10, 20]);
    });

    it('9. queue executes push/front/pop operations', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'queue',
          input: {
            elements: [10, 20],
            operations: [
              { op: 'push', val: 30 },
              { op: 'front' },
              { op: 'pop' },
            ],
          },
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.algorithm, 'queue');
      assert.strictEqual(res.body.category, 'data_structures');
      assert.strictEqual(res.body.final_result.size, 2);
      assert.deepStrictEqual(res.body.final_result.elements, [20, 30]);
    });

    it('10. linked_list executes push/search operations', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'linked_list',
          input: {
            elements: [1, 2],
            operations: [
              { op: 'push_front', val: 0 },
              { op: 'push_back', val: 3 },
              { op: 'search', val: 2 },
            ],
          },
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.algorithm, 'linked_list');
      assert.strictEqual(res.body.category, 'data_structures');
      assert.strictEqual(res.body.final_result.size, 4);
      assert.deepStrictEqual(res.body.final_result.elements, [0, 1, 2, 3]);
    });

    it('11. binary_tree executes from preorder tokens', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'binary_tree',
          input: {
            preorder: [1, 2, -1, -1, 3, -1, -1],
          },
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.algorithm, 'binary_tree');
      assert.strictEqual(res.body.category, 'trees');
      assert.strictEqual(res.body.final_result.count, 3);
      assert.deepStrictEqual(res.body.final_result.inorder, [2, 1, 3]);
    });

    it('12. bst executes batch insert and search target', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'bst',
          input: {
            values: [50, 30, 70, 20, 40],
            search_target: 40,
          },
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.algorithm, 'bst');
      assert.strictEqual(res.body.category, 'trees');
      assert.strictEqual(res.body.final_result.size, 5);
      assert.deepStrictEqual(res.body.final_result.inorder, [20, 30, 40, 50, 70]);
    });

    it('13. bfs executes traversal across graph', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'bfs',
          input: {
            vertices: 5,
            edges: [
              [0, 1],
              [0, 2],
              [1, 3],
              [2, 4],
            ],
            src: 0,
          },
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.algorithm, 'bfs');
      assert.strictEqual(res.body.category, 'graphs');
      assert.strictEqual(res.body.final_result.vertices, 5);
      assert.deepStrictEqual(res.body.final_result.traversal, [0, 1, 2, 3, 4]);
    });

    it('14. dfs executes traversal across graph', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'dfs',
          input: {
            vertices: 5,
            edges: [
              [0, 1],
              [0, 2],
              [1, 3],
              [2, 4],
            ],
            src: 0,
          },
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.algorithm, 'dfs');
      assert.strictEqual(res.body.category, 'graphs');
      assert.strictEqual(res.body.final_result.vertices, 5);
      assert.strictEqual(res.body.final_result.traversal[0], 0);
    });
  });

  // ==========================================================================
  // SECTION B: Strict Schema & Metadata Validation
  // ==========================================================================
  describe('B. Strict Schema & Metadata Validation', () => {
    it('returns 404 for unknown algorithm identifier', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'unknown_sort',
          input: { array: [1, 2, 3] },
        });

      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'ALGORITHM_NOT_FOUND');
    });

    it('returns 404 for disabled algorithm in SQLite', async () => {
      const db = getDatabase();
      db.prepare("UPDATE algorithms SET is_enabled = 0 WHERE id = 'bubble_sort'").run();

      try {
        const res = await request(app)
          .post('/api/visualize')
          .send({
            algorithm: 'bubble_sort',
            input: { array: [1, 2, 3] },
          });

        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.success, false);
        assert.strictEqual(res.body.error.code, 'ALGORITHM_NOT_FOUND');
      } finally {
        db.prepare("UPDATE algorithms SET is_enabled = 1 WHERE id = 'bubble_sort'").run();
      }
    });

    it('returns 400 when algorithm is missing', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          input: { array: [1, 2, 3] },
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
    });

    it('returns 400 when input is missing', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'bubble_sort',
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
    });

    it('returns 400 when sorting array exceeds 50 elements', async () => {
      const largeArr = Array.from({ length: 51 }, (_, i) => i + 1);
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'bubble_sort',
          input: { array: largeArr },
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
      assert.ok(res.body.error.message.includes('50'));
    });

    it('returns 400 when array integer exceeds 10000', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'bubble_sort',
          input: { array: [10001] },
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
      assert.ok(res.body.error.message.includes('10000'));
    });

    it('returns 400 when array integer is less than -10000', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'bubble_sort',
          input: { array: [-10001] },
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
      assert.ok(res.body.error.message.includes('-10000'));
    });

    it('returns 400 when search target is missing', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'linear_search',
          input: { array: [1, 2, 3] },
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
    });

    it('returns 400 when graph vertices exceed 30', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'bfs',
          input: { vertices: 31, edges: [] },
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
      assert.ok(res.body.error.message.includes('30'));
    });

    it('returns 400 when graph vertices is less than 1', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'bfs',
          input: { vertices: 0, edges: [] },
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
    });

    it('returns 400 when graph src is outside 0..V-1', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'bfs',
          input: { vertices: 5, edges: [], src: 5 },
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
      assert.ok(res.body.error.message.includes('src'));
    });

    it('returns 400 when graph edge endpoint is outside 0..V-1', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'bfs',
          input: { vertices: 4, edges: [[0, 4]], src: 0 },
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
    });

    it('returns 400 when graph edges exceed 100', async () => {
      const edges = Array.from({ length: 101 }, () => [0, 1]);
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'bfs',
          input: { vertices: 5, edges, src: 0 },
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
      assert.ok(res.body.error.message.includes('100'));
    });

    it('returns 400 when binary tree preorder tokens exceed 63', async () => {
      const preorder = Array.from({ length: 64 }, () => 1);
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'binary_tree',
          input: { preorder },
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
      assert.ok(res.body.error.message.includes('63'));
    });

    it('returns 400 when BST values exceed 30', async () => {
      const values = Array.from({ length: 31 }, (_, i) => i + 1);
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'bst',
          input: { values },
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
      assert.ok(res.body.error.message.includes('30'));
    });

    it('returns 400 when operations exceed 50', async () => {
      const operations = Array.from({ length: 51 }, () => ({ op: 'pop' as const }));
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'stack',
          input: { operations },
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
      assert.ok(res.body.error.message.includes('50'));
    });

    it('returns 400 when options mode is invalid', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'bubble_sort',
          input: { array: [1, 2] },
          options: { mode: 'invalid_mode' },
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
    });

    it('returns 400 when unexpected options key is supplied', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'bubble_sort',
          input: { array: [1, 2] },
          options: { mode: 'auto', unexpected_key: true },
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
    });

    it('returns 400 when unexpected root key is supplied', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'bubble_sort',
          input: { array: [1, 2] },
          unexpected_root: 123,
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
    });
  });

  // ==========================================================================
  // SECTION C: Runner Safety & Limits
  // ==========================================================================
  describe('C. Runner Safety & Limits', () => {
    it('returns 429 when concurrency limit of 20 processes is reached', async () => {
      setMockActiveProcessesForTesting(20);
      try {
        const res = await request(app)
          .post('/api/visualize')
          .send({
            algorithm: 'bubble_sort',
            input: { array: [1, 2, 3] },
          });

        assert.strictEqual(res.status, 429);
        assert.strictEqual(res.body.success, false);
        assert.strictEqual(res.body.error.code, 'CONCURRENCY_LIMIT_EXCEEDED');
      } finally {
        resetConcurrencyForTesting();
      }
    });

    it('returns 503 when engine binary is missing or inaccessible', () => {
      assert.throws(
        () => verifyEngineBinary('non_existent_engine_path.exe'),
        (err: any) => err instanceof ServiceUnavailableError && err.statusCode === 503
      );
    });

    it('runner enforces timeout and rejects with EngineTimeoutError', async () => {
      await assert.rejects(
        async () => {
          await runEngine(
            { algorithm: 'bubble_sort', input: { array: [5, 4, 3, 2, 1] } },
            { timeoutMs: 1 } // Triggers immediately before engine finishes
          );
        },
        (err: any) => err instanceof EngineTimeoutError && err.statusCode === 504
      );
    });

    it('runner enforces stdout byte limit during streaming', async () => {
      await assert.rejects(
        async () => {
          await runEngine(
            { algorithm: 'bubble_sort', input: { array: [5, 4, 3, 2, 1] } },
            { maxStdoutBytes: 50 } // Tiny byte cap exceeded on first chunk
          );
        },
        (err: any) => err instanceof OutputLimitExceededError && err.statusCode === 500
      );
    });
  });

  // ==========================================================================
  // SECTION D: Failure Path & Error Status Mapping (Test Doubles)
  // ==========================================================================
  describe('D. Failure Path & Error Status Mapping (Test Doubles)', () => {
    function createTestApp(mockRunner: (payload: any) => Promise<any>) {
      const testApp = express();
      testApp.use(express.json());
      const controller = new VisualizeController(new AlgorithmRepository(), mockRunner);
      testApp.post('/api/visualize', controller.handleVisualize);
      return testApp;
    }

    it('returns 422 ENGINE_DOMAIN_ERROR when engine returns domain failure', async () => {
      const testApp = createTestApp(async () => ({
        success: false,
        error: 'Engine domain rejection: invalid tree topology',
        total_steps: 0,
        events: [],
      }));

      const res = await request(testApp)
        .post('/api/visualize')
        .send({
          algorithm: 'binary_tree',
          input: { preorder: [1, -1, -1] },
        });

      assert.strictEqual(res.status, 422);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'ENGINE_DOMAIN_ERROR');
      assert.strictEqual(res.body.error.message, 'Engine domain rejection: invalid tree topology');
    });

    it('returns 504 ENGINE_TIMEOUT via HTTP when runner times out', async () => {
      const testApp = createTestApp(async () => {
        throw new EngineTimeoutError('Execution exceeded 3000ms');
      });

      const res = await request(testApp)
        .post('/api/visualize')
        .send({
          algorithm: 'bubble_sort',
          input: { array: [1, 2] },
        });

      assert.strictEqual(res.status, 504);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'ENGINE_TIMEOUT');
    });

    it('returns 500 OUTPUT_LIMIT_EXCEEDED via HTTP when runner exceeds byte limit', async () => {
      const testApp = createTestApp(async () => {
        throw new OutputLimitExceededError('Stdout exceeded 5MB');
      });

      const res = await request(testApp)
        .post('/api/visualize')
        .send({
          algorithm: 'bubble_sort',
          input: { array: [1, 2] },
        });

      assert.strictEqual(res.status, 500);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'OUTPUT_LIMIT_EXCEEDED');
    });

    it('returns 500 ENGINE_EXECUTION_ERROR via HTTP on unexpected engine crash', async () => {
      const testApp = createTestApp(async () => {
        throw new EngineExecutionError();
      });

      const res = await request(testApp)
        .post('/api/visualize')
        .send({
          algorithm: 'bubble_sort',
          input: { array: [1, 2] },
        });

      assert.strictEqual(res.status, 500);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'ENGINE_EXECUTION_ERROR');
    });

    it('returns 503 SERVICE_UNAVAILABLE via HTTP when engine binary is unavailable', async () => {
      const testApp = createTestApp(async () => {
        throw new ServiceUnavailableError();
      });

      const res = await request(testApp)
        .post('/api/visualize')
        .send({
          algorithm: 'bubble_sort',
          input: { array: [1, 2] },
        });

      assert.strictEqual(res.status, 503);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'SERVICE_UNAVAILABLE');
    });
  });

  // ==========================================================================
  // SECTION E: Security & Boundary Verification
  // ==========================================================================
  describe('E. Security & Boundary Verification', () => {
    it('treats shell metacharacters as pure data without command execution', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'bubble_sort; echo vulnerable',
          input: { array: [1, 2] },
        });

      // Must fail whitelist check cleanly with 404, never executing shell command
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'ALGORITHM_NOT_FOUND');
    });

    it('rejects path traversal strings as algorithm IDs', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: '../../../etc/passwd',
          input: { array: [1, 2] },
        });

      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'ALGORITHM_NOT_FOUND');
    });

    it('never discloses absolute filesystem paths or OS errors in API responses', async () => {
      const res = await request(app)
        .post('/api/visualize')
        .send({
          algorithm: 'nonexistent_algo',
          input: {},
        });

      const bodyStr = JSON.stringify(res.body);
      assert.strictEqual(bodyStr.includes('algoviz-engine'), false);
      assert.strictEqual(bodyStr.includes('Users'), false);
      assert.strictEqual(bodyStr.includes('Desktop'), false);
      assert.strictEqual(bodyStr.includes('node_modules'), false);
    });
  });
});
