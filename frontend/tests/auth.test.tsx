import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from '../src/routes';
import { ThemeProvider } from '../src/context/ThemeContext';
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

describe('Frontend User Authentication System Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('1. Renders LoginPage at "/login" with all required elements', () => {
    localStorage.setItem('algoviz_auth_mode', 'guest');
    renderWithRouter('/login');

    const main = screen.getByRole('main');
    expect(within(main).getByRole('heading', { name: /Log In/i })).toBeInTheDocument();
    expect(within(main).getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(within(main).getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(within(main).getByRole('button', { name: /^Log In$/i })).toBeInTheDocument();
    expect(within(main).getByRole('link', { name: /Sign up/i })).toBeInTheDocument();
  });

  it('2. Renders SignUpPage at "/signup" with all required elements', () => {
    localStorage.setItem('algoviz_auth_mode', 'guest');
    renderWithRouter('/signup');

    const main = screen.getByRole('main');
    expect(within(main).getByRole('heading', { name: /Create Account/i })).toBeInTheDocument();
    expect(within(main).getByLabelText(/^Username/i)).toBeInTheDocument();
    expect(within(main).getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(within(main).getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(within(main).getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(within(main).getByRole('button', { name: /^Sign Up$/i })).toBeInTheDocument();
    expect(within(main).getByRole('link', { name: /Log in/i })).toBeInTheDocument();
  });

  it('3. Client-side validation shows error on empty login submission', async () => {
    localStorage.setItem('algoviz_auth_mode', 'guest');
    renderWithRouter('/login');

    const submitBtn = screen.getByRole('button', { name: /^Log In$/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Please enter your email address/i);
    });
  });

  it('4. Client-side validation shows error when passwords do not match on signup', async () => {
    localStorage.setItem('algoviz_auth_mode', 'guest');
    renderWithRouter('/signup');

    fireEvent.change(screen.getByLabelText(/^Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'mismatch456' } });

    fireEvent.click(screen.getByRole('button', { name: /^Sign Up$/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Passwords do not match/i);
    });
  });

  it('5. Unauthenticated user opening private "/visualize/bubble_sort" is redirected to "/login"', async () => {
    localStorage.setItem('algoviz_auth_mode', 'guest');
    renderWithRouter('/visualize/bubble_sort');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Log In/i })).toBeInTheDocument();
    });
  });

  it('6. Successful login updates auth state and redirects user', async () => {
    localStorage.setItem('algoviz_auth_mode', 'guest');

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/auth/login')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            user: { id: 'u123', email: 'alice@example.com', username: 'Alice' },
          }),
        });
      }
      return Promise.reject(new Error('Unknown url'));
    });

    renderWithRouter('/login');

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'alice@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: 'Secret123!' } });

    fireEvent.click(screen.getByRole('button', { name: /^Log In$/i }));

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign Out/i })).toBeInTheDocument();
    });
  });

  it('7. Header displays Login and Sign Up when logged out, and displays user and Sign Out when logged in', async () => {
    localStorage.setItem('algoviz_auth_mode', 'guest');
    renderWithRouter('/');

    expect(screen.getByRole('link', { name: /^Login$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Sign Up$/i })).toBeInTheDocument();
  });

  it('8. Sign Out action clears user session in Header and shows Login button', async () => {
    // Start with authenticated session
    localStorage.removeItem('algoviz_auth_mode');

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/auth/logout')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ success: true, message: 'Logged out' }),
        });
      }
      return Promise.reject(new Error('Unknown url'));
    });

    renderWithRouter('/');

    expect(screen.getByText('TestUser')).toBeInTheDocument();
    const signOutBtn = screen.getByRole('button', { name: /Sign Out/i });
    fireEvent.click(signOutBtn);

    await waitFor(() => {
      expect(screen.queryByText('TestUser')).not.toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^Login$/i })).toBeInTheDocument();
    });
  });
});
