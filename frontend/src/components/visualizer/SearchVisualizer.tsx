import React from 'react';
import { EngineEvent } from '../../types/engine';

export interface SearchVisualizerProps {
  currentEvent: EngineEvent | null;
  algorithmId: string;
}

export const SearchVisualizer: React.FC<SearchVisualizerProps> = ({
  currentEvent,
  algorithmId,
}) => {
  const array = currentEvent?.array_state ?? [];
  const activeIndices = currentEvent?.active_indices ?? [];
  const target = currentEvent?.pivot_val ?? 0;
  const resultIdx = currentEvent?.pivot_idx ?? -1;
  const rangeSt = currentEvent?.range_st ?? -1;
  const rangeEnd = currentEvent?.range_end ?? -1;
  const rangeMid = currentEvent?.range_mid ?? -1;
  const action = currentEvent?.action ?? '';

  const isMatch = action === 'MATCH' || (action === 'COMPLETE' && resultIdx >= 0);
  const isMismatch = action === 'MISMATCH';

  const isCellInWindow = (idx: number): boolean => {
    if (algorithmId !== 'binary_search') return true;
    if (rangeSt < 0 || rangeEnd < 0) return true;
    return idx >= rangeSt && idx <= rangeEnd;
  };

  const getCellClass = (idx: number): string => {
    const isActive = activeIndices.includes(idx);
    const inWindow = isCellInWindow(idx);

    if (isMatch && (idx === resultIdx || isActive)) {
      return 'search-cell-match';
    }
    if (isActive) {
      if (isMismatch) return 'search-cell-mismatch';
      if (action === 'GREATER' || action === 'SMALLER') return 'search-cell-step';
      return 'search-cell-check';
    }
    if (idx === rangeMid) {
      return 'search-cell-mid';
    }
    if (!inWindow) {
      return 'search-cell-dimmed';
    }
    return 'search-cell-default';
  };

  if (array.length === 0) {
    return (
      <div
        className="visualizer-empty"
        style={{
          height: '240px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-secondary)',
          borderRadius: '8px',
          color: 'var(--text-muted)',
          fontSize: '0.95rem',
        }}
      >
        No search data to display. Click "Run Visualization" to begin.
      </div>
    );
  }

  return (
    <div
      className="search-visualizer-card card"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {/* Header Info Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'var(--bg-secondary)',
          borderRadius: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Search Target:
          </span>
          <span
            className="badge badge-primary"
            style={{ fontSize: '0.95rem', fontFamily: 'var(--font-mono)', padding: '0.2rem 0.6rem' }}
          >
            {target}
          </span>
        </div>

        {algorithmId === 'binary_search' && rangeSt >= 0 && rangeEnd >= 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Window:</span>
            <code style={{ color: 'var(--primary-color)' }}>
              [st={rangeSt}, mid={rangeMid}, end={rangeEnd}]
            </code>
          </div>
        )}

        {action === 'COMPLETE' && (
          <span
            className={`badge ${resultIdx >= 0 ? 'badge-success' : 'badge-danger'}`}
            style={{ fontWeight: 700 }}
          >
            {resultIdx >= 0 ? `Target found at index ${resultIdx}` : 'Target not found (-1)'}
          </span>
        )}
      </div>

      {/* Search Grid / Array Tape */}
      <div
        className="search-array-tape"
        role="region"
        aria-label="Search algorithm array visualization"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          padding: '1.5rem 0.5rem',
          background: 'var(--bg-primary)',
          borderRadius: '8px',
          minHeight: '140px',
        }}
      >
        {array.map((val, idx) => {
          const cellClass = getCellClass(idx);
          const isMid = idx === rangeMid;
          const isSt = idx === rangeSt;
          const isEnd = idx === rangeEnd;
          const isActive = activeIndices.includes(idx);

          return (
            <div
              key={idx}
              className={`search-cell-wrapper ${cellClass}`}
              aria-label={`Index ${idx}, value ${val}${isActive ? ', active inspection' : ''}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              {/* Pointer Badges (Mid, St, End) */}
              <div style={{ minHeight: '16px', fontSize: '0.65rem', fontWeight: 700 }}>
                {isMid && <span style={{ color: 'var(--primary-color)' }}>MID</span>}
                {!isMid && isSt && <span style={{ color: 'var(--accent-color)' }}>ST</span>}
                {!isMid && isEnd && <span style={{ color: 'var(--accent-color)' }}>END</span>}
              </div>

              {/* Box */}
              <div
                className={`search-cell ${cellClass}`}
                style={{
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  border: '2px solid',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                }}
              >
                {val}
              </div>

              {/* Index */}
              <span
                style={{
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                }}
              >
                [{idx}]
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
