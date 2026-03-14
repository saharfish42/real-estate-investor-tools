import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropertyForm from '../../../src/components/analyzer/PropertyForm';

describe('PropertyForm', () => {
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

  it('should render all form sections', () => {
    const onChange = vi.fn();
    render(<PropertyForm values={defaultValues} onChange={onChange} errors={{}} />);

    // Check for section headings - use more specific matchers for headings
    const headings = screen.getAllByRole('heading', { level: 3 });
    const headingTexts = headings.map(h => h.textContent);

    expect(headingTexts).toContain('Property Information');
    expect(headingTexts).toContain('Purchase Details');
    expect(headingTexts).toContain('Income');
    expect(headingTexts).toContain('Monthly Expenses');
    expect(headingTexts).toContain('Financing');
    expect(headingTexts).toContain('Refinance');
  });

  it('should render required input fields', () => {
    const onChange = vi.fn();
    render(<PropertyForm values={defaultValues} onChange={onChange} errors={{}} />);

    expect(screen.getByLabelText(/^Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Purchase Price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Monthly Rent/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Interest Rate/i)).toBeInTheDocument();
  });

  it('should display default values', () => {
    const onChange = vi.fn();
    render(<PropertyForm values={defaultValues} onChange={onChange} errors={{}} />);

    const interestRateInput = screen.getByLabelText(/Interest Rate/i);
    expect(interestRateInput).toHaveValue(7);
  });

  it('should call onChange when inputs change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PropertyForm values={defaultValues} onChange={onChange} errors={{}} />);

    const addressInput = screen.getByLabelText(/^Address/i);
    await user.type(addressInput, '123 Main St');

    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0]).toMatchObject({
      address: expect.stringContaining('1')
    });
  });

  it('should render new purchase detail fields', () => {
    const mockOnChange = vi.fn();
    const values = {
      ...defaultValues,
      purchasePrice: 256200,
      cashDown: 44000,
      initialLoan: 232500
    };

    render(<PropertyForm values={values} onChange={mockOnChange} />);

    // Should have new fields
    expect(screen.getByLabelText(/cash down payment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/initial loan amount/i)).toBeInTheDocument();

    // Should NOT have old fields
    expect(screen.queryByLabelText(/closing costs/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/down payment.*%/i)).not.toBeInTheDocument();

    // Should show calculated rehab budget (read-only)
    const rehabBudget = screen.getByLabelText(/rehab budget/i);
    expect(rehabBudget).toBeInTheDocument();
    expect(rehabBudget).toHaveAttribute('readonly');
    expect(rehabBudget).toHaveValue('20300'); // 232500 + 44000 - 256200
  });

  it('should call onChange when cash down changes', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(<PropertyForm values={defaultValues} onChange={mockOnChange} />);

    const cashDownInput = screen.getByLabelText(/cash down payment/i);
    await user.type(cashDownInput, '50000');

    expect(mockOnChange).toHaveBeenCalled();
    // Check that onChange was called with a numeric value for cashDown
    const calls = mockOnChange.mock.calls;
    const hasNumericCashDown = calls.some(call => typeof call[0].cashDown === 'number');
    expect(hasNumericCashDown).toBe(true);
  });

  it('should call onChange when initial loan changes', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(<PropertyForm values={defaultValues} onChange={mockOnChange} />);

    const initialLoanInput = screen.getByLabelText(/initial loan amount/i);
    await user.type(initialLoanInput, '240000');

    expect(mockOnChange).toHaveBeenCalled();
    // Check that onChange was called with a numeric value for initialLoan
    const calls = mockOnChange.mock.calls;
    const hasNumericInitialLoan = calls.some(call => typeof call[0].initialLoan === 'number');
    expect(hasNumericInitialLoan).toBe(true);
  });

  it('should render refinance section with refinance loan input', () => {
    const mockOnChange = vi.fn();
    render(<PropertyForm values={defaultValues} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/refinance loan/i)).toBeInTheDocument();
  });

  it('should call onChange when refinance loan changes', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(<PropertyForm values={defaultValues} onChange={mockOnChange} />);

    const refinanceLoanInput = screen.getByLabelText(/refinance loan/i);
    await user.type(refinanceLoanInput, '280000');

    expect(mockOnChange).toHaveBeenCalled();
    const calls = mockOnChange.mock.calls;
    const hasNumericRefinanceLoan = calls.some(call => typeof call[0].refinance?.refinanceLoan === 'number');
    expect(hasNumericRefinanceLoan).toBe(true);
  });

  it('should calculate cash pulled out correctly', () => {
    const mockOnChange = vi.fn();
    const values = {
      ...defaultValues,
      initialLoan: 232500,
      refinance: {
        refinanceLoan: 280000
      }
    };

    render(<PropertyForm values={values} onChange={mockOnChange} />);

    const cashPulledOutField = screen.getByLabelText(/cash pulled out/i);
    expect(cashPulledOutField).toBeInTheDocument();
    expect(cashPulledOutField).toHaveAttribute('readonly');
    expect(cashPulledOutField).toHaveValue('47500'); // 280000 - 232500
  });

  it('should show zero cash pulled out when refinance loan is not provided', () => {
    const mockOnChange = vi.fn();
    const values = {
      ...defaultValues,
      initialLoan: 232500,
      refinance: {
        refinanceLoan: ''
      }
    };

    render(<PropertyForm values={values} onChange={mockOnChange} />);

    const cashPulledOutField = screen.getByLabelText(/cash pulled out/i);
    expect(cashPulledOutField).toHaveValue('0');
  });

  it('should calculate net cash invested correctly', () => {
    const mockOnChange = vi.fn();
    const values = {
      ...defaultValues,
      cashDown: 44000,
      initialLoan: 232500,
      refinance: {
        refinanceLoan: 280000
      }
    };

    render(<PropertyForm values={values} onChange={mockOnChange} />);

    const netCashInvestedField = screen.getByLabelText(/net cash invested/i);
    expect(netCashInvestedField).toBeInTheDocument();
    expect(netCashInvestedField).toHaveAttribute('readonly');
    expect(netCashInvestedField).toHaveValue('-3500'); // 44000 - 47500
  });

  it('should show original cash down as net cash invested when no refinance', () => {
    const mockOnChange = vi.fn();
    const values = {
      ...defaultValues,
      cashDown: 44000,
      initialLoan: 232500,
      refinance: {
        refinanceLoan: ''
      }
    };

    render(<PropertyForm values={values} onChange={mockOnChange} />);

    const netCashInvestedField = screen.getByLabelText(/net cash invested/i);
    expect(netCashInvestedField).toHaveValue('44000'); // 44000 - 0
  });
});
