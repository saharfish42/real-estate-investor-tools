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

describe('DealAnalyzer - Task 7: Validation Logic', () => {
  it('should validate cashDown is required and positive', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <DealAnalyzer />
      </BrowserRouter>
    );

    // Fill in required fields except cashDown
    await user.type(screen.getByLabelText(/^address/i), '123 Main St');
    await user.type(screen.getByLabelText(/^purchase price/i), '250000');
    await user.type(screen.getByLabelText(/^monthly rent/i), '2500');

    const saveButton = screen.getByRole('button', { name: /Save Property/i });
    await user.click(saveButton);

    // Should show validation error for cashDown
    expect(screen.getByText(/cash down.*required.*greater than 0/i)).toBeInTheDocument();
  });

  it('should validate initialLoan is required and positive', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <DealAnalyzer />
      </BrowserRouter>
    );

    // Fill in required fields except initialLoan
    await user.type(screen.getByLabelText(/^address/i), '123 Main St');
    await user.type(screen.getByLabelText(/^purchase price/i), '250000');
    await user.type(screen.getByLabelText(/^cash down/i), '50000');
    await user.type(screen.getByLabelText(/^monthly rent/i), '2500');

    const saveButton = screen.getByRole('button', { name: /Save Property/i });
    await user.click(saveButton);

    // Should show validation error for initialLoan
    expect(screen.getByText(/initial loan.*required.*greater than 0/i)).toBeInTheDocument();
  });

  it('should not validate downPaymentPercent (old field removed)', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <DealAnalyzer />
      </BrowserRouter>
    );

    // Fill in all required fields
    await user.type(screen.getByLabelText(/^address/i), '123 Main St');
    await user.type(screen.getByLabelText(/^purchase price/i), '250000');
    await user.type(screen.getByLabelText(/^cash down/i), '50000');
    await user.type(screen.getByLabelText(/^initial loan/i), '200000');
    await user.type(screen.getByLabelText(/^monthly rent/i), '2500');

    const saveButton = screen.getByRole('button', { name: /Save Property/i });
    await user.click(saveButton);

    // Should NOT show validation error for downPaymentPercent (old validation)
    expect(screen.queryByText(/down payment.*between.*%/i)).not.toBeInTheDocument();
  });

  it('should allow saving with valid cashDown and initialLoan', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <DealAnalyzer />
      </BrowserRouter>
    );

    // Fill in all required fields
    await user.type(screen.getByLabelText(/^address/i), '123 Main St');
    await user.type(screen.getByLabelText(/^purchase price/i), '250000');
    await user.type(screen.getByLabelText(/^cash down/i), '50000');
    await user.type(screen.getByLabelText(/^initial loan/i), '200000');
    await user.type(screen.getByLabelText(/^monthly rent/i), '2500');

    const saveButton = screen.getByRole('button', { name: /Save Property/i });
    await user.click(saveButton);

    // Should not show cashDown or initialLoan validation errors
    expect(screen.queryByText(/cash down.*required/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/initial loan.*required/i)).not.toBeInTheDocument();
  });
});
