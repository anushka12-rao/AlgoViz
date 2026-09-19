import React from 'react';
import { Link } from 'react-router-dom';

export const AdminLoginPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '420px', margin: '3rem auto' }}>
      <div className="card">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>
          Admin Authentication
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          Administrative access to AlgoViz catalog settings.
        </p>

        <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <strong>Note (Phase 10B):</strong> Authentication flow and secure session management will be integrated in Phase 10I.
        </div>

        <Link to="/admin/dashboard" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
          Proceed to Dashboard (Placeholder)
        </Link>
      </div>
    </div>
  );
};
