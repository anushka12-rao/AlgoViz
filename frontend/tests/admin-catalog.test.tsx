import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from '../src/routes';
import { ThemeProvider } from '../src/context/ThemeContext';
import { ErrorBoundary } from '../src/components/common/ErrorBoundary';
import { AdminAlgorithm } from '../src/types/admin-catalog';

const MOCK_ADMIN_ALGORITHMS: AdminAlgorithm[] = [
  {
    id: 'bubble_sort',
    name: 'Bubble Sort',
    category: 'sorting',
    description: 'Compares adjacent elements.',
    complexity: { time: { best: 'O(n)', average: 'O(n^2)', worst: 'O(n^2)' }, space: 'O(1)' },
    input_type: 'array',
    display_order: 1,
    is_enabled: true,
  },
  {
    id: 'quick_sort',
    name: 'Quick Sort',
    category: 'sorting',
    description: 'Partition-based sorting.',
    complexity: { time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n^2)' }, space: 'O(log n)' },
    input_type: 'array',
    display_order: 5,
    is_enabled: true,
  },
  {
    id: 'linear_search',
    name: 'Linear Search',
    category: 'searching',
    description: 'Sequentially checks elements.',
    complexity: { time: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' }, space: 'O(1)' },
    input_type: 'array_and_target',
    display_order: 7,
    is_enabled: false,
  },
];

function renderWithRouter(initialEntry = '/admin/dashboard') {
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

describe('Frontend Admin Catalog Management Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  // 1. Renders catalog management table with all algorithms and statuses
  it('1. Fetches and renders all algorithms with their status in Admin Dashboard', async () => {
    global.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes('/admin/algorithms')) {
        expect(init?.credentials).toBe('include');
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: MOCK_ADMIN_ALGORITHMS,
          }),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch URL: ${url}`));
    });

    renderWithRouter('/admin/dashboard');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Algorithm Catalog Management/i })).toBeInTheDocument();
      expect(screen.getByText('Total: 3')).toBeInTheDocument();
      expect(screen.getByText('Enabled: 2')).toBeInTheDocument();
      expect(screen.getByText('Disabled: 1')).toBeInTheDocument();
    });

    expect(screen.getByText('Bubble Sort')).toBeInTheDocument();
    expect(screen.getByText('Quick Sort')).toBeInTheDocument();
    expect(screen.getByText('Linear Search')).toBeInTheDocument();

    const bubbleRow = screen.getByTestId('admin-algo-row-bubble_sort');
    expect(bubbleRow).toHaveTextContent('Enabled');
    expect(bubbleRow).toHaveTextContent('Disable');

    const linearRow = screen.getByTestId('admin-algo-row-linear_search');
    expect(linearRow).toHaveTextContent('Disabled');
    expect(linearRow).toHaveTextContent('Enable');
  });

  // 2. Disabling an enabled algorithm
  it('2. Disabling an enabled algorithm calls API and updates row status and button', async () => {
    let patchCalled = false;

    global.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.endsWith('/admin/algorithms') && (!init || init.method === 'GET' || !init.method)) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: [...MOCK_ADMIN_ALGORITHMS],
          }),
        });
      }

      if (url.includes('/admin/algorithms/bubble_sort') && init?.method === 'PATCH') {
        expect(init.credentials).toBe('include');
        expect(JSON.parse(init.body as string)).toEqual({ enabled: false });
        patchCalled = true;
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: { ...MOCK_ADMIN_ALGORITHMS[0], is_enabled: false },
          }),
        });
      }

      return Promise.reject(new Error(`Unhandled fetch URL: ${url}`));
    });

    renderWithRouter('/admin/dashboard');

    await waitFor(() => {
      expect(screen.getByText('Bubble Sort')).toBeInTheDocument();
    });

    const bubbleRow = screen.getByTestId('admin-algo-row-bubble_sort');
    const disableBtn = bubbleRow.querySelector('button')!;
    expect(disableBtn).toHaveTextContent('Disable');

    fireEvent.click(disableBtn);

    await waitFor(() => {
      expect(patchCalled).toBe(true);
      expect(bubbleRow).toHaveTextContent('Disabled');
      expect(bubbleRow).toHaveTextContent('Enable');
      expect(screen.getByText('Enabled: 1')).toBeInTheDocument();
      expect(screen.getByText('Disabled: 2')).toBeInTheDocument();
    });
  });

  // 3. Enabling a disabled algorithm
  it('3. Enabling a disabled algorithm calls API and updates row status and button', async () => {
    let patchCalled = false;

    global.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.endsWith('/admin/algorithms') && (!init || init.method === 'GET' || !init.method)) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: [...MOCK_ADMIN_ALGORITHMS],
          }),
        });
      }

      if (url.includes('/admin/algorithms/linear_search') && init?.method === 'PATCH') {
        expect(init.credentials).toBe('include');
        expect(JSON.parse(init.body as string)).toEqual({ enabled: true });
        patchCalled = true;
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: { ...MOCK_ADMIN_ALGORITHMS[2], is_enabled: true },
          }),
        });
      }

      return Promise.reject(new Error(`Unhandled fetch URL: ${url}`));
    });

    renderWithRouter('/admin/dashboard');

    await waitFor(() => {
      expect(screen.getByText('Linear Search')).toBeInTheDocument();
    });

    const linearRow = screen.getByTestId('admin-algo-row-linear_search');
    const enableBtn = linearRow.querySelector('button')!;
    expect(enableBtn).toHaveTextContent('Enable');

    fireEvent.click(enableBtn);

    await waitFor(() => {
      expect(patchCalled).toBe(true);
      expect(linearRow).toHaveTextContent('Enabled');
      expect(linearRow).toHaveTextContent('Disable');
      expect(screen.getByText('Enabled: 3')).toBeInTheDocument();
    });
  });

  // 4. Displays error alert when status update fails
  it('4. Displays error alert when updating algorithm status fails', async () => {
    global.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.endsWith('/admin/algorithms') && (!init || init.method === 'GET' || !init.method)) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: [...MOCK_ADMIN_ALGORITHMS],
          }),
        });
      }

      if (url.includes('/admin/algorithms/bubble_sort') && init?.method === 'PATCH') {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: async () => ({
            success: false,
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Failed to update algorithm status in SQLite',
            },
          }),
        });
      }

      return Promise.reject(new Error(`Unhandled fetch URL: ${url}`));
    });

    renderWithRouter('/admin/dashboard');

    await waitFor(() => {
      expect(screen.getByText('Bubble Sort')).toBeInTheDocument();
    });

    const bubbleRow = screen.getByTestId('admin-algo-row-bubble_sort');
    const disableBtn = bubbleRow.querySelector('button')!;
    fireEvent.click(disableBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Failed to update algorithm status in SQLite/i);
      // Status in row remains unchanged
      expect(bubbleRow).toHaveTextContent('Enabled');
      expect(bubbleRow).toHaveTextContent('Disable');
    });
  });

  // 5. Verifies no tokens stored in client storage
  it('5. Does not store tokens or credentials in localStorage or sessionStorage during catalog operations', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: MOCK_ADMIN_ALGORITHMS,
      }),
    });

    renderWithRouter('/admin/dashboard');

    await waitFor(() => {
      expect(screen.getByText('Bubble Sort')).toBeInTheDocument();
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('admin_token')).toBeNull();
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('admin_token')).toBeNull();
  });
});
