import React from 'react';
import { EngineEvent } from '../../types/engine';
import { PlaybackState } from '../../hooks/usePlaybackEngine';

export interface StatusBannerProps {
  currentEvent: EngineEvent | null;
  state: PlaybackState;
  currentIndex: number;
  totalSteps: number;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  currentEvent,
  state,
  currentIndex,
  totalSteps,
}) => {
  const action = currentEvent?.action ?? (state === 'idle' ? 'STANDBY' : state.toUpperCase());
  const message =
    currentEvent?.message ??
    (state === 'idle'
      ? 'Select or customize an input array and click "Run Visualization" to start.'
      : state === 'loading'
      ? 'Requesting execution trace from C++ engine bridge...'
      : 'Ready to execute.');

  return (
    <div
      className="status-banner"
      role="region"
      aria-label="Algorithm status narrative"
      aria-live="polite"
      style={{
        padding: '0.85rem 1.25rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 300px' }}>
        <span
          className={`badge ${
            action === 'COMPLETE' || action === 'MATCH'
              ? 'badge-success'
              : action === 'COMPARE' || action === 'CHECK' || action === 'MERGE_COMPARE'
              ? 'badge-warning'
              : action === 'SWAP' || action === 'SHIFT' || action === 'NEW_MIN'
              ? 'badge-danger'
              : 'badge-primary'
          }`}
          style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}
        >
          {action}
        </span>
        <span
          style={{
            fontSize: '0.95rem',
            color: 'var(--text-primary)',
            fontWeight: 500,
            lineHeight: 1.4,
          }}
        >
          {message}
        </span>
      </div>

      {totalSteps > 0 && (
        <span
          style={{
            fontSize: '0.85rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          Step {currentIndex + 1} / {totalSteps}
        </span>
      )}
    </div>
  );
};
