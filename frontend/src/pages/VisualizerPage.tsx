import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchAlgorithmById } from '../api/algorithms.api';
import { AlgorithmDTO } from '../types/algorithm';

export const VisualizerPage: React.FC = () => {
  const { algorithmId } = useParams<{ algorithmId: string }>();
  const [algorithm, setAlgorithm] = useState<AlgorithmDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAlgorithm = async () => {
    if (!algorithmId) {
      setError('Algorithm identifier is missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchAlgorithmById(algorithmId);
      setAlgorithm(data);
    } catch (err: any) {
      setError(err.message || `Algorithm '${algorithmId}' could not be loaded.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlgorithm();
  }, [algorithmId]);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Link
          to="/catalog"
          className="btn btn-secondary"
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
        >
          &larr; Back to Catalog
        </Link>
        <span className="badge badge-primary">Metadata Shell (Phase 10C)</span>
      </div>

      {loading && (
        <div className="loading-container" role="status" aria-label="Loading algorithm details">
          <div className="spinner" />
          <p>Loading algorithm metadata for <code>{algorithmId}</code>...</p>
        </div>
      )}

      {error && (
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }} role="alert">
          <span className="badge" style={{ marginBottom: '1rem', color: 'var(--error-color)' }}>
            Algorithm Unavailable
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Algorithm Not Found
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
            {error}
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

      {!loading && !error && algorithm && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
                  {algorithm.category.replace('_', ' ')}
                </span>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{algorithm.name}</h1>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className="badge">Order #{algorithm.display_order}</span>
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
                <div style={{ fontSize: '1.1rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-color)' }}>
                  {algorithm.complexity.space}
                </div>
              </div>
            </div>
          </div>

          {/* Visualizer Shell Placeholder Card */}
          <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Visualization Workspace Shell
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
              This workspace is connected to the backend metadata service.
              In Phase 10D and subsequent phases, this canvas will host the interactive input controls,
              SVG/Canvas visualizer, and authoritative C++ playback controls.
            </p>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: 'var(--bg-secondary)', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Execution Input Type:</span>
              <code style={{ color: 'var(--primary-color)', fontWeight: 600 }}>{algorithm.input_type}</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
