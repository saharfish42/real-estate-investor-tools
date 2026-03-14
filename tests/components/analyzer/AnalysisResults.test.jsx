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

describe('AnalysisResults - Task 9: Investment Summary Card', () => {
  const mockCalculationsWithBRRRR = {
    monthlyIncome: 2500,
    monthlyExpenses: 975,
    mortgagePayment: 1596.45,
    monthlyCashFlow: -71.45,
    annualCashFlow: -857.4,
    totalCashInvested: 10000,
    cashOnCashReturn: -8.57,
    noi: 18300,
    capRate: 6.1,
    loanAmount: 240000,
    totalInterest: 334722,
    totalPaid: 574722,
    purchasePrice: 250000,
    cashDown: 50000,
    initialLoan: 200000,
    rehabBudget: 20000,
    cashPulledOut: 40000,
    netCashInvested: 10000
  };

  it('should render Investment Summary card with heading', () => {
    render(<AnalysisResults calculations={mockCalculationsWithBRRRR} />);
    expect(screen.getByRole('heading', { name: /Investment Summary/i })).toBeInTheDocument();
  });

  it('should display Purchase Price', () => {
    render(<AnalysisResults calculations={mockCalculationsWithBRRRR} />);
    expect(screen.getByText(/Purchase Price:/i)).toBeInTheDocument();
  });

  it('should display Cash Down', () => {
    render(<AnalysisResults calculations={mockCalculationsWithBRRRR} />);
    expect(screen.getByText(/Cash Down:/i)).toBeInTheDocument();
    expect(screen.getByText('$50,000.00')).toBeInTheDocument();
  });

  it('should display Initial Loan', () => {
    render(<AnalysisResults calculations={mockCalculationsWithBRRRR} />);
    expect(screen.getByText(/Initial Loan:/i)).toBeInTheDocument();
  });

  it('should display Rehab Budget', () => {
    render(<AnalysisResults calculations={mockCalculationsWithBRRRR} />);
    expect(screen.getByText(/Rehab Budget:/i)).toBeInTheDocument();
    expect(screen.getByText('$20,000.00')).toBeInTheDocument();
  });

  it('should display Refinance Loan when present', () => {
    render(<AnalysisResults calculations={mockCalculationsWithBRRRR} />);
    expect(screen.getByText(/Refinance Loan:/i)).toBeInTheDocument();
    const refinanceLoanElements = screen.getAllByText('$240,000.00');
    expect(refinanceLoanElements.length).toBeGreaterThan(0);
  });

  it('should display Cash Pulled Out', () => {
    render(<AnalysisResults calculations={mockCalculationsWithBRRRR} />);
    expect(screen.getByText(/Cash Pulled Out:/i)).toBeInTheDocument();
    expect(screen.getByText('$40,000.00')).toBeInTheDocument();
  });

  it('should display Net Cash Invested', () => {
    render(<AnalysisResults calculations={mockCalculationsWithBRRRR} />);
    expect(screen.getByText(/Net Cash Invested:/i)).toBeInTheDocument();
    const netCashElements = screen.getAllByText('$10,000.00');
    expect(netCashElements.length).toBeGreaterThan(0);
  });

  it('should hide Refinance Loan when not present', () => {
    const calcWithoutRefinance = {
      ...mockCalculationsWithBRRRR,
      loanAmount: 200000,
      initialLoan: 200000,
      cashPulledOut: 0,
      netCashInvested: 50000
    };
    render(<AnalysisResults calculations={calcWithoutRefinance} />);
    expect(screen.queryByText(/Refinance Loan:/i)).not.toBeInTheDocument();
  });

  it('should hide Cash Pulled Out when zero', () => {
    const calcWithoutRefinance = {
      ...mockCalculationsWithBRRRR,
      loanAmount: 200000,
      cashPulledOut: 0,
      netCashInvested: 50000
    };
    render(<AnalysisResults calculations={calcWithoutRefinance} />);
    expect(screen.queryByText(/Cash Pulled Out:/i)).not.toBeInTheDocument();
  });

  it('should render Investment Summary card before Monthly Cash Flow card', () => {
    render(<AnalysisResults calculations={mockCalculationsWithBRRRR} />);

    const headings = screen.getAllByRole('heading', { level: 3 });
    const headingTexts = headings.map(h => h.textContent);

    const investmentSummaryIndex = headingTexts.indexOf('Investment Summary');
    const monthlyCashFlowIndex = headingTexts.indexOf('Monthly Cash Flow');

    expect(investmentSummaryIndex).toBeGreaterThan(-1);
    expect(monthlyCashFlowIndex).toBeGreaterThan(-1);
    expect(investmentSummaryIndex).toBeLessThan(monthlyCashFlowIndex);
  });
});

describe('AnalysisResults - Task 10: Financing Details Card', () => {
  const mockCalculations = {
    monthlyIncome: 2500,
    monthlyExpenses: 975,
    mortgagePayment: 1596.45,
    monthlyCashFlow: -71.45,
    annualCashFlow: -857.4,
    totalCashInvested: 10000,
    cashOnCashReturn: -8.57,
    noi: 18300,
    capRate: 6.1,
    loanAmount: 240000,
    totalInterest: 334722,
    totalPaid: 574722,
    purchasePrice: 250000,
    cashDown: 50000,
    initialLoan: 200000,
    rehabBudget: 20000,
    cashPulledOut: 40000,
    netCashInvested: 10000
  };

  it('should display "Active Loan Amount" label instead of "Loan Amount"', () => {
    render(<AnalysisResults calculations={mockCalculations} />);
    expect(screen.getByText(/Active Loan Amount:/i)).toBeInTheDocument();
    expect(screen.queryByText(/^Loan Amount:/i)).not.toBeInTheDocument();
  });

  it('should display active loan amount value', () => {
    render(<AnalysisResults calculations={mockCalculations} />);
    expect(screen.getByText(/Active Loan Amount:/i)).toBeInTheDocument();
    const activeLoanElements = screen.getAllByText('$240,000.00');
    expect(activeLoanElements.length).toBeGreaterThan(0);
  });
});
