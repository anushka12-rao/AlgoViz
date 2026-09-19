import React from 'react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>
          Interactive Algorithm Visualizer
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          AlgoViz Platform
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.7 }}>
          High-fidelity algorithm visualizations powered by a verified headless C++ execution engine.
          Explore step-by-step state transitions, canonical timings, and asymptotic complexities.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/catalog" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}>
            Explore Algorithm Catalog
          </Link>
          <Link to="/visualize/bubble_sort" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}>
            Try Bubble Sort
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Sorting</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Bubble, Selection, Insertion, Merge, Quick Sort.</p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Searching</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Linear Search and Binary Search with range boundaries.</p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Data Structures</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Stack, Queue, and Singly Linked List operations.</p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Trees & Graphs</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Binary Tree, BST, BFS, and DFS traversals.</p>
        </div>
      </div>
    </div>
  );
};
