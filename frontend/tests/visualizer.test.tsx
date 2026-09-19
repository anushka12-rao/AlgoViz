import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from '../src/routes';
import { ThemeProvider } from '../src/context/ThemeContext';
import { ErrorBoundary } from '../src/components/common/ErrorBoundary';
import { visualizeAlgorithm } from '../src/api/visualize.api';
import { ArrayVisualizer } from '../src/components/visualizer/ArrayVisualizer';
import { SearchVisualizer } from '../src/components/visualizer/SearchVisualizer';
import { VisualizerInputForm } from '../src/components/visualizer/VisualizerInputForm';
import { EngineEvent, EngineSuccessResponse } from '../src/types/engine';
import { AlgorithmDTO } from '../src/types/algorithm';

const MOCK_BUBBLE_ALGO: AlgorithmDTO = {
  id: 'bubble_sort',
  name: 'Bubble Sort',
  category: 'sorting',
  description: 'Compares and swaps adjacent elements repeatedly.',
  complexity: { time: { best: 'O(n)', average: 'O(n^2)', worst: 'O(n^2)' }, space: 'O(1)' },
  input_type: 'array',
  display_order: 1,
};

const MOCK_BUBBLE_EVENTS: EngineEvent[] = [
  {
    step_index: 1,
    action: 'INITIAL',
    message: 'Initial array state',
    canonical_duration_ms: 0,
    active_indices: [],
    array_state: [3, 1, 2],
    tree_state: [],
    graph_adj: [],
    graph_traversal: [],
    graph_queue: [],
    graph_visited: [],
    current_vertex: -1,
    sorted_boundary: -1,
    range_st: -1,
    range_end: -1,
    range_mid: -1,
    pivot_idx: -1,
    pivot_val: 0,
    stats: {},
  },
  {
    step_index: 2,
    action: 'COMPARE',
    message: 'Comparing indices 0 and 1: 3 and 1',
    canonical_duration_ms: 0,
    active_indices: [0, 1],
    array_state: [3, 1, 2],
    tree_state: [],
    graph_adj: [],
    graph_traversal: [],
    graph_queue: [],
    graph_visited: [],
    current_vertex: -1,
    sorted_boundary: -1,
    range_st: -1,
    range_end: -1,
    range_mid: -1,
    pivot_idx: -1,
    pivot_val: 0,
    stats: { comparisons: 1 },
  },
  {
    step_index: 3,
    action: 'SWAP',
    message: 'Swapping 1 and 3',
    canonical_duration_ms: 800,
    active_indices: [0, 1],
    array_state: [1, 3, 2],
    tree_state: [],
    graph_adj: [],
    graph_traversal: [],
    graph_queue: [],
    graph_visited: [],
    current_vertex: -1,
    sorted_boundary: -1,
    range_st: -1,
    range_end: -1,
    range_mid: -1,
    pivot_idx: -1,
    pivot_val: 0,
    stats: { comparisons: 1, swaps: 1 },
  },
  {
    step_index: 4,
    action: 'COMPLETE',
    message: 'Bubble Sort Complete',
    canonical_duration_ms: 0,
    active_indices: [],
    array_state: [1, 2, 3],
    tree_state: [],
    graph_adj: [],
    graph_traversal: [],
    graph_queue: [],
    graph_visited: [],
    current_vertex: -1,
    sorted_boundary: 0,
    range_st: -1,
    range_end: -1,
    range_mid: -1,
    pivot_idx: -1,
    pivot_val: 0,
    stats: { comparisons: 2, swaps: 1 },
  },
];

const MOCK_BINARY_SEARCH_EVENTS: EngineEvent[] = [
  {
    step_index: 1,
    action: 'SEARCH_START',
    message: 'Starting binary search for target 40',
    canonical_duration_ms: 0,
    active_indices: [],
    array_state: [10, 20, 30, 40, 50],
    tree_state: [],
    graph_adj: [],
    graph_traversal: [],
    graph_queue: [],
    graph_visited: [],
    current_vertex: -1,
    sorted_boundary: -1,
    range_st: -1,
    range_end: -1,
    range_mid: -1,
    pivot_idx: -1,
    pivot_val: 40,
    stats: {},
  },
  {
    step_index: 2,
    action: 'STEP',
    message: 'Evaluating window [st=0, mid=2, end=4]',
    canonical_duration_ms: 0,
    active_indices: [2],
    array_state: [10, 20, 30, 40, 50],
    tree_state: [],
    graph_adj: [],
    graph_traversal: [],
    graph_queue: [],
    graph_visited: [],
    current_vertex: -1,
    sorted_boundary: -1,
    range_st: 0,
    range_end: 4,
    range_mid: 2,
    pivot_idx: -1,
    pivot_val: 40,
    stats: { comparisons: 1 },
  },
  {
    step_index: 3,
    action: 'MATCH',
    message: 'Match found! Target (40) equals mid element (40)',
    canonical_duration_ms: 800,
    active_indices: [3],
    array_state: [10, 20, 30, 40, 50],
    tree_state: [],
    graph_adj: [],
    graph_traversal: [],
    graph_queue: [],
    graph_visited: [],
    current_vertex: -1,
    sorted_boundary: -1,
    range_st: 3,
    range_end: 4,
    range_mid: 3,
    pivot_idx: 3,
    pivot_val: 40,
    stats: { comparisons: 2 },
  },
  {
    step_index: 4,
    action: 'COMPLETE',
    message: 'Found target at index 3',
    canonical_duration_ms: 0,
    active_indices: [],
    array_state: [10, 20, 30, 40, 50],
    tree_state: [],
    graph_adj: [],
    graph_traversal: [],
    graph_queue: [],
    graph_visited: [],
    current_vertex: -1,
    sorted_boundary: -1,
    range_st: -1,
    range_end: -1,
    range_mid: -1,
    pivot_idx: 3,
    pivot_val: 40,
    stats: { comparisons: 2 },
  },
];

function renderWithRouter(initialEntry: string) {
  const router = createMemoryRouter(routes, {
    initialEntries: [initialEntry],
  });

  return render(
    <ErrorBoundary>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

describe('Phase 10D Visualizers & Integration Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. API Layer Tests (POST /api/visualize)', () => {
    it('successfully posts to /api/visualize and receives engine success envelope', async () => {
      const mockSuccess: EngineSuccessResponse = {
        success: true,
        algorithm: 'bubble_sort',
        category: 'sorting',
        total_steps: 4,
        final_result: { final_array: [1, 2, 3] },
        events: MOCK_BUBBLE_EVENTS,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockSuccess,
      });

      const res = await visualizeAlgorithm({
        algorithm: 'bubble_sort',
        input: { array: [3, 1, 2] },
      });

      expect(res.success).toBe(true);
      expect(res.algorithm).toBe('bubble_sort');
      expect(res.total_steps).toBe(4);
      expect(res.events.length).toBe(4);
    });

    it('handles HTTP error safely through sanitized ApiError', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: "Array cannot exceed maximum safety limit of 50 elements",
          },
        }),
      });

      await expect(
        visualizeAlgorithm({
          algorithm: 'bubble_sort',
          input: { array: [1, 2, 3] },
        })
      ).rejects.toThrow(/Array cannot exceed maximum safety limit/);
    });
  });

  describe('2. ArrayVisualizer Component Tests', () => {
    it('renders bars reflecting current array_state and active_indices', () => {
      const compareEvent = MOCK_BUBBLE_EVENTS[1]; // active_indices: [0, 1]
      render(<ArrayVisualizer currentEvent={compareEvent} algorithmId="bubble_sort" />);

      expect(screen.getByLabelText(/Index 0, Value 3, currently active/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Index 1, Value 1, currently active/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Index 2, Value 2/i)).toBeInTheDocument();
    });

    it('renders quick sort pivot and range metadata when present', () => {
      const pivotEvent: EngineEvent = {
        step_index: 5,
        action: 'PARTITION_START',
        message: 'Partitioning with pivot 3',
        canonical_duration_ms: 0,
        active_indices: [2],
        array_state: [1, 2, 3],
        tree_state: [],
        graph_adj: [],
        graph_traversal: [],
        graph_queue: [],
        graph_visited: [],
        current_vertex: -1,
        sorted_boundary: -1,
        range_st: 0,
        range_end: 2,
        range_mid: -1,
        pivot_idx: 2,
        pivot_val: 3,
        stats: {},
      };

      render(<ArrayVisualizer currentEvent={pivotEvent} algorithmId="quick_sort" />);
      expect(screen.getByText(/Pivot \/ Key: Index 2 \(3\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Active Subarray: \[0\.\.\.2\]/i)).toBeInTheDocument();
    });
  });

  describe('3. SearchVisualizer Component Tests', () => {
    it('renders linear search elements, target value, and matched state', () => {
      const matchEvent: EngineEvent = {
        step_index: 3,
        action: 'MATCH',
        message: 'Element found at index 1',
        canonical_duration_ms: 700,
        active_indices: [1],
        array_state: [10, 20, 30],
        tree_state: [],
        graph_adj: [],
        graph_traversal: [],
        graph_queue: [],
        graph_visited: [],
        current_vertex: -1,
        sorted_boundary: -1,
        range_st: -1,
        range_end: -1,
        range_mid: -1,
        pivot_idx: 1,
        pivot_val: 20,
        stats: { comparisons: 2 },
      };

      render(<SearchVisualizer currentEvent={matchEvent} algorithmId="linear_search" />);
      expect(screen.getByText('20', { selector: '.badge-primary' })).toBeInTheDocument();
      expect(screen.getByLabelText(/Index 1, value 20, active inspection/i)).toBeInTheDocument();
    });

    it('renders binary search window markers and midpoint indicator', () => {
      const stepEvent = MOCK_BINARY_SEARCH_EVENTS[1]; // range_st: 0, mid: 2, end: 4
      render(<SearchVisualizer currentEvent={stepEvent} algorithmId="binary_search" />);

      expect(screen.getByText('MID')).toBeInTheDocument();
      expect(screen.getByText('ST')).toBeInTheDocument();
      expect(screen.getByText('END')).toBeInTheDocument();
      expect(screen.getByText(/\[st=0, mid=2, end=4\]/i)).toBeInTheDocument();
    });
  });

  describe('4. VisualizerInputForm Component Tests', () => {
    it('switches input values on preset button click', () => {
      const onSubmit = vi.fn();
      render(
        <VisualizerInputForm
          algorithmId="bubble_sort"
          category="sorting"
          isLoading={false}
          onSubmit={onSubmit}
        />
      );

      const reversePresetBtn = screen.getByRole('button', { name: /Reverse Sorted/i });
      fireEvent.click(reversePresetBtn);

      const input = screen.getByLabelText(/Array Elements/i) as HTMLInputElement;
      expect(input.value).toBe('50, 40, 30, 20, 10');
    });

    it('shows educational notice for unsorted input on binary search', () => {
      render(
        <VisualizerInputForm
          algorithmId="binary_search"
          category="searching"
          isLoading={false}
          onSubmit={vi.fn()}
        />
      );

      const unsortedPreset = screen.getByRole('button', { name: /Unsorted Input/i });
      fireEvent.click(unsortedPreset);

      expect(
        screen.getByText(/Binary search runs on the engine's sorted copy of the input/i)
      ).toBeInTheDocument();
    });

    it('validates against empty input and blocks submission', () => {
      const onSubmit = vi.fn();
      render(
        <VisualizerInputForm
          algorithmId="bubble_sort"
          category="sorting"
          isLoading={false}
          onSubmit={onSubmit}
        />
      );

      const input = screen.getByLabelText(/Array Elements/i);
      fireEvent.change(input, { target: { value: '' } });

      const submitBtn = screen.getByRole('button', { name: /Run Visualization/i });
      fireEvent.click(submitBtn);

      expect(screen.getByRole('alert')).toHaveTextContent(/Please provide at least 1 integer element/i);
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('5. VisualizerPage Interactive End-to-End Tests', () => {
    it('loads metadata, submits visualization request, and renders playback workspace', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.endsWith('/algorithms/bubble_sort')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ success: true, data: MOCK_BUBBLE_ALGO }),
          });
        }
        if (url.endsWith('/visualize')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              success: true,
              algorithm: 'bubble_sort',
              category: 'sorting',
              total_steps: 4,
              final_result: { final_array: [1, 2, 3] },
              events: MOCK_BUBBLE_EVENTS,
            }),
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      renderWithRouter('/visualize/bubble_sort');

      // Await metadata loaded
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Bubble Sort' })).toBeInTheDocument();
      });

      // Verify input form & presets rendered
      expect(screen.getByRole('button', { name: /Random \(10\)/i })).toBeInTheDocument();

      // Click "Run Visualization"
      const runBtn = screen.getByRole('button', { name: /Run Visualization/i });
      fireEvent.click(runBtn);

      // Await visualizer workspace loaded
      await waitFor(() => {
        expect(screen.getByText('Initial array state')).toBeInTheDocument();
      });

      // Verify step forward button advances step
      const stepFwdBtn = screen.getByRole('button', { name: /Step forward/i });
      fireEvent.click(stepFwdBtn);

      expect(screen.getByText(/Comparing indices 0 and 1/i)).toBeInTheDocument();

      // Verify restart button resets to step 1
      const restartBtn = screen.getByRole('button', { name: /Restart to step 0/i });
      fireEvent.click(restartBtn);

      expect(screen.getByText('Initial array state')).toBeInTheDocument();
    });

    it('renders safe error banner when engine visualization request fails', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.endsWith('/algorithms/bubble_sort')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ success: true, data: MOCK_BUBBLE_ALGO }),
          });
        }
        if (url.endsWith('/visualize')) {
          return Promise.resolve({
            ok: false,
            status: 504,
            json: async () => ({
              success: false,
              error: { code: 'ENGINE_TIMEOUT', message: 'Algorithm execution exceeded time limit' },
            }),
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      renderWithRouter('/visualize/bubble_sort');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Bubble Sort' })).toBeInTheDocument();
      });

      const runBtn = screen.getByRole('button', { name: /Run Visualization/i });
      fireEvent.click(runBtn);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      expect(screen.getByText(/Algorithm execution exceeded time limit/i)).toBeInTheDocument();
    });
  });
});
