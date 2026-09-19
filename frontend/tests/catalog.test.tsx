import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from '../src/routes';
import { ThemeProvider } from '../src/context/ThemeContext';
import { ErrorBoundary } from '../src/components/common/ErrorBoundary';
import { AlgorithmDTO } from '../src/types/algorithm';

const MOCK_14_ALGORITHMS: AlgorithmDTO[] = [
  {
    id: 'bubble_sort',
    name: 'Bubble Sort',
    category: 'sorting',
    description: 'Compares and swaps adjacent elements repeatedly.',
    complexity: { time: { best: 'O(n)', average: 'O(n^2)', worst: 'O(n^2)' }, space: 'O(1)' },
    input_type: 'array',
    display_order: 1,
  },
  {
    id: 'selection_sort',
    name: 'Selection Sort',
    category: 'sorting',
    description: 'Finds minimum element in unsorted subarray.',
    complexity: { time: { best: 'O(n^2)', average: 'O(n^2)', worst: 'O(n^2)' }, space: 'O(1)' },
    input_type: 'array',
    display_order: 2,
  },
  {
    id: 'insertion_sort',
    name: 'Insertion Sort',
    category: 'sorting',
    description: 'Inserts each element into its sorted position.',
    complexity: { time: { best: 'O(n)', average: 'O(n^2)', worst: 'O(n^2)' }, space: 'O(1)' },
    input_type: 'array',
    display_order: 3,
  },
  {
    id: 'merge_sort',
    name: 'Merge Sort',
    category: 'sorting',
    description: 'Divide and conquer sorting algorithm.',
    complexity: { time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' }, space: 'O(n)' },
    input_type: 'array',
    display_order: 4,
  },
  {
    id: 'quick_sort',
    name: 'Quick Sort',
    category: 'sorting',
    description: 'Partition-based sorting algorithm using a pivot.',
    complexity: { time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n^2)' }, space: 'O(log n)' },
    input_type: 'array',
    display_order: 5,
  },
  {
    id: 'linear_search',
    name: 'Linear Search',
    category: 'searching',
    description: 'Sequential search through an array.',
    complexity: { time: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' }, space: 'O(1)' },
    input_type: 'array_and_target',
    display_order: 6,
  },
  {
    id: 'binary_search',
    name: 'Binary Search',
    category: 'searching',
    description: 'Logarithmic search on a sorted array.',
    complexity: { time: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' }, space: 'O(1)' },
    input_type: 'array_and_target',
    display_order: 7,
  },
  {
    id: 'stack',
    name: 'Stack',
    category: 'data_structures',
    description: 'Last-In First-Out (LIFO) data structure.',
    complexity: { time: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' }, space: 'O(n)' },
    input_type: 'data_structure_ops',
    display_order: 8,
  },
  {
    id: 'queue',
    name: 'Queue',
    category: 'data_structures',
    description: 'First-In First-Out (FIFO) linked-node data structure.',
    complexity: { time: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' }, space: 'O(n)' },
    input_type: 'data_structure_ops',
    display_order: 9,
  },
  {
    id: 'linked_list',
    name: 'Linked List',
    category: 'data_structures',
    description: 'Linear collection of node elements with pointers.',
    complexity: { time: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' }, space: 'O(n)' },
    input_type: 'data_structure_ops',
    display_order: 10,
  },
  {
    id: 'binary_tree',
    name: 'Binary Tree',
    category: 'trees',
    description: 'Hierarchical tree structure with at most two children per node.',
    complexity: { time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' }, space: 'O(h)' },
    input_type: 'tree_preorder',
    display_order: 11,
  },
  {
    id: 'bst',
    name: 'Binary Search Tree',
    category: 'trees',
    description: 'Binary tree with left smaller and right larger invariant.',
    complexity: { time: { best: 'O(log n)', average: 'O(log n)', worst: 'O(n)' }, space: 'O(n)' },
    input_type: 'bst_values',
    display_order: 12,
  },
  {
    id: 'bfs',
    name: 'Breadth-First Search (BFS)',
    category: 'graphs',
    description: 'Level-order graph traversal using a queue.',
    complexity: { time: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' }, space: 'O(V)' },
    input_type: 'graph_edges',
    display_order: 13,
  },
  {
    id: 'dfs',
    name: 'Depth-First Search (DFS)',
    category: 'graphs',
    description: 'Recursive graph traversal exploring as deep as possible.',
    complexity: { time: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' }, space: 'O(V)' },
    input_type: 'graph_edges',
    display_order: 14,
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

describe('Phase 10C Catalog & API Integration Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. successfully loads algorithm list and renders all 14 algorithms in display_order', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: MOCK_14_ALGORITHMS,
      }),
    });

    renderWithRouter('/catalog');

    // Check loading indicator appears initially
    expect(screen.getByRole('status', { name: /Loading algorithms/i })).toBeInTheDocument();

    // Await all 14 algorithms rendered
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Verify all 14 algorithms appear on page
    for (const algo of MOCK_14_ALGORITHMS) {
      expect(screen.getByRole('heading', { name: algo.name })).toBeInTheDocument();
      expect(screen.getByText(algo.description)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(`#${algo.display_order}\\b`))).toBeInTheDocument();
    }

    // Verify links to visualizer
    const links = screen.getAllByRole('link', { name: /Open Visualizer/i });
    expect(links.length).toBe(14);
    expect(links[0].getAttribute('href')).toBe('/visualize/bubble_sort');
  });

  it('2. groups algorithms by backend category with counts and category pills', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: MOCK_14_ALGORITHMS,
      }),
    });

    renderWithRouter('/catalog');

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Verify category headings
    expect(screen.getByRole('heading', { name: /Sorting Algorithms/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Searching Algorithms/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Data Structures/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Tree Structures/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Graph Algorithms/i })).toBeInTheDocument();

    // Verify filtering by category
    const sortingTab = screen.getByRole('tab', { name: /Sorting Algorithms \(5\)/i });
    fireEvent.click(sortingTab);

    // Only sorting algorithms should now be displayed
    expect(screen.getByRole('heading', { name: 'Bubble Sort' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Breadth-First Search (BFS)' })).not.toBeInTheDocument();
  });

  it('3. displays detailed complexity metrics for each algorithm in catalog', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: MOCK_14_ALGORITHMS,
      }),
    });

    renderWithRouter('/catalog');

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Check complexity values
    expect(screen.getAllByText('O(n^2)').length).toBeGreaterThan(0);
    expect(screen.getAllByText('O(n log n)').length).toBeGreaterThan(0);
    expect(screen.getAllByText('O(1)').length).toBeGreaterThan(0);
  });

  it('4. loads algorithm detail on VisualizerPage via /api/algorithms/:id', async () => {
    const bubbleSortDetail = MOCK_14_ALGORITHMS[0];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: bubbleSortDetail,
      }),
    });

    renderWithRouter('/visualize/bubble_sort');

    // Loading indicator
    expect(screen.getByRole('status')).toBeInTheDocument();

    // Await metadata loaded
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Verify detail shell contents
    expect(screen.getByRole('heading', { name: 'Bubble Sort' })).toBeInTheDocument();
    expect(screen.getByText(bubbleSortDetail.description)).toBeInTheDocument();
    expect(screen.getByText('O(n)')).toBeInTheDocument(); // best time
    expect(screen.getByText('array')).toBeInTheDocument(); // input type
    expect(screen.getByText(/Visualization Workspace/i)).toBeInTheDocument();
  });

  it('5. renders safe error state on API failure with retry capability', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network disconnected'));

    renderWithRouter('/catalog');

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText(/Unable to Load Catalog/i)).toBeInTheDocument();
    expect(screen.getByText(/Unable to connect to the server/i)).toBeInTheDocument();

    // Mock recovery for retry
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: MOCK_14_ALGORITHMS,
      }),
    });

    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: 'Bubble Sort' })).toBeInTheDocument();
  });

  it('6. renders safe 404 error state on unknown algorithm in VisualizerPage', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: "Algorithm 'nonexistent_algo' not found",
        },
      }),
    });

    renderWithRouter('/visualize/nonexistent_algo');

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: /Algorithm Not Found/i })).toBeInTheDocument();
    expect(screen.getByText(/Algorithm 'nonexistent_algo' not found/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Return to Catalog/i })).toBeInTheDocument();
  });
});
