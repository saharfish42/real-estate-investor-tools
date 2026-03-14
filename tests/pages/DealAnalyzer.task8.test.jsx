import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import DealAnalyzer from '../../src/pages/DealAnalyzer';
import { addDoc, updateDoc } from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false })),
  serverTimestamp: vi.fn(() => 'TIMESTAMP')
}));

// Mock useAuth hook
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-123', email: 'test@example.com' }
  })
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams()]
  };
});

describe('DealAnalyzer - Task 8: Save Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    addDoc.mockResolvedValue({ id: 'test-property-id' });
    updateDoc.mockResolvedValue({});
  });

  it('should save cashDown and initialLoan instead of downPayment/closingCosts', async () => {
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

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalled();
      const savedData = addDoc.mock.calls[0][1];

      // Should have new fields
      expect(savedData.cashDown).toBe(50000);
      expect(savedData.initialLoan).toBe(200000);

      // Should NOT have old fields
      expect(savedData.downPayment).toBeUndefined();
      expect(savedData.downPaymentPercent).toBeUndefined();
      expect(savedData.closingCosts).toBeUndefined();
    });
  });

  it('should save refinance data structure', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <DealAnalyzer />
      </BrowserRouter>
    );

    // Fill in all required fields including refinance
    await user.type(screen.getByLabelText(/^address/i), '123 Main St');
    await user.type(screen.getByLabelText(/^purchase price/i), '250000');
    await user.type(screen.getByLabelText(/^cash down/i), '50000');
    await user.type(screen.getByLabelText(/^initial loan/i), '200000');
    await user.type(screen.getByLabelText(/^monthly rent/i), '2500');
    await user.type(screen.getByLabelText(/^refinance loan/i), '240000');

    const saveButton = screen.getByRole('button', { name: /Save Property/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalled();
      const savedData = addDoc.mock.calls[0][1];

      // Should have refinance structure
      expect(savedData.refinance).toBeDefined();
      expect(savedData.refinance.refinanceLoan).toBe(240000);
    });
  });

  it('should save null for refinanceLoan when not provided', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <DealAnalyzer />
      </BrowserRouter>
    );

    // Fill in required fields without refinance
    await user.type(screen.getByLabelText(/^address/i), '123 Main St');
    await user.type(screen.getByLabelText(/^purchase price/i), '250000');
    await user.type(screen.getByLabelText(/^cash down/i), '50000');
    await user.type(screen.getByLabelText(/^initial loan/i), '200000');
    await user.type(screen.getByLabelText(/^monthly rent/i), '2500');

    const saveButton = screen.getByRole('button', { name: /Save Property/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalled();
      const savedData = addDoc.mock.calls[0][1];

      // Should have refinance structure with null
      expect(savedData.refinance).toBeDefined();
      expect(savedData.refinance.refinanceLoan).toBeNull();
    });
  });

  it('should save annual expenses as user entered them', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <DealAnalyzer />
      </BrowserRouter>
    );

    // Fill in required fields
    await user.type(screen.getByLabelText(/^address/i), '123 Main St');
    await user.type(screen.getByLabelText(/^purchase price/i), '250000');
    await user.type(screen.getByLabelText(/^cash down/i), '50000');
    await user.type(screen.getByLabelText(/^initial loan/i), '200000');
    await user.type(screen.getByLabelText(/^monthly rent/i), '2500');

    // Enter ANNUAL values
    await user.type(screen.getByLabelText(/^property tax/i), '3000');
    await user.type(screen.getByLabelText(/^insurance/i), '1200');

    const saveButton = screen.getByRole('button', { name: /Save Property/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalled();
      const savedData = addDoc.mock.calls[0][1];

      // Should save the annual values as entered (not divided by 12)
      expect(savedData.expenses.propertyTax).toBe(3000);
      expect(savedData.expenses.insurance).toBe(1200);
    });
  });
});
