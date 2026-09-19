import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  usePlaybackEngine,
  getEffectiveStepDelay,
  MIN_STEP_DELAY_MS,
  PlaybackSpeed,
} from '../src/hooks/usePlaybackEngine';
import { EngineEvent } from '../src/types/engine';

const REAL_BUBBLE_EVENTS: EngineEvent[] = [
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
    action: 'PASS_START',
    message: 'Starting Pass 1',
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
    stats: { passes: 1 },
  },
  {
    step_index: 3,
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
    stats: { comparisons: 1, passes: 1, swaps: 0 },
  },
  {
    step_index: 4,
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
    stats: { comparisons: 1, passes: 1, swaps: 1 },
  },
  {
    step_index: 5,
    action: 'PASS_END',
    message: 'End of Pass 1. Current array status',
    canonical_duration_ms: 1200,
    active_indices: [],
    array_state: [1, 2, 3],
    tree_state: [],
    graph_adj: [],
    graph_traversal: [],
    graph_queue: [],
    graph_visited: [],
    current_vertex: -1,
    sorted_boundary: 2,
    range_st: -1,
    range_end: -1,
    range_mid: -1,
    pivot_idx: -1,
    pivot_val: 0,
    stats: { comparisons: 2, passes: 1, swaps: 2 },
  },
  {
    step_index: 6,
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
    stats: { comparisons: 3, passes: 2, swaps: 2 },
  },
];

describe('Phase 10D Playback Engine & Timing Unit Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Timing Rule & Pacing Floor Verification', () => {
    it('applies 350ms presentation floor for 0ms events without modifying event object', () => {
      const zeroDurationEvent = REAL_BUBBLE_EVENTS[0]; // canonical_duration_ms === 0
      const delay = getEffectiveStepDelay(zeroDurationEvent.canonical_duration_ms, 1);

      expect(delay).toBe(MIN_STEP_DELAY_MS);
      // Verify canonical_duration_ms remains completely untouched
      expect(zeroDurationEvent.canonical_duration_ms).toBe(0);
    });

    it('scales nonzero canonical duration across all five supported speed multipliers', () => {
      const canonicalMs = 800; // SWAP canonical duration
      const speeds: PlaybackSpeed[] = [0.25, 0.5, 1, 2, 4];
      const expectedDelays = [3200, 1600, 800, 400, 200];

      speeds.forEach((speed, idx) => {
        expect(getEffectiveStepDelay(canonicalMs, speed)).toBe(expectedDelays[idx]);
      });
    });

    it('scales 0ms event presentation delay with speed multipliers', () => {
      expect(getEffectiveStepDelay(0, 0.25)).toBe(1400);
      expect(getEffectiveStepDelay(0, 0.5)).toBe(700);
      expect(getEffectiveStepDelay(0, 1)).toBe(350);
      expect(getEffectiveStepDelay(0, 2)).toBe(175);
      expect(getEffectiveStepDelay(0, 4)).toBe(88);
    });
  });

  describe('Playback State Transitions & Controls', () => {
    it('initializes in idle when empty, and ready when initialized with events', () => {
      const { result: emptyHook } = renderHook(() => usePlaybackEngine([]));
      expect(emptyHook.current.state).toBe('idle');
      expect(emptyHook.current.currentIndex).toBe(0);
      expect(emptyHook.current.currentEvent).toBeNull();

      const { result: readyHook } = renderHook(() => usePlaybackEngine(REAL_BUBBLE_EVENTS));
      expect(readyHook.current.state).toBe('ready');
      expect(readyHook.current.currentIndex).toBe(0);
      expect(readyHook.current.currentEvent?.action).toBe('INITIAL');
    });

    it('plays trace sequentially, advancing indices and completing at final step', () => {
      const { result } = renderHook(() => usePlaybackEngine(REAL_BUBBLE_EVENTS));

      act(() => {
        result.current.play();
      });

      expect(result.current.state).toBe('playing');
      expect(result.current.isPlaying).toBe(true);

      // Step 0 -> Step 1 (0ms event => 350ms delay)
      act(() => {
        vi.advanceTimersByTime(350);
      });
      expect(result.current.currentIndex).toBe(1);
      expect(result.current.currentEvent?.action).toBe('PASS_START');

      // Step 1 -> Step 2 (0ms event => 350ms delay)
      act(() => {
        vi.advanceTimersByTime(350);
      });
      expect(result.current.currentIndex).toBe(2);
      expect(result.current.currentEvent?.action).toBe('COMPARE');

      // Advance through remaining steps
      act(() => {
        vi.advanceTimersByTime(350 + 800 + 1200);
      });

      expect(result.current.currentIndex).toBe(5);
      expect(result.current.currentEvent?.action).toBe('COMPLETE');
      expect(result.current.state).toBe('completed');
    });

    it('pauses playback and freezes current event index', () => {
      const { result } = renderHook(() => usePlaybackEngine(REAL_BUBBLE_EVENTS));

      act(() => {
        result.current.play();
      });

      act(() => {
        vi.advanceTimersByTime(350);
      });
      expect(result.current.currentIndex).toBe(1);

      act(() => {
        result.current.pause();
      });

      expect(result.current.state).toBe('paused');
      expect(result.current.isPlaying).toBe(false);

      // Verify no timer triggers when paused
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(result.current.currentIndex).toBe(1);
    });

    it('steps forward and backward manually without delay, stopping active playback', () => {
      const { result } = renderHook(() => usePlaybackEngine(REAL_BUBBLE_EVENTS));

      act(() => {
        result.current.stepForward();
      });
      expect(result.current.currentIndex).toBe(1);
      expect(result.current.state).toBe('paused');

      act(() => {
        result.current.stepForward();
      });
      expect(result.current.currentIndex).toBe(2);

      act(() => {
        result.current.stepBackward();
      });
      expect(result.current.currentIndex).toBe(1);

      act(() => {
        result.current.stepBackward();
      });
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.state).toBe('ready');

      // Verify lower boundary
      act(() => {
        result.current.stepBackward();
      });
      expect(result.current.currentIndex).toBe(0);
    });

    it('restarts to step 0 and enters ready state', () => {
      const { result } = renderHook(() => usePlaybackEngine(REAL_BUBBLE_EVENTS));

      act(() => {
        result.current.seek(3);
      });
      expect(result.current.currentIndex).toBe(3);

      act(() => {
        result.current.restart();
      });
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.state).toBe('ready');
    });

    it('seeks directly to target index in O(1) without intermediate replay', () => {
      const { result } = renderHook(() => usePlaybackEngine(REAL_BUBBLE_EVENTS));

      act(() => {
        result.current.seek(4);
      });
      expect(result.current.currentIndex).toBe(4);
      expect(result.current.currentEvent?.action).toBe('PASS_END');
      expect(result.current.state).toBe('paused');

      // Seeking to final step enters completed
      act(() => {
        result.current.seek(5);
      });
      expect(result.current.currentIndex).toBe(5);
      expect(result.current.state).toBe('completed');
    });

    it('calling play while already playing is a safe no-op', () => {
      const { result } = renderHook(() => usePlaybackEngine(REAL_BUBBLE_EVENTS));

      act(() => {
        result.current.play();
      });
      expect(result.current.state).toBe('playing');

      // Second play call
      act(() => {
        result.current.play();
      });
      expect(result.current.state).toBe('playing');

      act(() => {
        vi.advanceTimersByTime(350);
      });
      expect(result.current.currentIndex).toBe(1);
    });

    it('calling play from completed state restarts from index 0 and plays', () => {
      const { result } = renderHook(() => usePlaybackEngine(REAL_BUBBLE_EVENTS));

      act(() => {
        result.current.seek(5); // last step
      });
      expect(result.current.state).toBe('completed');

      act(() => {
        result.current.play();
      });
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.state).toBe('playing');

      act(() => {
        vi.advanceTimersByTime(350);
      });
      expect(result.current.currentIndex).toBe(1);
    });

    it('loading a new trace cancels running playback and resets to index 0', () => {
      const { result } = renderHook(() => usePlaybackEngine(REAL_BUBBLE_EVENTS));

      act(() => {
        result.current.play();
      });

      const newTrace: EngineEvent[] = [
        { ...REAL_BUBBLE_EVENTS[0], step_index: 1, message: 'New Run Event 1' },
        { ...REAL_BUBBLE_EVENTS[1], step_index: 2, message: 'New Run Event 2' },
      ];

      act(() => {
        result.current.loadTrace(newTrace);
      });

      expect(result.current.state).toBe('ready');
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.currentEvent?.message).toBe('New Run Event 1');

      // Ensure no timers from previous play fire
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(result.current.currentIndex).toBe(0);
    });

    it('cleans up active timers on unmount without errors', () => {
      const { result, unmount } = renderHook(() => usePlaybackEngine(REAL_BUBBLE_EVENTS));

      act(() => {
        result.current.play();
      });

      unmount();

      // Advancing timers after unmount should not trigger state updates or throw
      expect(() => {
        act(() => {
          vi.advanceTimersByTime(5000);
        });
      }).not.toThrow();
    });
  });
});
