import React from 'react';
import { Link } from 'react-router-dom';

const ALGORITHM_IDS = [
  { id: 'bubble_sort', name: 'Bubble Sort', category: 'Sorting' },
  { id: 'selection_sort', name: 'Selection Sort', category: 'Sorting' },
  { id: 'insertion_sort', name: 'Insertion Sort', category: 'Sorting' },
  { id: 'merge_sort', name: 'Merge Sort', category: 'Sorting' },
  { id: 'quick_sort', name: 'Quick Sort', category: 'Sorting' },
  { id: 'linear_search', name: 'Linear Search', category: 'Searching' },
  { id: 'binary_search', name: 'Binary Search', category: 'Searching' },
  { id: 'stack', name: 'Stack', category: 'Data Structures' },
  { id: 'queue', name: 'Queue', category: 'Data Structures' },
  { id: 'linked_list', name: 'Linked List', category: 'Data Structures' },
  { id: 'binary_tree', name: 'Binary Tree', category: 'Trees' },
  { id: 'bst', name: 'Binary Search Tree', category: 'Trees' },
  { id: 'bfs', name: 'Breadth-First Search (BFS)', category: 'Graphs' },
  { id: 'dfs', name: 'Depth-First Search (DFS)', category: 'Graphs' },
];

export const CatalogPage: React.FC = () => {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Algorithm Catalog</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Browse all 14 algorithms supported by the AlgoViz execution engine.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {ALGORITHM_IDS.map((algo) => (
          <div key={algo.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span className="badge" style={{ marginBottom: '0.5rem' }}>{algo.category}</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                {algo.name}
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Canonical ID: <code>{algo.id}</code>
              </p>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to={`/visualize/${algo.id}`} className="btn btn-primary" style={{ width: '100%' }}>
                Visualize
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
