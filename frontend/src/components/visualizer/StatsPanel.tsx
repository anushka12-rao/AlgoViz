import React from 'react';
import { EngineEvent } from '../../types/engine';

export interface StatsPanelProps {
  currentEvent: EngineEvent | null;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ currentEvent }) => {
  const stats = currentEvent?.stats ?? {};
  const statsEntries = Object.entries(stats);

  return (
    <div
      className="stats-panel"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '0.75rem',
        padding: '0.85rem 1.25rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
      }}
    >
      <div style={{ padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
          Canonical Delay
        </div>
        <div style={{ fontSize: '1.2rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-color)' }}>
          {currentEvent ? `${currentEvent.canonical_duration_ms}ms` : '—'}
        </div>
      </div>

      {statsEntries.map(([key, value]) => {
        const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
        return (
          <div
            key={key}
            style={{ padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '6px' }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              {formattedKey}
            </div>
            <div
              style={{
                fontSize: '1.2rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: 'var(--accent-color, #10b981)',
              }}
            >
              {value}
            </div>
          </div>
        );
      })}

      {statsEntries.length === 0 && (
        <div style={{ padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Metrics Status
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Awaiting execution metrics
          </div>
        </div>
      )}
    </div>
  );
};
