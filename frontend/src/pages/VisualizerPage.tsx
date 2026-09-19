import React from 'react';
import { useParams, Link } from 'react-router-dom';

export const VisualizerPage: React.FC = () => {
  const { algorithmId } = useParams<{ algorithmId: string }>();

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Link to="/catalog" style={{ fontSize: '0.875rem', color: 'var(--primary-color)', textDecoration: 'none' }}>
            &larr; Back to Catalog
          </Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>
            Algorithm Visualizer: <code>{algorithmId}</code>
          </h1>
        </div>
        <span className="badge badge-primary">Phase 10B Placeholder</span>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Visualization Workspace</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
          This is the visualizer shell for algorithm <strong>{algorithmId}</strong>.
          In subsequent phases (10C &ndash; 10G), this workspace will host the interactive input controls,
          SVG/canvas animation, narrative step descriptions, and authoritative C++ playback controls.
        </p>
        <div style={{ display: 'inline-block', padding: '0.75rem 1.25rem', background: 'var(--bg-secondary)', borderRadius: '6px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          API Integration Target: <code>POST /api/visualize</code> with <code>{`{ algorithm: "${algorithmId}", input: ... }`}</code>
        </div>
      </div>
    </div>
  );
};
