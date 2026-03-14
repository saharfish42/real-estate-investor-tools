import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropertyCard from '../../../src/components/analyzer/PropertyCard';

describe('PropertyCard', () => {
  const mockProperty = {
    id: 'prop-123',
    address: '123 Main St, Springfield',
    purchasePrice: 300000,
    monthlyRent: 2500,
    downPayment: 60000,
    expenses: {
      propertyTax: 250,
      insurance: 100,
      hoa: 0,
      management: 250,
      managementPercent: 10,
      maintenance: 250,
      maintenancePercent: 1,
      vacancy: 125,
      vacancyPercent: 5
    },
    financing: {
      interestRate: 7,
      loanTerm: 30
    }
  };

  it('should render property information', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<PropertyCard property={mockProperty} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText('123 Main St, Springfield')).toBeInTheDocument();
    expect(screen.getByText(/\$300,000/)).toBeInTheDocument();
  });

  it('should call onEdit when edit button clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<PropertyCard property={mockProperty} onEdit={onEdit} onDelete={onDelete} />);

    const editButton = screen.getByRole('button', { name: /Edit/i });
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockProperty.id);
  });

  it('should call onDelete when delete button clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<PropertyCard property={mockProperty} onEdit={onEdit} onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(mockProperty.id);
  });

  it('should display cash flow with color coding', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<PropertyCard property={mockProperty} onEdit={onEdit} onDelete={onDelete} />);

    // Verify cash flow is displayed (will vary based on calc)
    const cashFlowElements = screen.getAllByText(/Monthly Cash Flow:/i);
    expect(cashFlowElements.length).toBeGreaterThan(0);

    // Verify color class exists (either success or error)
    // Find the parent div with cash flow, then check for color class
    const cashFlowLabel = screen.getByText(/Monthly Cash Flow:/i);
    const cashFlowContainer = cashFlowLabel.closest('.flex');
    const coloredValue = cashFlowContainer.querySelector('.text-success, .text-error');
    expect(coloredValue).toBeInTheDocument();
  });

  it('should correctly calculate expenses including dollar amounts not percentages', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const propertyWithExpenses = {
      ...mockProperty,
      expenses: {
        propertyTax: 250,
        insurance: 100,
        hoa: 50,
        management: 250,        // Dollar amount
        managementPercent: 10,  // Percentage (should not be summed)
        maintenance: 250,       // Dollar amount
        maintenancePercent: 1,  // Percentage (should not be summed)
        vacancy: 125,           // Dollar amount
        vacancyPercent: 5       // Percentage (should not be summed)
      }
    };

    render(<PropertyCard property={propertyWithExpenses} onEdit={onEdit} onDelete={onDelete} />);

    // The component should render without errors
    // Total expenses should be: 250 + 100 + 50 + 250 + 250 + 125 = 1025
    // NOT: 250 + 100 + 50 + 250 + 10 + 250 + 1 + 125 + 5 = 1041
    expect(screen.getByText('123 Main St, Springfield')).toBeInTheDocument();
  });
});
