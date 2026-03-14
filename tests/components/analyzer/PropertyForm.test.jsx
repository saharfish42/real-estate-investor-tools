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
    closingCosts: '',
    downPaymentPercent: 20,
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

    const downPaymentInput = screen.getByLabelText(/Down Payment/i);
    expect(downPaymentInput).toHaveValue(20);

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
});
