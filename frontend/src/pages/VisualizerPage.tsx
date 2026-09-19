import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchAlgorithmById } from '../api/algorithms.api';
import { visualizeAlgorithm } from '../api/visualize.api';
import { AlgorithmDTO } from '../types/algorithm';
import { usePlaybackEngine } from '../hooks/usePlaybackEngine';
import { PlaybackControls } from '../components/visualizer/PlaybackControls';
import { TimelineSlider } from '../components/visualizer/TimelineSlider';
import { StatsPanel } from '../components/visualizer/StatsPanel';
import { StatusBanner } from '../components/visualizer/StatusBanner';
import { ArrayVisualizer } from '../components/visualizer/ArrayVisualizer';
import { SearchVisualizer } from '../components/visualizer/SearchVisualizer';
import { DataStructureVisualizer } from '../components/visualizer/DataStructureVisualizer';
import { TreeVisualizer } from '../components/visualizer/TreeVisualizer';
import { GraphVisualizer } from '../components/visualizer/GraphVisualizer';
import { VisualizerInputForm } from '../components/visualizer/VisualizerInputForm';

const SUPPORTED_ALGORITHMS = new Set([
  // Sorting (Phase 10D)
  'bubble_sort',
  'selection_sort',
  'insertion_sort',
  'merge_sort',
  'quick_sort',
  // Searching (Phase 10D)
  'linear_search',
  'binary_search',
  // Data Structures (Phase 10F)
  'stack',
  'queue',
  'linked_list',
  // Trees (Phase 10F)
  'binary_tree',
  'bst',
  // Graphs (Phase 10F)
  'bfs',
  'dfs',
]);

export const VisualizerPage: React.FC = () => {
  const { algorithmId } = useParams<{ algorithmId: string }>();
  const [algorithm, setAlgorithm] = useState<AlgorithmDTO | null>(null);
  const [metaLoading, setMetaLoading] = useState<boolean>(true);
  const [metaError, setMetaError] = useState<string | null>(null);

  const [executing, setExecuting] = useState<boolean>(false);
  const [executionError, setExecutionError] = useState<string | null>(null);

  const playback = usePlaybackEngine();

  const loadAlgorithm = useCallback(async () => {
    if (!algorithmId) {
      setMetaError('Algorithm identifier is missing.');
      setMetaLoading(false);
      return;
    }

    setMetaLoading(true);
    setMetaError(null);
    playback.reset();

    try {
      const data = await fetchAlgorithmById(algorithmId);
      setAlgorithm(data);
    } catch (err: any) {
      setMetaError(err.message || `Algorithm '${algorithmId}' could not be loaded.`);
    } finally {
      setMetaLoading(false);
    }
  }, [algorithmId]);

  useEffect(() => {
    loadAlgorithm();
  }, [loadAlgorithm]);

  const handleRunVisualization = async (payloadOrArray: any, target?: number) => {
    if (!algorithm) return;

    setExecuting(true);
    setExecutionError(null);
    playback.startLoading();

    try {
      let inputPayload: any;
      if (Array.isArray(payloadOrArray)) {
        const isSearch = algorithm.category === 'searching';
        inputPayload = isSearch ? { array: payloadOrArray, target: target ?? 0 } : { array: payloadOrArray };
      } else {
        inputPayload = payloadOrArray;
      }

      const response = await visualizeAlgorithm({
        algorithm: algorithm.id,
        input: inputPayload,
      });

      if (response.success && response.events) {
        playback.loadTrace(response.events);
      } else {
        throw new Error('Received an invalid visualization response from engine.');
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to execute algorithm visualization.';
      setExecutionError(msg);
      playback.setError(msg);
    } finally {
      setExecuting(false);
    }
  };

  const isSupported = algorithmId ? SUPPORTED_ALGORITHMS.has(algorithmId) : false;
  const isSorting = algorithm?.category === 'sorting';
  const isSearching = algorithm?.category === 'searching';
  const isDataStructure = algorithm?.category === 'data_structures';
  const isTree = algorithm?.category === 'trees';
  const isGraph = algorithm?.category === 'graphs';

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Top Breadcrumb & Status Nav */}
      <div
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <Link
          to="/catalog"
          className="btn btn-secondary"
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
        >
          &larr; Back to Catalog
        </Link>
        <span className="badge badge-primary">
          {isSupported ? 'Interactive Visualizer' : 'Metadata Shell'}
        </span>
      </div>

      {/* Metadata Loading Spinner */}
      {metaLoading && (
        <div className="loading-container" role="status" aria-label="Loading algorithm details">
          <div className="spinner" />
          <p>
            Loading algorithm metadata for <code>{algorithmId}</code>...
          </p>
        </div>
      )}

      {/* Metadata Error State */}
      {metaError && (
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }} role="alert">
          <span className="badge" style={{ marginBottom: '1rem', color: 'var(--error-color)' }}>
            Algorithm Unavailable
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Algorithm Not Found
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
            {metaError}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={loadAlgorithm}>
              Retry
            </button>
            <Link to="/catalog" className="btn btn-primary">
              Return to Catalog
            </Link>
          </div>
        </div>
      )}

      {/* Main Algorithm View */}
      {!metaLoading && !metaError && algorithm && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Card */}
          <div className="card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginBottom: '0.75rem',
              }}
            >
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
                  {algorithm.category.replace('_', ' ')}
                </span>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{algorithm.name}</h1>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="badge">Order #{algorithm.display_order}</span>
                <span className="badge">
                  <code>{algorithm.input_type}</code>
                </span>
                <code style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{algorithm.id}</code>
              </div>
            </div>

            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              {algorithm.description}
            </p>

            {/* Complexity Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              <div style={{ padding: '0.85rem', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Best Time
                </div>
                <div style={{ fontSize: '1.1rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-color)' }}>
                  {algorithm.complexity.time.best}
                </div>
              </div>
              <div style={{ padding: '0.85rem', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Average Time
                </div>
                <div style={{ fontSize: '1.1rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-color)' }}>
                  {algorithm.complexity.time.average}
                </div>
              </div>
              <div style={{ padding: '0.85rem', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Worst Time
                </div>
                <div style={{ fontSize: '1.1rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-color)' }}>
                  {algorithm.complexity.time.worst}
                </div>
              </div>
              <div style={{ padding: '0.85rem', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Worst Space
                </div>
                <div style={{ fontSize: '1.1rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-color, #10b981)' }}>
                  {algorithm.complexity.space}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Workspace for all 14 algorithms */}
          {isSupported ? (
            <div className="visualizer-workspace" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                  Visualization Workspace
                </h2>
              </div>

              {/* Input Form */}
              <VisualizerInputForm
                algorithmId={algorithm.id}
                category={algorithm.category}
                isLoading={executing}
                onSubmit={handleRunVisualization}
              />

              {/* Execution Error Banner */}
              {executionError && (
                <div className="error-banner" role="alert">
                  <div className="error-title">Visualization Execution Failed</div>
                  <div className="error-message">{executionError}</div>
                </div>
              )}

              {/* Live Status Banner */}
              <StatusBanner
                currentEvent={playback.currentEvent}
                state={playback.state}
                currentIndex={playback.currentIndex}
                totalSteps={playback.totalSteps}
              />

              {/* Visualizer Renderer Canvas */}
              {isSorting && (
                <ArrayVisualizer
                  currentEvent={playback.currentEvent}
                  algorithmId={algorithm.id}
                />
              )}

              {isSearching && (
                <SearchVisualizer
                  currentEvent={playback.currentEvent}
                  algorithmId={algorithm.id}
                />
              )}

              {isDataStructure && (
                <DataStructureVisualizer
                  currentEvent={playback.currentEvent}
                  algorithmId={algorithm.id}
                />
              )}

              {isTree && (
                <TreeVisualizer
                  currentEvent={playback.currentEvent}
                  algorithmId={algorithm.id}
                />
              )}

              {isGraph && (
                <GraphVisualizer
                  currentEvent={playback.currentEvent}
                  algorithmId={algorithm.id}
                />
              )}

              {/* Playback Controls Toolbar */}
              <PlaybackControls
                isPlaying={playback.isPlaying}
                canPlay={playback.totalSteps > 0}
                canStepForward={playback.totalSteps > 0 && playback.currentIndex < playback.totalSteps - 1}
                canStepBackward={playback.totalSteps > 0 && playback.currentIndex > 0}
                canRestart={playback.totalSteps > 0 && playback.currentIndex > 0}
                speed={playback.speed}
                onPlay={playback.play}
                onPause={playback.pause}
                onStepForward={playback.stepForward}
                onStepBackward={playback.stepBackward}
                onRestart={playback.restart}
                onSpeedChange={playback.setSpeed}
              />

              {/* Timeline Scrubber */}
              <TimelineSlider
                currentIndex={playback.currentIndex}
                totalSteps={playback.totalSteps}
                disabled={playback.totalSteps <= 1}
                onSeek={playback.seek}
              />

              {/* Live Cumulative Statistics */}
              <StatsPanel currentEvent={playback.currentEvent} />
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <span className="badge" style={{ marginBottom: '1rem' }}>
                Algorithm Unavailable
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Visualization Workspace
              </h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
                Visualizer for <strong>{algorithm.name}</strong> is currently unavailable.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
