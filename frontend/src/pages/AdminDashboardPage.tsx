import React from 'react';

export const AdminDashboardPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage algorithm availability and system health settings.
        </p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Administrative Control Boundary</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
          This administrative dashboard allows authorized operators to toggle algorithm status (<code>is_enabled</code>)
          in SQLite and monitor runtime metrics.
        </p>

        <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '6px', borderLeft: '4px solid var(--primary-color)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>Security Policy:</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Administrative actions are strictly confined to metadata operations. Arbitrary engine paths,
            source code modification, and executable uploads are prohibited by architectural policy.
          </p>
        </div>
      </div>
    </div>
  );
};
