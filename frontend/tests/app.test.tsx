import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from '../src/routes';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { ErrorBoundary } from '../src/components/common/ErrorBoundary';
import { normalizeApiBaseUrl } from '../src/api/config';
import { apiClient } from '../src/api/client';

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
    expect(screen.getByText(/Visualization Workspace/i)).toBeInTheDocument();
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

  describe('API URL Normalization & Status Code Error Handling', () => {
    it('normalizeApiBaseUrl correctly formats API URLs with or without /api and trailing slashes', () => {
      expect(normalizeApiBaseUrl(undefined)).toBe('/api');
      expect(normalizeApiBaseUrl('')).toBe('/api');
      expect(normalizeApiBaseUrl('   ')).toBe('/api');
      expect(normalizeApiBaseUrl('/api')).toBe('/api');
      expect(normalizeApiBaseUrl('/api/')).toBe('/api');
      expect(normalizeApiBaseUrl('https://algoviz-api-zezm.onrender.com')).toBe(
        'https://algoviz-api-zezm.onrender.com/api'
      );
      expect(normalizeApiBaseUrl('https://algoviz-api-zezm.onrender.com/')).toBe(
        'https://algoviz-api-zezm.onrender.com/api'
      );
      expect(normalizeApiBaseUrl('https://algoviz-api-zezm.onrender.com/api')).toBe(
        'https://algoviz-api-zezm.onrender.com/api'
      );
      expect(normalizeApiBaseUrl('https://algoviz-api-zezm.onrender.com/api/')).toBe(
        'https://algoviz-api-zezm.onrender.com/api'
      );
    });

    it('apiClient distinguishes 401 Unauthorized from connection failure', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required. Please log in.' },
        }),
      });

      await expect(apiClient('/api/auth/me')).rejects.toMatchObject({
        name: 'ApiError',
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Please log in.',
      });
    });

    it('apiClient provides status-specific default message when error body has no message', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ success: false }),
      });

      await expect(apiClient('/api/admin/me')).rejects.toMatchObject({
        name: 'ApiError',
        statusCode: 403,
        code: 'FORBIDDEN',
        message: expect.stringContaining('Access forbidden'),
      });
    });

    it('apiClient handles non-JSON HTTP errors with status-specific defaults', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 502,
        json: async () => {
          throw new Error('Not JSON');
        },
      });

      await expect(apiClient('/api/visualize')).rejects.toMatchObject({
        name: 'ApiError',
        statusCode: 502,
        code: 'SERVER_ERROR',
        message: expect.stringContaining('Server error'),
      });
    });

    it('apiClient handles network disconnection as NETWORK_ERROR with connection message', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(apiClient('/api/algorithms')).rejects.toMatchObject({
        name: 'ApiError',
        statusCode: 0,
        code: 'NETWORK_ERROR',
        message: expect.stringContaining('Unable to connect to the server'),
      });
    });
  });
});
