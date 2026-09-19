import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GraphVisualizer } from '../src/components/visualizer/GraphVisualizer';
import { VisualizerInputForm } from '../src/components/visualizer/VisualizerInputForm';
import { EngineEvent } from '../src/types/engine';

describe('GraphVisualizer Component Tests', () => {
  describe('BFS Graph Visualizer', () => {
    it('renders vertices, edges, BFS queue with FRONT badge, and visited status grid', () => {
      const bfsEvent: EngineEvent = {
        step_index: 3,
        action: 'BFS_VISIT',
        message: 'Visiting vertex 1',
        canonical_duration_ms: 800,
        active_indices: [0, 1],
        array_state: [],
        tree_state: [],
        graph_adj: [
          [1, 2],
          [0, 3],
          [0, 3],
          [1, 2],
        ],
        graph_traversal: [0, 1],
        graph_queue: [2, 3],
        graph_visited: [true, true, false, false],
        current_vertex: 1,
        sorted_boundary: -1,
        range_st: -1,
        range_end: -1,
        range_mid: -1,
        pivot_idx: -1,
        pivot_val: 0,
        stats: { vertices: 4, edges: 4 },
      };

      render(<GraphVisualizer currentEvent={bfsEvent} algorithmId="bfs" />);

      expect(screen.getByTestId('graph-visualizer')).toBeInTheDocument();
      expect(screen.getByText('Graph Breadth-First Search (BFS)')).toBeInTheDocument();
      expect(screen.getByTestId('graph-vertex-count')).toHaveTextContent('Vertices: 4 | Edges: 4');

      // Check active vertex 1
      const v1Circle = screen.getByTestId('graph-vertex-circle-1');
      expect(v1Circle).toHaveClass('vertex-current');
      expect(screen.getByText('ACTIVE')).toBeInTheDocument();

      // Check visited vertex 0
      const v0Circle = screen.getByTestId('graph-vertex-circle-0');
      expect(v0Circle).toHaveClass('vertex-visited');

      // Check queued vertex 2
      const v2Circle = screen.getByTestId('graph-vertex-circle-2');
      expect(v2Circle).toHaveClass('vertex-queued');

      // Check BFS Queue panel (FIFO)
      expect(screen.getByText('Active BFS Queue (FIFO)')).toBeInTheDocument();
      expect(screen.getByTestId('queue-chip-2')).toBeInTheDocument();
      expect(screen.getByText('(FRONT)')).toBeInTheDocument();

      // Check Traversal sequence
      expect(screen.getByTestId('traversal-chip-0')).toHaveTextContent('0');
      expect(screen.getByTestId('traversal-chip-1')).toHaveTextContent('1');

      // Check Visited Status Grid
      expect(screen.getByTestId('visited-cell-0')).toHaveClass('cell-visited');
      expect(screen.getByTestId('visited-cell-1')).toHaveClass('cell-visited');
      expect(screen.getByTestId('visited-cell-2')).toHaveClass('cell-unvisited');
      expect(screen.getByTestId('visited-cell-3')).toHaveClass('cell-unvisited');
    });
  });

  describe('DFS Graph Visualizer', () => {
    it('renders DFS call stack with TOP badge and active edge highlight', () => {
      const dfsEvent: EngineEvent = {
        step_index: 4,
        action: 'DFS_ENTER',
        message: 'Entering DFS for vertex 3 from vertex 1',
        canonical_duration_ms: 800,
        active_indices: [1, 3],
        array_state: [],
        tree_state: [],
        graph_adj: [
          [1],
          [0, 3],
          [],
          [1],
        ],
        graph_traversal: [0, 1, 3],
        graph_queue: [0, 1, 3],
        graph_visited: [true, true, false, true],
        current_vertex: 3,
        sorted_boundary: -1,
        range_st: -1,
        range_end: -1,
        range_mid: -1,
        pivot_idx: -1,
        pivot_val: 0,
        stats: { vertices: 4, edges: 2 },
      };

      render(<GraphVisualizer currentEvent={dfsEvent} algorithmId="dfs" />);

      expect(screen.getByText('Graph Depth-First Search (DFS)')).toBeInTheDocument();

      // Check Call stack panel (LIFO)
      expect(screen.getByText('Active Call Stack (LIFO)')).toBeInTheDocument();
      const topChip = screen.getByTestId('queue-chip-3');
      expect(topChip).toBeInTheDocument();
      expect(screen.getByText('(TOP)')).toBeInTheDocument();

      // Check active edge between 1 and 3
      const activeEdge = screen.getByTestId('graph-edge-1-3');
      expect(activeEdge).toHaveClass('edge-active');
    });

    it('renders self-loops on vertices correctly', () => {
      const loopEvent: EngineEvent = {
        step_index: 1,
        action: 'INITIAL',
        message: 'Graph initialized with self loop',
        canonical_duration_ms: 0,
        active_indices: [],
        array_state: [],
        tree_state: [],
        graph_adj: [
          [0, 1],
          [0],
        ],
        graph_traversal: [],
        graph_queue: [],
        graph_visited: [false, false],
        current_vertex: -1,
        sorted_boundary: -1,
        range_st: -1,
        range_end: -1,
        range_mid: -1,
        pivot_idx: -1,
        pivot_val: 0,
        stats: { vertices: 2, edges: 2 },
      };

      render(<GraphVisualizer currentEvent={loopEvent} algorithmId="dfs" />);

      // Vertex 0 has self-loop (0-0)
      const loopElement = screen.getByTestId('graph-edge-0-0');
      expect(loopElement).toHaveClass('graph-edge-loop');
    });
  });

  describe('Graph Input Form Interactions', () => {
    it('switches presets and submits parsed vertices, edges, and src', () => {
      const onSubmit = vi.fn();
      render(
        <VisualizerInputForm
          algorithmId="bfs"
          category="graphs"
          isLoading={false}
          onSubmit={onSubmit}
        />
      );

      const cyclicPreset = screen.getByRole('button', { name: /Cycle with Self-Loop/i });
      fireEvent.click(cyclicPreset);

      const verticesInput = screen.getByLabelText(/Graph Vertices/i) as HTMLInputElement;
      expect(verticesInput.value).toBe('4');

      const submitBtn = screen.getByRole('button', { name: /Run Visualization/i });
      fireEvent.click(submitBtn);

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const payload = onSubmit.mock.calls[0][0];
      expect(payload.vertices).toBe(4);
      expect(payload.edges).toEqual([[0, 1], [1, 2], [2, 0], [2, 2]]);
      expect(payload.src).toBe(0);
    });

    it('validates start vertex within [0, vertices - 1]', () => {
      const onSubmit = vi.fn();
      render(
        <VisualizerInputForm
          algorithmId="bfs"
          category="graphs"
          isLoading={false}
          onSubmit={onSubmit}
        />
      );

      const startInput = screen.getByLabelText(/Source Vertex/i);
      fireEvent.change(startInput, { target: { value: '99' } });

      const submitBtn = screen.getByRole('button', { name: /Run Visualization/i });
      fireEvent.click(submitBtn);

      expect(screen.getByRole('alert')).toHaveTextContent(/Source vertex must be between 0 and 4/i);
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('validates edge format in edge list textarea', () => {
      const onSubmit = vi.fn();
      render(
        <VisualizerInputForm
          algorithmId="dfs"
          category="graphs"
          isLoading={false}
          onSubmit={onSubmit}
        />
      );

      const edgeArea = screen.getByLabelText(/Graph Edges/i);
      fireEvent.change(edgeArea, { target: { value: 'invalid-edge' } });

      const submitBtn = screen.getByRole('button', { name: /Run Visualization/i });
      fireEvent.click(submitBtn);

      expect(screen.getByRole('alert')).toHaveTextContent(/Edge endpoints in 'invalid-edge' must be integers/i);
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});
