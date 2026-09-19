import React, { useMemo } from 'react';
import { EngineEvent } from '../../types/engine';

export interface ArrayVisualizerProps {
  currentEvent: EngineEvent | null;
  algorithmId: string;
}

export const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({
  currentEvent,
  algorithmId,
}) => {
  const array = currentEvent?.array_state ?? [];
  const activeIndices = currentEvent?.active_indices ?? [];
  const sortedBoundary = currentEvent?.sorted_boundary ?? -1;
  const pivotIdx = currentEvent?.pivot_idx ?? -1;
  const rangeSt = currentEvent?.range_st ?? -1;
  const rangeEnd = currentEvent?.range_end ?? -1;
  const action = currentEvent?.action ?? '';

  // Dynamic scaling for bar heights (min 15px, max 240px)
  const { minVal, maxVal } = useMemo(() => {
    if (array.length === 0) return { minVal: 0, maxVal: 1 };
    let min = array[0];
    let max = array[0];
    for (const v of array) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
    return { minVal: min, maxVal: max };
  }, [array]);

  const calculateHeight = (val: number): number => {
    if (maxVal === minVal) return 120;
    const normalized = (val - minVal) / (maxVal - minVal);
    return Math.round(25 + normalized * 195);
  };

  const isSorted = (idx: number): boolean => {
    if (action === 'COMPLETE') return true;
    if (sortedBoundary < 0) return false;

    if (algorithmId === 'bubble_sort') {
      return idx >= sortedBoundary;
    }
    if (algorithmId === 'selection_sort' || algorithmId === 'insertion_sort') {
      return idx <= sortedBoundary;
    }
    return false;
  };

  const isInActiveRange = (idx: number): boolean => {
    if (rangeSt >= 0 && rangeEnd >= 0) {
      return idx >= rangeSt && idx <= rangeEnd;
    }
    return true;
  };

  const getBarColorClass = (idx: number): string => {
    const isActive = activeIndices.includes(idx);
    const isPivot = pivotIdx === idx;
    const sorted = isSorted(idx);

    if (isPivot) return 'bar-pivot';
    if (isActive) {
      if (action === 'SWAP' || action === 'SHIFT') return 'bar-swap';
      if (action === 'NEW_MIN') return 'bar-new-min';
      return 'bar-active';
    }
    if (sorted) return 'bar-sorted';
    if (!isInActiveRange(idx)) return 'bar-dimmed';
    return 'bar-default';
  };

  if (array.length === 0) {
    return (
      <div
        className="visualizer-empty"
        style={{
          height: '280px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-secondary)',
          borderRadius: '8px',
          color: 'var(--text-muted)',
          fontSize: '0.95rem',
        }}
      >
        No array data to display. Click "Run Visualization" to begin.
      </div>
    );
  }

  return (
    <div
      className="array-visualizer-card card"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Range Metadata Pill */}
      {(rangeSt >= 0 || pivotIdx >= 0) && (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
          {rangeSt >= 0 && rangeEnd >= 0 && (
            <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
              Active Subarray: [{rangeSt}...{rangeEnd}]
            </span>
          )}
          {pivotIdx >= 0 && (
            <span className="badge badge-primary">
              Pivot / Key: Index {pivotIdx} ({currentEvent?.pivot_val ?? array[pivotIdx]})
            </span>
          )}
        </div>
      )}

      {/* Main Bars Canvas */}
      <div
        className="array-bars-canvas"
        role="region"
        aria-label="Array sorting visualizer canvas"
        style={{
          height: '280px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: array.length > 30 ? '2px' : array.length > 20 ? '4px' : '8px',
          padding: '1rem 0.5rem',
          background: 'var(--bg-primary)',
          borderRadius: '8px',
          overflowX: 'auto',
        }}
      >
        {array.map((val, idx) => {
          const heightPx = calculateHeight(val);
          const colorClass = getBarColorClass(idx);
          const isActive = activeIndices.includes(idx);

          return (
            <div
              key={idx}
              className={`array-bar-wrapper ${colorClass}`}
              aria-label={`Index ${idx}, Value ${val}${isActive ? ', currently active' : ''}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: array.length > 25 ? '1 1 0px' : '0 1 40px',
                minWidth: '12px',
                maxWidth: '48px',
              }}
            >
              {/* Value label above bar */}
              <span
                style={{
                  fontSize: array.length > 25 ? '0.65rem' : '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                  marginBottom: '4px',
                  userSelect: 'none',
                }}
              >
                {val}
              </span>

              {/* Graphical Bar */}
              <div
                className={`array-bar ${colorClass}`}
                style={{
                  width: '100%',
                  height: `${heightPx}px`,
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.2s ease, background-color 0.2s ease',
                }}
              />

              {/* Index label below bar */}
              <span
                style={{
                  fontSize: '0.65rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  marginTop: '4px',
                  userSelect: 'none',
                }}
              >
                {idx}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
