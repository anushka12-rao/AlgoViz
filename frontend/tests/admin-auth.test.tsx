import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from '../src/routes';
import { ThemeProvider } from '../src/context/ThemeContext';
import { ErrorBoundary } from '../src/components/common/ErrorBoundary';

function renderWithRouter(initialEntry = '/admin/login') {
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

describe('Frontend Administrator Authentication System Tests', () => {
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

  // 1. Unauthenticated admin redirect
  it('1. Unauthenticated operator accessing "/admin/dashboard" is redirected to "/admin/login"', async () => {
    localStorage.setItem('algoviz_admin_mode', 'unauthenticated');
    renderWithRouter('/admin/dashboard');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Admin Authentication/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In as Admin/i })).toBeInTheDocument();
    });
  });

  // 2. Successful admin login
  it('2. Successful admin login sends credentials to /api/admin/login and navigates to "/admin/dashboard"', async () => {
    localStorage.setItem('algoviz_admin_mode', 'unauthenticated');

    const adminUser = { email: 'admin@algoviz.test', role: 'admin' as const };

    global.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes('/admin/login')) {
        expect(init?.credentials).toBe('include');
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            admin: adminUser,
          }),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch URL: ${url}`));
    });

    renderWithRouter('/admin/login');

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'admin@algoviz.test' },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: 'CorrectAdminPassword123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign In as Admin/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Admin Dashboard/i })).toBeInTheDocument();
      expect(screen.getByText('admin@algoviz.test')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Admin Sign Out/i })).toBeInTheDocument();
    });
  });

  // 3. Failed admin login
  it('3. Failed admin login displays appropriate error message and does not navigate', async () => {
    localStorage.setItem('algoviz_admin_mode', 'unauthenticated');

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/admin/login')) {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: async () => ({
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Invalid email or password.',
            },
          }),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch URL: ${url}`));
    });

    renderWithRouter('/admin/login');

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'wrong@algoviz.test' },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: 'WrongPassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign In as Admin/i }));

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/Invalid email or password/i);
    });

    // Remained on admin login page
    expect(screen.getByRole('heading', { name: /Admin Authentication/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Admin Dashboard/i })).not.toBeInTheDocument();
  });

  // 4. Admin session restoration
  it('4. Restores admin session on page load via /api/admin/me', async () => {
    localStorage.setItem('algoviz_admin_mode', 'verify_session');

    global.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes('/admin/me')) {
        expect(init?.credentials).toBe('include');
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            admin: {
              email: 'restored.admin@algoviz.test',
              role: 'admin',
            },
          }),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch URL: ${url}`));
    });

    renderWithRouter('/admin/dashboard');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Admin Dashboard/i })).toBeInTheDocument();
      expect(screen.getByText('restored.admin@algoviz.test')).toBeInTheDocument();
    });
  });

  // 5. Admin logout
  it('5. Admin logout calls /api/admin/logout and navigates back to /admin/login', async () => {
    // Start with default authenticated admin in test mode
    let logoutCalled = false;

    global.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes('/admin/logout')) {
        expect(init?.credentials).toBe('include');
        logoutCalled = true;
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            message: 'Admin logged out successfully',
          }),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch URL: ${url}`));
    });

    renderWithRouter('/admin/dashboard');

    expect(screen.getByRole('heading', { name: /Admin Dashboard/i })).toBeInTheDocument();
    const logoutBtn = screen.getByRole('button', { name: /Admin Sign Out/i });

    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(logoutCalled).toBe(true);
      expect(screen.getByRole('heading', { name: /Admin Authentication/i })).toBeInTheDocument();
    });
  });

  // 6. No admin token stored in client storage
  it('6. Neither localStorage nor sessionStorage store admin JWT or secret credentials', async () => {
    localStorage.setItem('algoviz_admin_mode', 'unauthenticated');

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/admin/login')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            admin: { email: 'admin@algoviz.test', role: 'admin' },
          }),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch URL: ${url}`));
    });

    renderWithRouter('/admin/login');

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'admin@algoviz.test' },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: 'AdminPassword123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign In as Admin/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Admin Dashboard/i })).toBeInTheDocument();
    });

    // Check localStorage
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('admin_token')).toBeNull();
    expect(localStorage.getItem('jwt')).toBeNull();
    expect(localStorage.getItem('admin_jwt')).toBeNull();

    // Check sessionStorage
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('admin_token')).toBeNull();
    expect(sessionStorage.getItem('jwt')).toBeNull();
    expect(sessionStorage.getItem('admin_jwt')).toBeNull();
  });
});
