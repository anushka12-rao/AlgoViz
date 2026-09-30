import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { getAdminAlgorithmsApi, updateAlgorithmStatusApi } from '../api/admin-catalog.api';
import { AdminAlgorithm } from '../types/admin-catalog';

export const AdminDashboardPage: React.FC = () => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const [algorithms, setAlgorithms] = useState<AdminAlgorithm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchAlgorithms() {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminAlgorithmsApi();
        if (isMounted) {
          setAlgorithms(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load algorithm catalog');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchAlgorithms();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/admin/login', { replace: true });
    } catch {
      navigate('/admin/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  const handleToggleStatus = async (algo: AdminAlgorithm) => {
    const nextStatus = !algo.is_enabled;
    setUpdatingId(algo.id);
    setError(null);

    try {
      const updated = await updateAlgorithmStatusApi(algo.id, nextStatus);
      setAlgorithms((prev) =>
        prev.map((item) => (item.id === algo.id ? { ...item, is_enabled: updated.is_enabled } : item))
      );
    } catch (err: any) {
      setError(err.message || `Failed to update status for ${algo.name}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const enabledCount = algorithms.filter((a) => a.is_enabled).length;
  const disabledCount = algorithms.length - enabledCount;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage algorithm availability and system health settings.
          </p>
        </div>
        {admin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {admin.email}
            </span>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleLogout}
              disabled={loggingOut}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
            >
              {loggingOut ? 'Signing out...' : 'Admin Sign Out'}
            </button>
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
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

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>Algorithm Catalog Management</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Enable or disable algorithms across the AlgoViz catalog.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
              Total: {algorithms.length}
            </span>
            <span className="badge" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: 'var(--success-color)' }}>
              Enabled: {enabledCount}
            </span>
            {disabledCount > 0 && (
              <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--error-color)' }}>
                Disabled: {disabledCount}
              </span>
            )}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderLeft: '4px solid var(--error-color)',
              borderRadius: '4px',
              color: 'var(--error-color)',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading catalog algorithms...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Order</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Algorithm</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {algorithms.map((algo) => (
                  <tr
                    key={algo.id}
                    data-testid={`admin-algo-row-${algo.id}`}
                    style={{
                      borderBottom: '1px solid var(--border-light)',
                      opacity: algo.is_enabled ? 1 : 0.75,
                    }}
                  >
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>
                      #{algo.display_order}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{algo.name}</div>
                      <code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{algo.id}</code>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className="badge">{algo.category.replace('_', ' ')}</span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: algo.is_enabled
                            ? 'rgba(34, 197, 94, 0.15)'
                            : 'rgba(239, 68, 68, 0.15)',
                          color: algo.is_enabled ? 'var(--success-color)' : 'var(--error-color)',
                          fontWeight: 700,
                        }}
                      >
                        {algo.is_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        aria-label={`Toggle ${algo.name} status`}
                        className={algo.is_enabled ? 'btn btn-secondary' : 'btn btn-primary'}
                        onClick={() => handleToggleStatus(algo)}
                        disabled={updatingId === algo.id}
                        style={{
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.8rem',
                          minWidth: '80px',
                        }}
                      >
                        {updatingId === algo.id
                          ? 'Updating...'
                          : algo.is_enabled
                          ? 'Disable'
                          : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
