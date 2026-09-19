import React from 'react';

export interface TimelineSliderProps {
  currentIndex: number;
  totalSteps: number;
  disabled?: boolean;
  onSeek: (targetIndex: number) => void;
}

export const TimelineSlider: React.FC<TimelineSliderProps> = ({
  currentIndex,
  totalSteps,
  disabled = false,
  onSeek,
}) => {
  const maxIndex = totalSteps > 0 ? totalSteps - 1 : 0;
  const currentStepNumber = totalSteps > 0 ? currentIndex + 1 : 0;
  const progressPercent = totalSteps > 1 ? (currentIndex / maxIndex) * 100 : totalSteps === 1 ? 100 : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      onSeek(val);
    }
  };

  return (
    <div
      className="timeline-slider-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
        padding: '0.75rem 1.25rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.85rem',
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Timeline Progress</span>
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-color)', fontWeight: 700 }}>
          Step {currentStepNumber} / {totalSteps} ({progressPercent.toFixed(0)}%)
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={maxIndex}
        value={currentIndex}
        disabled={disabled || totalSteps <= 1}
        onChange={handleChange}
        aria-label="Algorithm event timeline scrubber"
        aria-valuemin={0}
        aria-valuemax={maxIndex}
        aria-valuenow={currentIndex}
        aria-valuetext={`Step ${currentStepNumber} of ${totalSteps}`}
        style={{
          width: '100%',
          cursor: disabled || totalSteps <= 1 ? 'not-allowed' : 'pointer',
          accentColor: 'var(--primary-color)',
          height: '6px',
        }}
      />
    </div>
  );
};
