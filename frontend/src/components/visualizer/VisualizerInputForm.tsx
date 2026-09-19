import React, { useState, useEffect } from 'react';

export interface VisualizerInputFormProps {
  algorithmId: string;
  category: string;
  isLoading: boolean;
  onSubmit: (array: number[], target?: number) => void;
}

const PRESETS = {
  sorting: [
    { label: 'Random (10)', array: [34, 12, 89, 45, 23, 67, 8, 91, 52, 19] },
    { label: 'Nearly Sorted', array: [10, 20, 25, 30, 45, 40, 50, 60] },
    { label: 'Reverse Sorted', array: [50, 40, 30, 20, 10] },
    { label: 'Duplicates', array: [5, 2, 8, 5, 2, 9, 8, 1] },
  ],
  searching: [
    { label: 'Found (Mid)', array: [10, 20, 30, 40, 50, 60, 70], target: 40 },
    { label: 'Found (Edge)', array: [10, 20, 30, 40, 50, 60, 70], target: 10 },
    { label: 'Not Found', array: [10, 20, 30, 40, 50, 60, 70], target: 99 },
    { label: 'Unsorted Input', array: [50, 20, 10, 40, 30], target: 40 },
  ],
};

export const VisualizerInputForm: React.FC<VisualizerInputFormProps> = ({
  algorithmId,
  category,
  isLoading,
  onSubmit,
}) => {
  const isSearch = category === 'searching';
  const defaultArray = isSearch
    ? [10, 20, 30, 40, 50, 60, 70]
    : [34, 12, 89, 45, 23, 67, 8, 91, 52, 19];
  const defaultTarget = 40;

  const [arrayStr, setArrayStr] = useState<string>(defaultArray.join(', '));
  const [targetVal, setTargetVal] = useState<number>(defaultTarget);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Check if binary search input is unsorted to render educational notice
  const isBinarySearch = algorithmId === 'binary_search';
  const [isUnsortedNotice, setIsUnsortedNotice] = useState<boolean>(false);

  useEffect(() => {
    if (!isBinarySearch) {
      setIsUnsortedNotice(false);
      return;
    }
    const numbers = arrayStr
      .split(/[\s,]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    let unsorted = false;
    for (let i = 0; i < numbers.length - 1; i++) {
      if (numbers[i] > numbers[i + 1]) {
        unsorted = true;
        break;
      }
    }
    setIsUnsortedNotice(unsorted);
  }, [arrayStr, isBinarySearch]);

  const handlePresetClick = (arr: number[], tgt?: number) => {
    setArrayStr(arr.join(', '));
    if (tgt !== undefined) {
      setTargetVal(tgt);
    }
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Parse array string
    const rawTokens = arrayStr.split(/[\s,]+/).filter((s) => s.trim().length > 0);
    if (rawTokens.length === 0) {
      setValidationError('Please provide at least 1 integer element.');
      return;
    }
    if (rawTokens.length > 50) {
      setValidationError('Array cannot exceed 50 elements (engine safety limit).');
      return;
    }

    const parsedNumbers: number[] = [];
    for (const token of rawTokens) {
      const num = Number(token);
      if (isNaN(num) || !Number.isInteger(num)) {
        setValidationError(`'${token}' is not a valid integer.`);
        return;
      }
      if (num < -10000 || num > 10000) {
        setValidationError(`Value '${num}' is outside allowed bounds (-10000 to 10000).`);
        return;
      }
      parsedNumbers.push(num);
    }

    if (isSearch) {
      if (isNaN(targetVal) || !Number.isInteger(targetVal)) {
        setValidationError('Search target must be a valid integer.');
        return;
      }
      if (targetVal < -10000 || targetVal > 10000) {
        setValidationError('Search target must be between -10000 and 10000.');
        return;
      }
      onSubmit(parsedNumbers, targetVal);
    } else {
      onSubmit(parsedNumbers);
    }
  };

  const presetList = isSearch ? PRESETS.searching : PRESETS.sorting;

  return (
    <form
      onSubmit={handleSubmit}
      className="card visualizer-input-form"
      style={{
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
          Algorithm Execution Input
        </h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Limits: 1–50 integers (-10000 to 10000)
        </span>
      </div>

      {/* Preset Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Presets:</span>
        {presetList.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className="btn btn-secondary"
            onClick={() => handlePresetClick(preset.array, (preset as any).target)}
            disabled={isLoading}
            style={{ padding: '0.25rem 0.65rem', fontSize: '0.8rem' }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Input Controls */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label htmlFor="array-input" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Array Elements (comma-separated):
          </label>
          <input
            id="array-input"
            type="text"
            className="btn-secondary"
            value={arrayStr}
            onChange={(e) => setArrayStr(e.target.value)}
            disabled={isLoading}
            placeholder="e.g. 5, 2, 8, 1, 9"
            style={{
              padding: '0.55rem 0.85rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
              background: 'var(--bg-primary)',
              width: '100%',
            }}
          />
        </div>

        {isSearch && (
          <div style={{ flex: '0 1 140px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label htmlFor="target-input" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Target:
            </label>
            <input
              id="target-input"
              type="number"
              className="btn-secondary"
              value={targetVal}
              onChange={(e) => setTargetVal(parseInt(e.target.value, 10))}
              disabled={isLoading}
              style={{
                padding: '0.55rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                color: 'var(--text-primary)',
                background: 'var(--bg-primary)',
                width: '100%',
              }}
            />
          </div>
        )}
      </div>

      {/* Binary Search Unsorted Notice */}
      {isUnsortedNotice && (
        <div
          role="note"
          style={{
            fontSize: '0.85rem',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            background: 'var(--bg-secondary)',
            borderLeft: '3px solid var(--accent-color, #10b981)',
            color: 'var(--text-secondary)',
          }}
        >
          <strong>Notice:</strong> Binary search runs on the engine's sorted copy of the input.
        </div>
      )}

      {/* Validation Alert */}
      {validationError && (
        <div
          role="alert"
          style={{
            fontSize: '0.85rem',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            background: 'rgba(239, 68, 68, 0.1)',
            borderLeft: '3px solid var(--error-color, #ef4444)',
            color: 'var(--error-color, #ef4444)',
          }}
        >
          {validationError}
        </div>
      )}

      {/* Submit Trigger */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
          style={{
            padding: '0.55rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {isLoading ? (
            <>
              <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
              <span>Executing Engine...</span>
            </>
          ) : (
            <span>🚀 Run Visualization</span>
          )}
        </button>
      </div>
    </form>
  );
};
