import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from '../src/routes';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { ErrorBoundary } from '../src/components/common/ErrorBoundary';

const MOCK_APP_ALGORITHMS = [
  {
    id: 'bubble_sort',
    name: 'Bubble Sort',
    category: 'sorting',
    description: 'Compares and swaps adjacent elements repeatedly.',
    complexity: { time: { best: 'O(n)', average: 'O(n^2)', worst: 'O(n^2)' }, space: 'O(1)' },
    input_type: 'array',
    display_order: 1,
  },
  {
    id: 'quick_sort',
    name: 'Quick Sort',
    category: 'sorting',
    description: 'Partition-based sorting algorithm using a pivot.',
    complexity: { time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n^2)' }, space: 'O(log n)' },
    input_type: 'array',
    display_order: 5,
  },
  {
    id: 'bfs',
    name: 'Breadth-First Search (BFS)',
    category: 'graphs',
    description: 'Level-order graph traversal using a queue.',
    complexity: { time: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' }, space: 'O(V)' },
    input_type: 'graph_edges',
    display_order: 13,
  },
];

function renderWithRouter(initialEntry = '/') {
  const router = createMemoryRouter(routes, {
    initialEntries: [initialEntry],
  });

  return render(
    <ErrorBoundary>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

describe('Phase 10B Frontend Foundation Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders HomePage at root route "/"', () => {
    renderWithRouter('/');
    expect(screen.getByRole('heading', { name: /AlgoViz Platform/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explore Algorithm Catalog/i })).toBeInTheDocument();
  });

  it('renders CatalogPage at "/catalog" with 14 algorithm cards', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: MOCK_APP_ALGORITHMS,
      }),
    });

    renderWithRouter('/catalog');
    expect(screen.getByRole('heading', { name: /Algorithm Catalog/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Bubble Sort')).toBeInTheDocument();
    });
    expect(screen.getByText('Breadth-First Search (BFS)')).toBeInTheDocument();
  });

  it('renders VisualizerPage with algorithm parameter at "/visualize/:algorithmId"', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: MOCK_APP_ALGORITHMS[1],
      }),
    });

    renderWithRouter('/visualize/quick_sort');
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Quick Sort/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/Visualization Workspace Shell/i)).toBeInTheDocument();
  });

  it('renders AdminLoginPage at "/admin/login"', () => {
    renderWithRouter('/admin/login');
    expect(screen.getByRole('heading', { name: /Admin Authentication/i })).toBeInTheDocument();
  });

  it('renders AdminDashboardPage at "/admin/dashboard"', () => {
    renderWithRouter('/admin/dashboard');
    expect(screen.getByRole('heading', { name: /Admin Dashboard/i })).toBeInTheDocument();
    expect(screen.getByText(/Administrative Control Boundary/i)).toBeInTheDocument();
  });

  it('renders NotFoundPage at unknown route "/non-existent-page"', () => {
    renderWithRouter('/non-existent-page');
    expect(screen.getByRole('heading', { name: /Page Not Found/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Return to Home/i })).toBeInTheDocument();
  });

  it('ThemeContext toggles theme and sets data-theme attribute on root', () => {
    const TestThemeComponent = () => {
      const { theme, toggleTheme } = useTheme();
      return (
        <div>
          <span data-testid="current-theme">{theme}</span>
          <button onClick={toggleTheme}>Toggle</button>
        </div>
      );
    };

    render(
      <ThemeProvider>
        <TestThemeComponent />
      </ThemeProvider>
    );

    const themeSpan = screen.getByTestId('current-theme');
    const initialTheme = themeSpan.textContent;
    const button = screen.getByRole('button', { name: /Toggle/i });

    fireEvent.click(button);

    const newTheme = themeSpan.textContent;
    expect(newTheme).not.toBe(initialTheme);
    expect(document.documentElement.getAttribute('data-theme')).toBe(newTheme);
  });

  it('ErrorBoundary renders safe fallback banner without stack traces on uncaught error', () => {
    const ProblemChild = () => {
      throw new Error('Simulated rendering failure');
    };

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.queryByText(/Simulated rendering failure/i)).not.toBeInTheDocument();
  });
});
