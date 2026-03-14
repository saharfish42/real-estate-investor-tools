import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../src/pages/Dashboard';

// Mock signOut function
const mockSignOut = vi.fn();

// Mock useAuth hook
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

// Import after mocking
import { useAuth } from '../../src/hooks/useAuth';

describe('Dashboard', () => {
  beforeEach(() => {
    mockSignOut.mockClear();
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: 'test-user-123', email: 'test@example.com' },
      signOut: mockSignOut,
      loading: false
    });
  });

  it('should render dashboard page', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('RE Investor Tools')).toBeInTheDocument();
  });

  it('should render navigation card to analyzer', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/Analyze New Deal/i)).toBeInTheDocument();
  });

  it('should render navigation card to properties', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/My Properties/i)).toBeInTheDocument();
  });

  it('should navigate to analyzer when clicking Analyze New Deal', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const analyzerLink = screen.getByRole('link', { name: /Analyze New Deal/i });
    expect(analyzerLink).toHaveAttribute('href', '/analyzer');
  });

  it('should navigate to properties when clicking My Properties', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const propertiesLink = screen.getByRole('link', { name: /My Properties/i });
    expect(propertiesLink).toHaveAttribute('href', '/properties');
  });

  it('should display user email initial when no photoURL', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('should call signOut when logout button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const logoutButton = screen.getByRole('button', { name: /Logout/i });
    await user.click(logoutButton);

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('should display user photoURL when available', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        uid: 'test-user-123',
        email: 'test@example.com',
        photoURL: 'https://example.com/photo.jpg',
        displayName: 'Test User'
      },
      signOut: mockSignOut,
      loading: false
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const avatar = screen.getByRole('img', { name: /Test User/i });
    expect(avatar).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });
});
