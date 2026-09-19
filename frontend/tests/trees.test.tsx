import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TreeVisualizer } from '../src/components/visualizer/TreeVisualizer';
import { VisualizerInputForm } from '../src/components/visualizer/VisualizerInputForm';
import { EngineEvent, TreeNodeRecord } from '../src/types/engine';

const SAMPLE_TREE_STATE: TreeNodeRecord[] = [
  { id: 1, val: 10, left_id: 2, right_id: 3 },
  { id: 2, val: 5, left_id: -1, right_id: -1 },
  { id: 3, val: 20, left_id: -1, right_id: -1 },
];

describe('TreeVisualizer Component Tests', () => {
  describe('Binary Tree Visualizer', () => {
    it('renders empty tree canvas when tree_state is empty', () => {
      const emptyEvent: EngineEvent = {
        step_index: 1,
        action: 'INITIAL',
        message: 'Empty binary tree',
        canonical_duration_ms: 0,
        active_indices: [],
        array_state: [],
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
      };

      render(<TreeVisualizer currentEvent={emptyEvent} algorithmId="binary_tree" />);

      expect(screen.getByTestId('tree-visualizer')).toBeInTheDocument();
      expect(screen.getByTestId('tree-node-count')).toHaveTextContent('Nodes: 0');
      expect(screen.getByTestId('tree-empty-canvas')).toHaveTextContent(/Tree is currently empty/i);
    });

    it('renders tree nodes, root tag, and directed edges', () => {
      const treeEvent: EngineEvent = {
        step_index: 2,
        action: 'BUILD',
        message: 'Binary tree constructed',
        canonical_duration_ms: 800,
        active_indices: [],
        array_state: [],
        tree_state: SAMPLE_TREE_STATE,
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
      };

      render(<TreeVisualizer currentEvent={treeEvent} algorithmId="binary_tree" />);

      expect(screen.getByTestId('tree-node-count')).toHaveTextContent('Nodes: 3');
      expect(screen.getByTestId('tree-svg-canvas')).toBeInTheDocument();

      // Check node values rendered
      expect(screen.getByTestId('tree-val-1')).toHaveTextContent('10');
      expect(screen.getByTestId('tree-val-2')).toHaveTextContent('5');
      expect(screen.getByTestId('tree-val-3')).toHaveTextContent('20');

      // Check root tag on root node 1
      expect(screen.getByText('ROOT')).toBeInTheDocument();

      // Check SVG edge lines
      expect(screen.getByTestId('tree-edge-1->L->2')).toBeInTheDocument();
      expect(screen.getByTestId('tree-edge-1->R->3')).toBeInTheDocument();
    });

    it('renders traversal ribbon when array_state contains values', () => {
      const traversalEvent: EngineEvent = {
        step_index: 5,
        action: 'VISIT',
        message: 'In-order traversal visited node 10',
        canonical_duration_ms: 500,
        active_indices: [],
        array_state: [5, 10, 20],
        tree_state: SAMPLE_TREE_STATE,
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
        pivot_val: 10,
        stats: {},
      };

      render(<TreeVisualizer currentEvent={traversalEvent} algorithmId="binary_tree" />);

      const ribbon = screen.getByTestId('tree-traversal-ribbon');
      expect(ribbon).toBeInTheDocument();
      expect(screen.getByTestId('traversal-chip-0')).toHaveTextContent('5');
      expect(screen.getByTestId('traversal-chip-1')).toHaveTextContent('10');
      expect(screen.getByTestId('traversal-chip-2')).toHaveTextContent('20');
    });
  });

  describe('Binary Search Tree (BST) Visualizer', () => {
    it('renders BST title and highlight states for search, insert, and delete', () => {
      const bstSearchMatchEvent: EngineEvent = {
        step_index: 4,
        action: 'SEARCH',
        message: 'BST match found for key 20',
        canonical_duration_ms: 800,
        active_indices: [],
        array_state: [5, 10, 20],
        tree_state: SAMPLE_TREE_STATE,
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
        pivot_val: 20,
        stats: {},
      };

      render(<TreeVisualizer currentEvent={bstSearchMatchEvent} algorithmId="bst" />);

      expect(screen.getByText('Binary Search Tree (BST)')).toBeInTheDocument();
      expect(screen.getByText(/Sorted Sequence \/ Output:/i)).toBeInTheDocument();

      // Node with val 20 (id: 3) should have node-search-match
      const circleNode = screen.getByTestId('tree-node-circle-3');
      expect(circleNode).toHaveClass('node-search-match');
    });

    it('highlights inserted node on INSERT action', () => {
      const insertEvent: EngineEvent = {
        step_index: 3,
        action: 'INSERT',
        message: 'Inserted 5 into BST',
        canonical_duration_ms: 800,
        active_indices: [],
        array_state: [],
        tree_state: SAMPLE_TREE_STATE,
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
        pivot_val: 5,
        stats: {},
      };

      render(<TreeVisualizer currentEvent={insertEvent} algorithmId="bst" />);
      const circleNode = screen.getByTestId('tree-node-circle-2');
      expect(circleNode).toHaveClass('node-inserted');
    });

    it('highlights delete target node on DELETE action', () => {
      const deleteEvent: EngineEvent = {
        step_index: 2,
        action: 'DELETE',
        message: 'Deleting node 10 from BST',
        canonical_duration_ms: 800,
        active_indices: [],
        array_state: [],
        tree_state: SAMPLE_TREE_STATE,
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
        pivot_val: 10,
        stats: {},
      };

      render(<TreeVisualizer currentEvent={deleteEvent} algorithmId="bst" />);
      const circleNode = screen.getByTestId('tree-node-circle-1');
      expect(circleNode).toHaveClass('node-delete-target');
    });
  });

  describe('Tree Input Form Interactions', () => {
    it('switches binary tree presets and submits parsed preorder array', () => {
      const onSubmit = vi.fn();
      render(
        <VisualizerInputForm
          algorithmId="binary_tree"
          category="trees"
          isLoading={false}
          onSubmit={onSubmit}
        />
      );

      const skewedPreset = screen.getByRole('button', { name: /Left-Skewed Tree/i });
      fireEvent.click(skewedPreset);

      const input = screen.getByLabelText(/Preorder Sequence/i) as HTMLInputElement;
      expect(input.value).toBe('1, 2, 3, -1, -1, -1, -1');

      const submitBtn = screen.getByRole('button', { name: /Run Visualization/i });
      fireEvent.click(submitBtn);

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const payload = onSubmit.mock.calls[0][0];
      expect(payload.preorder).toEqual([1, 2, 3, -1, -1, -1, -1]);
    });

    it('allows typing custom preorder sequence on binary tree form', () => {
      const onSubmit = vi.fn();
      render(
        <VisualizerInputForm
          algorithmId="binary_tree"
          category="trees"
          isLoading={false}
          onSubmit={onSubmit}
        />
      );

      const input = screen.getByLabelText(/Preorder Sequence/i);
      fireEvent.change(input, { target: { value: '10, 20, -1, -1, 30, -1, -1' } });

      const submitBtn = screen.getByRole('button', { name: /Run Visualization/i });
      fireEvent.click(submitBtn);

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const payload = onSubmit.mock.calls[0][0];
      expect(payload.preorder).toEqual([10, 20, -1, -1, 30, -1, -1]);
    });

    it('switches BST presets and submits values array and optional target', () => {
      const onSubmit = vi.fn();
      render(
        <VisualizerInputForm
          algorithmId="bst"
          category="trees"
          isLoading={false}
          onSubmit={onSubmit}
        />
      );

      const deleteLeafPreset = screen.getByRole('button', { name: /Delete Leaf Node/i });
      fireEvent.click(deleteLeafPreset);

      const submitBtn = screen.getByRole('button', { name: /Run Visualization/i });
      fireEvent.click(submitBtn);

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const payload = onSubmit.mock.calls[0][0];
      expect(payload.values).toEqual([50, 30, 70]);
      expect(payload.delete_target).toBe(30);
    });
  });
});
