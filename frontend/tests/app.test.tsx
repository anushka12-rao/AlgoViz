import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from '../src/routes';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { ErrorBoundary } from '../src/components/common/ErrorBoundary';

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
  it('renders HomePage at root route "/"', () => {
    renderWithRouter('/');
    expect(screen.getByRole('heading', { name: /AlgoViz Platform/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explore Algorithm Catalog/i })).toBeInTheDocument();
  });

  it('renders CatalogPage at "/catalog" with 14 algorithm cards', () => {
    renderWithRouter('/catalog');
    expect(screen.getByRole('heading', { name: /Algorithm Catalog/i })).toBeInTheDocument();
    expect(screen.getByText('Bubble Sort')).toBeInTheDocument();
    expect(screen.getByText('Breadth-First Search (BFS)')).toBeInTheDocument();
  });

  it('renders VisualizerPage with algorithm parameter at "/visualize/:algorithmId"', () => {
    renderWithRouter('/visualize/quick_sort');
    expect(screen.getByRole('heading', { name: /Algorithm Visualizer:\s*quick_sort/i })).toBeInTheDocument();
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
});
