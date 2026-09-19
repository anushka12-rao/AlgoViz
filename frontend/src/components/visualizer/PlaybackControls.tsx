import React from 'react';
import { PlaybackSpeed, PLAYBACK_SPEEDS } from '../../hooks/usePlaybackEngine';

export interface PlaybackControlsProps {
  isPlaying: boolean;
  canPlay: boolean;
  canStepForward: boolean;
  canStepBackward: boolean;
  canRestart: boolean;
  speed: PlaybackSpeed;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onRestart: () => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  canPlay,
  canStepForward,
  canStepBackward,
  canRestart,
  speed,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onRestart,
  onSpeedChange,
}) => {
  return (
    <div
      className="playback-controls"
      role="toolbar"
      aria-label="Algorithm playback controls"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.85rem 1.25rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
      }}
    >
      {/* Primary Navigation Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onRestart}
          disabled={!canRestart}
          aria-label="Restart to step 0"
          title="Restart (Step 0)"
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
        >
          ⏮ Restart
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onStepBackward}
          disabled={!canStepBackward}
          aria-label="Step backward one event"
          title="Step Backward"
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
        >
          ⏪ Step
        </button>

        {isPlaying ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onPause}
            aria-label="Pause playback"
            title="Pause Playback"
            style={{ padding: '0.45rem 1.1rem', fontSize: '0.95rem', fontWeight: 600 }}
          >
            ⏸ Pause
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onPlay}
            disabled={!canPlay}
            aria-label="Start playback"
            title="Play Animation"
            style={{ padding: '0.45rem 1.1rem', fontSize: '0.95rem', fontWeight: 600 }}
          >
            ▶ Play
          </button>
        )}

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onStepForward}
          disabled={!canStepForward}
          aria-label="Step forward one event"
          title="Step Forward"
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
        >
          Step ⏩
        </button>
      </div>

      {/* Speed Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <label
          htmlFor="playback-speed-select"
          style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}
        >
          Speed:
        </label>
        <select
          id="playback-speed-select"
          className="btn btn-secondary"
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value) as PlaybackSpeed)}
          aria-label="Select playback speed"
          style={{ padding: '0.4rem 0.65rem', fontSize: '0.85rem', cursor: 'pointer' }}
        >
          {PLAYBACK_SPEEDS.map((s) => (
            <option key={s} value={s}>
              {s}x
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
