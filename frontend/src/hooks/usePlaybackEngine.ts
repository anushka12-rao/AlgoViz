import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { EngineEvent } from '../types/engine';

export type PlaybackState =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'completed'
  | 'error';

export type PlaybackSpeed = 0.25 | 0.5 | 1 | 2 | 4;

export const PLAYBACK_SPEEDS: readonly PlaybackSpeed[] = [0.25, 0.5, 1, 2, 4];

export const MIN_STEP_DELAY_MS = 350;

/**
 * Calculates the presentation delay for automated playback.
 * Enforces the 350ms floor for 0ms events without altering canonical_duration_ms.
 */
export function getEffectiveStepDelay(
  canonicalDurationMs: number,
  speedMultiplier: number
): number {
  const effectiveBase = canonicalDurationMs > 0 ? canonicalDurationMs : MIN_STEP_DELAY_MS;
  return Math.max(10, Math.round(effectiveBase / speedMultiplier));
}

export interface UsePlaybackEngineReturn {
  state: PlaybackState;
  events: EngineEvent[];
  currentIndex: number;
  currentEvent: EngineEvent | null;
  totalSteps: number;
  speed: PlaybackSpeed;
  isPlaying: boolean;
  errorMessage: string | null;
  play: () => void;
  pause: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  restart: () => void;
  seek: (targetIndex: number) => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  loadTrace: (events: EngineEvent[]) => void;
  startLoading: () => void;
  setError: (msg: string) => void;
  reset: () => void;
}

export function usePlaybackEngine(initialEvents: EngineEvent[] = []): UsePlaybackEngineReturn {
  const [events, setEvents] = useState<EngineEvent[]>(initialEvents);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [state, setState] = useState<PlaybackState>(() =>
    initialEvents.length > 0 ? 'ready' : 'idle'
  );
  const [speed, setSpeedState] = useState<PlaybackSpeed>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Latest mutable state ref to guard against stale closures in recursive scheduling
  const latestRef = useRef({
    events,
    currentIndex,
    state,
    speed,
  });

  useEffect(() => {
    latestRef.current = { events, currentIndex, state, speed };
  }, [events, currentIndex, state, speed]);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup active timer on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const scheduleNextStep = useCallback((fromIndex: number, currentSpeed: PlaybackSpeed) => {
    clearTimer();

    const currentEvs = latestRef.current.events;
    if (fromIndex >= currentEvs.length - 1) {
      setState('completed');
      return;
    }

    const currentEvent = currentEvs[fromIndex];
    const delay = getEffectiveStepDelay(
      currentEvent?.canonical_duration_ms ?? 0,
      currentSpeed
    );

    timerRef.current = setTimeout(() => {
      timerRef.current = null;

      // Guard check: ensure we are still playing the same trace
      if (latestRef.current.state !== 'playing') {
        return;
      }

      const nextIndex = fromIndex + 1;
      const total = latestRef.current.events.length;

      if (nextIndex >= total - 1) {
        setCurrentIndex(total - 1);
        setState('completed');
      } else {
        setCurrentIndex(nextIndex);
        // Recursively schedule next event
        scheduleNextStep(nextIndex, latestRef.current.speed);
      }
    }, delay);
  }, [clearTimer]);

  const play = useCallback(() => {
    const { state: curState, events: evs, currentIndex: curIdx, speed: curSpeed } = latestRef.current;
    if (evs.length === 0) return;
    if (curState === 'playing') return; // Safe no-op if already playing

    let startIndex = curIdx;
    if (curState === 'completed' || curIdx >= evs.length - 1) {
      startIndex = 0;
      setCurrentIndex(0);
    }

    setState('playing');
    scheduleNextStep(startIndex, curSpeed);
  }, [scheduleNextStep]);

  const pause = useCallback(() => {
    clearTimer();
    if (latestRef.current.state === 'playing') {
      setState('paused');
    }
  }, [clearTimer]);

  const stepForward = useCallback(() => {
    clearTimer();
    const { events: evs, currentIndex: curIdx } = latestRef.current;
    if (evs.length === 0) return;

    if (curIdx >= evs.length - 1) {
      setState('completed');
      return;
    }

    const nextIndex = curIdx + 1;
    setCurrentIndex(nextIndex);
    if (nextIndex === evs.length - 1) {
      setState('completed');
    } else {
      setState('paused');
    }
  }, [clearTimer]);

  const stepBackward = useCallback(() => {
    clearTimer();
    const { events: evs, currentIndex: curIdx } = latestRef.current;
    if (evs.length === 0) return;

    if (curIdx <= 0) {
      setCurrentIndex(0);
      setState('ready');
      return;
    }

    const prevIndex = curIdx - 1;
    setCurrentIndex(prevIndex);
    setState(prevIndex === 0 ? 'ready' : 'paused');
  }, [clearTimer]);

  const restart = useCallback(() => {
    clearTimer();
    const { events: evs } = latestRef.current;
    setCurrentIndex(0);
    setState(evs.length > 0 ? 'ready' : 'idle');
  }, [clearTimer]);

  const seek = useCallback((targetIndex: number) => {
    clearTimer();
    const { events: evs } = latestRef.current;
    if (evs.length === 0) return;

    const clampedIndex = Math.max(0, Math.min(targetIndex, evs.length - 1));
    setCurrentIndex(clampedIndex);

    if (clampedIndex === evs.length - 1) {
      setState('completed');
    } else if (clampedIndex === 0) {
      setState('ready');
    } else {
      setState('paused');
    }
  }, [clearTimer]);

  const setSpeed = useCallback((newSpeed: PlaybackSpeed) => {
    setSpeedState(newSpeed);
    // If currently playing, timer continues its current duration and next step picks up newSpeed
  }, []);

  const loadTrace = useCallback((newEvents: EngineEvent[]) => {
    clearTimer();
    setEvents(newEvents);
    setCurrentIndex(0);
    setErrorMessage(null);

    if (newEvents.length === 0) {
      setState('error');
      setErrorMessage('No visualization events returned by the engine.');
    } else if (newEvents.length === 1) {
      setState('completed');
    } else {
      setState('ready');
    }
  }, [clearTimer]);

  const startLoading = useCallback(() => {
    clearTimer();
    setState('loading');
    setErrorMessage(null);
  }, [clearTimer]);

  const setError = useCallback((msg: string) => {
    clearTimer();
    setState('error');
    setErrorMessage(msg);
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setEvents([]);
    setCurrentIndex(0);
    setState('idle');
    setErrorMessage(null);
  }, [clearTimer]);

  const currentEvent = useMemo(() => {
    if (events.length === 0 || currentIndex < 0 || currentIndex >= events.length) {
      return null;
    }
    return events[currentIndex];
  }, [events, currentIndex]);

  return {
    state,
    events,
    currentIndex,
    currentEvent,
    totalSteps: events.length,
    speed,
    isPlaying: state === 'playing',
    errorMessage,
    play,
    pause,
    stepForward,
    stepBackward,
    restart,
    seek,
    setSpeed,
    loadTrace,
    startLoading,
    setError,
    reset,
  };
}
