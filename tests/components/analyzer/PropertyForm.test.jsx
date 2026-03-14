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
    }
  };

  it('should render all form sections', () => {
    const onChange = vi.fn();
    render(<PropertyForm values={defaultValues} onChange={onChange} errors={{}} />);

    // Check for section headings
    expect(screen.getByText(/Property Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Purchase Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Income/i)).toBeInTheDocument();
    expect(screen.getByText(/Monthly Expenses/i)).toBeInTheDocument();
    expect(screen.getByText(/Financing/i)).toBeInTheDocument();
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
});
