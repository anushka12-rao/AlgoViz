import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataStructureVisualizer } from '../src/components/visualizer/DataStructureVisualizer';
import { VisualizerInputForm } from '../src/components/visualizer/VisualizerInputForm';
import { EngineEvent } from '../src/types/engine';

describe('DataStructureVisualizer Component Tests', () => {
  describe('Stack Visualizer', () => {
    it('renders empty stack correctly with 7 capacity slots and empty note', () => {
      const emptyEvent: EngineEvent = {
        step_index: 1,
        action: 'INITIAL',
        message: 'Empty stack initialized',
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

      render(<DataStructureVisualizer currentEvent={emptyEvent} algorithmId="stack" />);

      expect(screen.getByTestId('stack-visualizer')).toBeInTheDocument();
      expect(screen.getByText(/Size: 0 \/ 7/i)).toBeInTheDocument();
      expect(screen.getByTestId('stack-empty-note')).toHaveTextContent(/Stack is currently empty/i);

      // Verify all 7 slots exist and are empty
      for (let i = 0; i < 7; i++) {
        const slot = screen.getByTestId(`stack-slot-${i}`);
        expect(slot).toHaveClass('empty');
      }
    });

    it('renders pushed elements and identifies TOP slot correctly', () => {
      const pushEvent: EngineEvent = {
        step_index: 3,
        action: 'PUSH',
        message: 'Pushed 42 onto stack',
        canonical_duration_ms: 800,
        active_indices: [1],
        array_state: [10, 42],
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
        pivot_val: 42,
        stats: {},
      };

      render(<DataStructureVisualizer currentEvent={pushEvent} algorithmId="stack" />);

      expect(screen.getByText(/Size: 2 \/ 7/i)).toBeInTheDocument();
      expect(screen.getByTestId('stack-val-0')).toHaveTextContent('10');
      expect(screen.getByTestId('stack-val-1')).toHaveTextContent('42');

      const topSlot = screen.getByTestId('stack-slot-1');
      expect(topSlot).toHaveClass('top-slot');
      expect(screen.getByTestId('stack-top-indicator')).toBeInTheDocument();
    });

    it('renders stack overflow alert banner', () => {
      const overflowEvent: EngineEvent = {
        step_index: 8,
        action: 'OVERFLOW',
        message: 'Stack overflow: maximum capacity 7 reached',
        canonical_duration_ms: 0,
        active_indices: [],
        array_state: [1, 2, 3, 4, 5, 6, 7],
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
        pivot_val: 8,
        stats: {},
      };

      render(<DataStructureVisualizer currentEvent={overflowEvent} algorithmId="stack" />);

      const alert = screen.getByTestId('stack-overflow-alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent(/Stack Overflow!/i);
    });

    it('renders stack underflow alert banner', () => {
      const underflowEvent: EngineEvent = {
        step_index: 2,
        action: 'UNDERFLOW',
        message: 'Stack underflow: stack is empty',
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

      render(<DataStructureVisualizer currentEvent={underflowEvent} algorithmId="stack" />);

      const alert = screen.getByTestId('stack-underflow-alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent(/Stack Underflow!/i);
    });

    it('renders popped badge on POP action', () => {
      const popEvent: EngineEvent = {
        step_index: 4,
        action: 'POP',
        message: 'Popped 99 from stack',
        canonical_duration_ms: 800,
        active_indices: [],
        array_state: [10],
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
        pivot_val: 99,
        stats: {},
      };

      render(<DataStructureVisualizer currentEvent={popEvent} algorithmId="stack" />);

      const badge = screen.getByTestId('stack-popped-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent(/Popped Value: 99/i);
    });
  });

  describe('Queue Visualizer', () => {
    it('renders empty queue pipeline correctly', () => {
      const emptyEvent: EngineEvent = {
        step_index: 1,
        action: 'INITIAL',
        message: 'Empty queue initialized',
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

      render(<DataStructureVisualizer currentEvent={emptyEvent} algorithmId="queue" />);

      expect(screen.getByTestId('queue-visualizer')).toBeInTheDocument();
      expect(screen.getByTestId('queue-front-marker')).toBeInTheDocument();
      expect(screen.getByTestId('queue-rear-marker')).toBeInTheDocument();
      expect(screen.getByTestId('queue-empty-note')).toHaveTextContent(/Queue is empty/i);
    });

    it('renders queue cells with FRONT and REAR tags', () => {
      const queueEvent: EngineEvent = {
        step_index: 3,
        action: 'PUSH',
        message: 'Enqueued 30',
        canonical_duration_ms: 800,
        active_indices: [2],
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
        pivot_idx: 2,
        pivot_val: 30,
        stats: {},
      };

      render(<DataStructureVisualizer currentEvent={queueEvent} algorithmId="queue" />);

      expect(screen.getByText('Count: 3')).toBeInTheDocument();
      expect(screen.getByTestId('queue-val-0')).toHaveTextContent('10');
      expect(screen.getByTestId('queue-val-1')).toHaveTextContent('20');
      expect(screen.getByTestId('queue-val-2')).toHaveTextContent('30');

      expect(screen.getByText('FRONT')).toBeInTheDocument();
      expect(screen.getByText('REAR')).toBeInTheDocument();
    });

    it('renders queue underflow alert and dequeued badge', () => {
      const underflowEvent: EngineEvent = {
        step_index: 2,
        action: 'UNDERFLOW',
        message: 'Queue underflow: queue is empty',
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

      render(<DataStructureVisualizer currentEvent={underflowEvent} algorithmId="queue" />);
      expect(screen.getByTestId('queue-underflow-alert')).toHaveTextContent(/Queue Underflow!/i);

      const popEvent: EngineEvent = {
        ...underflowEvent,
        action: 'POP',
        pivot_val: 55,
      };

      const { unmount } = render(<DataStructureVisualizer currentEvent={popEvent} algorithmId="queue" />);
      expect(screen.getByTestId('queue-dequeued-badge')).toHaveTextContent(/Dequeued Value: 55/i);
      unmount();
    });
  });

  describe('Singly Linked List Visualizer', () => {
    it('renders empty linked list with NULL terminator', () => {
      const emptyEvent: EngineEvent = {
        step_index: 1,
        action: 'INITIAL',
        message: 'Empty linked list initialized',
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

      render(<DataStructureVisualizer currentEvent={emptyEvent} algorithmId="linked_list" />);

      expect(screen.getByTestId('linked-list-visualizer')).toBeInTheDocument();
      expect(screen.getByTestId('list-empty-note')).toHaveTextContent(/Linked list is empty/i);
      expect(screen.getByTestId('list-null-node')).toHaveTextContent('NULL');
    });

    it('renders chained nodes with HEAD and TAIL badges and arrow connectors', () => {
      const listEvent: EngineEvent = {
        step_index: 4,
        action: 'PUSH_BACK',
        message: 'Appended 77 to linked list',
        canonical_duration_ms: 800,
        active_indices: [2],
        array_state: [11, 22, 77],
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
        pivot_idx: 2,
        pivot_val: 77,
        stats: {},
      };

      render(<DataStructureVisualizer currentEvent={listEvent} algorithmId="linked_list" />);

      expect(screen.getByText('Length: 3')).toBeInTheDocument();
      expect(screen.getByTestId('list-val-0')).toHaveTextContent('11');
      expect(screen.getByTestId('list-val-1')).toHaveTextContent('22');
      expect(screen.getByTestId('list-val-2')).toHaveTextContent('77');

      expect(screen.getByTestId('list-head-badge')).toHaveTextContent('HEAD');
      expect(screen.getByTestId('list-tail-badge')).toHaveTextContent('TAIL');
      expect(screen.getByTestId('list-arrow-0')).toBeInTheDocument();
      expect(screen.getByTestId('list-arrow-1')).toBeInTheDocument();
      expect(screen.getByTestId('list-arrow-2')).toBeInTheDocument();
      expect(screen.getByTestId('list-null-node')).toHaveTextContent('NULL');
    });

    it('renders list deletion badge and underflow alert', () => {
      const deleteEvent: EngineEvent = {
        step_index: 3,
        action: 'POP_FRONT',
        message: 'Deleted front node 11',
        canonical_duration_ms: 800,
        active_indices: [],
        array_state: [22],
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
        pivot_idx: 0,
        pivot_val: 11,
        stats: {},
      };

      render(<DataStructureVisualizer currentEvent={deleteEvent} algorithmId="linked_list" />);
      expect(screen.getByTestId('list-deleted-badge')).toHaveTextContent(/Deleted Node Value: 11/i);

      const underflowEvent: EngineEvent = {
        ...deleteEvent,
        action: 'UNDERFLOW',
      };
      const { unmount } = render(<DataStructureVisualizer currentEvent={underflowEvent} algorithmId="linked_list" />);
      expect(screen.getByTestId('list-underflow-alert')).toHaveTextContent(/List Underflow!/i);
      unmount();
    });

    it('renders search match highlight and search badge', () => {
      const searchMatchEvent: EngineEvent = {
        step_index: 3,
        action: 'SEARCH',
        message: 'Found node with value 22 at index 1',
        canonical_duration_ms: 800,
        active_indices: [1],
        array_state: [11, 22, 33],
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
        pivot_val: 22,
        stats: {},
      };

      render(<DataStructureVisualizer currentEvent={searchMatchEvent} algorithmId="linked_list" />);

      const searchBadge = screen.getByTestId('list-search-badge');
      expect(searchBadge).toHaveTextContent(/Search for 22: Found at index 1/i);

      const matchedNode = screen.getByTestId('list-node-1');
      expect(matchedNode).toHaveClass('node-match');
    });
  });

  describe('Data Structure Input Form Interactions', () => {
    it('handles stack preset switches and submits operations payload', () => {
      const onSubmit = vi.fn();
      render(
        <VisualizerInputForm
          algorithmId="stack"
          category="data_structures"
          isLoading={false}
          onSubmit={onSubmit}
        />
      );

      // Click preset button
      const overflowPreset = screen.getByRole('button', { name: /Overflow Trigger \(Push 8 items\)/i });
      fireEvent.click(overflowPreset);

      const submitBtn = screen.getByRole('button', { name: /Run Visualization/i });
      fireEvent.click(submitBtn);

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const submittedPayload = onSubmit.mock.calls[0][0];
      expect(submittedPayload.operations).toBeDefined();
      expect(submittedPayload.operations.length).toBe(1);
      expect(submittedPayload.operations[0].op).toBe('push');
      expect(submittedPayload.elements.length).toBe(7);
    });

    it('allows updating initial elements in data structure form', () => {
      const onSubmit = vi.fn();
      render(
        <VisualizerInputForm
          algorithmId="stack"
          category="data_structures"
          isLoading={false}
          onSubmit={onSubmit}
        />
      );

      const input = screen.getByLabelText(/Initial Elements/i);
      fireEvent.change(input, { target: { value: '5, 15, 25' } });

      const submitBtn = screen.getByRole('button', { name: /Run Visualization/i });
      fireEvent.click(submitBtn);

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const submittedPayload = onSubmit.mock.calls[0][0];
      expect(submittedPayload.elements).toEqual([5, 15, 25]);
    });
  });
});
