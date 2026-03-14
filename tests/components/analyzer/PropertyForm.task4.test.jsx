import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PropertyForm from '../../../src/components/analyzer/PropertyForm';

describe('PropertyForm - Task 4: Expense Labels', () => {
  const defaultValues = {
    address: '',
    bedrooms: '',
    bathrooms: '',
    purchasePrice: '',
    cashDown: '',
    initialLoan: '',
    monthlyRent: '',
    expenses: {
      propertyTax: '',
      insurance: '',
      hoa: '',
      managementPercent: 10,
      maintenancePercent: 1,
      vacancyPercent: 5
    },
    financing: {
      interestRate: 7,
      loanTerm: 30
    },
    refinance: {
      refinanceLoan: ''
    }
  };

  it('should show "Property Tax (annual)" label instead of "annual ÷ 12"', () => {
    const mockOnChange = vi.fn();
    render(<PropertyForm values={defaultValues} onChange={mockOnChange} />);

    const propertyTaxLabel = screen.getByLabelText(/property tax.*annual/i);
    expect(propertyTaxLabel).toBeInTheDocument();

    // Should NOT contain "÷ 12" text
    expect(screen.queryByText(/÷ 12/)).not.toBeInTheDocument();
  });

  it('should show "Insurance (annual)" label instead of "annual ÷ 12"', () => {
    const mockOnChange = vi.fn();
    render(<PropertyForm values={defaultValues} onChange={mockOnChange} />);

    const insuranceLabel = screen.getByLabelText(/insurance.*annual/i);
    expect(insuranceLabel).toBeInTheDocument();
  });

  it('should still show "HOA Fees" without annual notation', () => {
    const mockOnChange = vi.fn();
    render(<PropertyForm values={defaultValues} onChange={mockOnChange} />);

    const hoaLabel = screen.getByLabelText(/hoa fees/i);
    expect(hoaLabel).toBeInTheDocument();
  });
});
