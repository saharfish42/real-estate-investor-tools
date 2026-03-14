import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../src/pages/Dashboard';

// Mock useAuth hook
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-123', email: 'test@example.com' },
    signOut: vi.fn()
  })
}));

describe('Dashboard', () => {
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
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const analyzerLink = screen.getByRole('link', { name: /Analyze New Deal/i });
    expect(analyzerLink).toHaveAttribute('href', '/analyzer');
  });

  it('should navigate to properties when clicking My Properties', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const propertiesLink = screen.getByRole('link', { name: /My Properties/i });
    expect(propertiesLink).toHaveAttribute('href', '/properties');
  });
});
