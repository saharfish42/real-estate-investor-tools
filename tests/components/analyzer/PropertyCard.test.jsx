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
      hoa: 0
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
});
