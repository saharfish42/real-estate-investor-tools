// tests/pages/MyProperties.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MyProperties from '../../src/pages/MyProperties';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({
    docs: [
      {
        id: 'prop-1',
        data: () => ({
          address: '123 Main St',
          purchasePrice: 300000,
          monthlyRent: 2500,
          downPayment: 60000,
          expenses: {
            propertyTax: 300,
            insurance: 100,
            hoa: 0,
            maintenance: 200,
            utilities: 0,
            other: 0
          },
          financing: {
            interestRate: 7.0,
            loanTerm: 30
          }
        })
      }
    ]
  })),
  deleteDoc: vi.fn(),
  doc: vi.fn()
}));

// Mock useAuth
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user', email: 'test@example.com' }
  })
}));

describe('MyProperties', () => {
  it('should render page title', async () => {
    render(
      <BrowserRouter>
        <MyProperties />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/My Properties/i)).toBeInTheDocument();
    });
  });

  it('should show loading state initially', () => {
    render(
      <BrowserRouter>
        <MyProperties />
      </BrowserRouter>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render property cards when loaded', async () => {
    render(
      <BrowserRouter>
        <MyProperties />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
    });
  });
});
