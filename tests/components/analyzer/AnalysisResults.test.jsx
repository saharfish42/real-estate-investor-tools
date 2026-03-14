// tests/components/analyzer/AnalysisResults.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AnalysisResults from '../../../src/components/analyzer/AnalysisResults';

describe('AnalysisResults', () => {
  const mockCalculations = {
    monthlyIncome: 2500,
    monthlyExpenses: 975,
    mortgagePayment: 1596.45,
    monthlyCashFlow: -71.45,
    annualCashFlow: -857.4,
    totalCashInvested: 69000,
    cashOnCashReturn: -1.24,
    noi: 18300,
    capRate: 6.1,
    loanAmount: 240000,
    totalInterest: 334722,
    totalPaid: 574722
  };

  it('should render all metric cards', () => {
    render(<AnalysisResults calculations={mockCalculations} />);

    expect(screen.getByRole('heading', { name: /Monthly Cash Flow/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Annual Returns/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Financing Details/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Expense Breakdown/i })).toBeInTheDocument();
  });

  it('should display formatted currency values', () => {
    render(<AnalysisResults calculations={mockCalculations} />);

    // Monthly cash flow should be formatted and displayed
    expect(screen.getByText('Monthly Income:')).toBeInTheDocument();
    expect(screen.getByText('$2,500.00')).toBeInTheDocument(); // income
    expect(screen.getByText('Monthly Expenses:')).toBeInTheDocument();
  });

  it('should color-code negative cash flow in red', () => {
    render(<AnalysisResults calculations={mockCalculations} />);

    const negativeValue = screen.getByText(/-\$71\.45/);
    expect(negativeValue).toHaveClass('text-error');
  });

  it('should color-code positive cash flow in green', () => {
    const positiveCashFlow = {
      ...mockCalculations,
      monthlyCashFlow: 500,
      annualCashFlow: 6000,
      cashOnCashReturn: 8.7
    };

    render(<AnalysisResults calculations={positiveCashFlow} />);

    const positiveValue = screen.getByText(/\$500\.00/);
    expect(positiveValue).toHaveClass('text-success');
  });
});
