import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DealAnalyzer from '../../src/pages/DealAnalyzer';

// Mock useAuth hook
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-123', email: 'test@example.com' }
  })
}));

describe('DealAnalyzer - Task 5: DEFAULT_VALUES', () => {
  it('should have cashDown field instead of downPaymentPercent', () => {
    render(
      <BrowserRouter>
        <DealAnalyzer />
      </BrowserRouter>
    );

    // Should have cashDown field
    expect(screen.getByLabelText(/cash down payment/i)).toBeInTheDocument();

    // Should NOT have downPaymentPercent field (old field)
    expect(screen.queryByLabelText(/down payment.*%/i)).not.toBeInTheDocument();
  });

  it('should have initialLoan field instead of calculated loan amount', () => {
    render(
      <BrowserRouter>
        <DealAnalyzer />
      </BrowserRouter>
    );

    // Should have initialLoan field
    expect(screen.getByLabelText(/initial loan amount/i)).toBeInTheDocument();
  });

  it('should not have closingCosts field', () => {
    render(
      <BrowserRouter>
        <DealAnalyzer />
      </BrowserRouter>
    );

    // Should NOT have closingCosts field (old field)
    expect(screen.queryByLabelText(/closing costs/i)).not.toBeInTheDocument();
  });

  it('should have refinanceLoan field in refinance section', () => {
    render(
      <BrowserRouter>
        <DealAnalyzer />
      </BrowserRouter>
    );

    // Should have refinanceLoan field
    expect(screen.getByLabelText(/refinance loan amount/i)).toBeInTheDocument();
  });
});
