// tests/pages/DealAnalyzer.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import DealAnalyzer from '../../src/pages/DealAnalyzer';

// Mock useAuth hook
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-123', email: 'test@example.com' }
  })
}));

describe('DealAnalyzer', () => {
  it('should render PropertyForm and AnalysisResults', () => {
    render(
      <BrowserRouter>
        <DealAnalyzer />
      </BrowserRouter>
    );

    // Form should be present
    expect(screen.getByText(/Property Details/i)).toBeInTheDocument();

    // Results should be present
    expect(screen.getByText(/Analysis Results/i)).toBeInTheDocument();
  });

  it('should render save button', () => {
    render(
      <BrowserRouter>
        <DealAnalyzer />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /Save Property/i })).toBeInTheDocument();
  });

  it('should show validation errors when trying to save without required fields', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <DealAnalyzer />
      </BrowserRouter>
    );

    const saveButton = screen.getByRole('button', { name: /Save Property/i });
    await user.click(saveButton);

    // Should show validation errors
    expect(screen.getByText(/Address is required/i)).toBeInTheDocument();
  });
});
