import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchAlgorithms } from '../api/algorithms.api';
import { AlgorithmDTO, AlgorithmCategory } from '../types/algorithm';

const CATEGORY_LABELS: Record<AlgorithmCategory, string> = {
  sorting: 'Sorting Algorithms',
  searching: 'Searching Algorithms',
  data_structures: 'Data Structures',
  trees: 'Tree Structures',
  graphs: 'Graph Algorithms',
};

const CATEGORY_ORDER: AlgorithmCategory[] = [
  'sorting',
  'searching',
  'data_structures',
  'trees',
  'graphs',
];

export const CatalogPage: React.FC = () => {
  const [algorithms, setAlgorithms] = useState<AlgorithmDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadCatalog = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAlgorithms();
      setAlgorithms(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load algorithm catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  // Filter and group while strictly preserving display_order
  const groupedAlgorithms = useMemo(() => {
    const groups: { category: AlgorithmCategory; label: string; items: AlgorithmDTO[] }[] = [];

    for (const cat of CATEGORY_ORDER) {
      if (selectedCategory !== 'all' && selectedCategory !== cat) {
        continue;
      }
      const items = algorithms.filter((algo) => algo.category === cat);
      if (items.length > 0) {
        groups.push({
          category: cat,
          label: CATEGORY_LABELS[cat] || cat,
          items: items.sort((a, b) => a.display_order - b.display_order),
        });
      }
    }

    return groups;
  }, [algorithms, selectedCategory]);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Algorithm Catalog</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Explore and analyze all 14 algorithms backed by the native C++ execution engine.
        </p>
      </div>

      {loading && (
        <div className="loading-container" role="status" aria-label="Loading algorithms">
          <div className="spinner" />
          <p>Loading algorithm catalog...</p>
        </div>
      )}

      {error && (
        <div className="error-banner" role="alert">
          <div className="error-title">Unable to Load Catalog</div>
          <div className="error-message">{error}</div>
          <div>
            <button type="button" className="btn btn-primary" onClick={loadCatalog}>
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Category Filter Pills */}
          <div className="category-filter-bar" role="tablist" aria-label="Filter by category">
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategory === 'all'}
              className={`filter-pill ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Categories ({algorithms.length})
            </button>
            {CATEGORY_ORDER.map((cat) => {
              const count = algorithms.filter((a) => a.category === cat).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={selectedCategory === cat}
                  className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {CATEGORY_LABELS[cat]} ({count})
                </button>
              );
            })}
          </div>

          {/* Grouped Category Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {groupedAlgorithms.map((group) => (
              <section key={group.category} aria-labelledby={`cat-title-${group.category}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <h2
                    id={`cat-title-${group.category}`}
                    style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}
                  >
                    {group.label}
                  </h2>
                  <span className="badge">{group.items.length}</span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  {group.items.map((algo) => (
                    <article
                      key={algo.id}
                      className="card"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '0.5rem',
                          }}
                        >
                          <span className="badge badge-primary">{CATEGORY_LABELS[algo.category] || algo.category}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            #{algo.display_order}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                          {algo.name}
                        </h3>

                        <p
                          style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.5,
                            marginBottom: '1rem',
                            minHeight: '2.8rem',
                          }}
                        >
                          {algo.description}
                        </p>

                        {/* Complexity Breakdown */}
                        <div className="complexity-grid" aria-label="Complexity specifications">
                          <div className="complexity-item">
                            <span className="complexity-label">Time (Avg)</span>
                            <span className="complexity-val">{algo.complexity.time.average}</span>
                          </div>
                          <div className="complexity-item">
                            <span className="complexity-label">Time (Worst)</span>
                            <span className="complexity-val">{algo.complexity.time.worst}</span>
                          </div>
                          <div className="complexity-item">
                            <span className="complexity-label">Space</span>
                            <span className="complexity-val">{algo.complexity.space}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: '1.25rem' }}>
                        <Link
                          to={`/visualize/${algo.id}`}
                          className="btn btn-primary"
                          style={{ width: '100%', textAlign: 'center' }}
                        >
                          Open Visualizer
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
