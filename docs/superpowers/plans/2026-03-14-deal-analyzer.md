# Deal Analyzer & Property Form Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a rental property deal analyzer with manual data entry, real-time calculations, and Firebase persistence.

**Architecture:** Single-page analyzer with form component (left) and live results component (right). Separate properties list page for viewing/editing saved deals. All calculations client-side using React hooks, data persisted to Firestore.

**Tech Stack:** React 19, Firebase/Firestore, DaisyUI, React Router, Vitest

**Spec:** docs/superpowers/specs/2026-03-14-deal-analyzer-design.md

---

## File Structure

### New Files

**Utilities:**
- `src/utils/calculations.js` - Pure calculation functions (mortgage, cash flow, ROI, cap rate)
- `src/utils/formatters.js` - Currency and percentage formatting helpers

**Components:**
- `src/components/analyzer/PropertyForm.jsx` - Form for property data input
- `src/components/analyzer/AnalysisResults.jsx` - Display calculated metrics
- `src/components/analyzer/PropertyCard.jsx` - Card for displaying saved property summary

**Pages:**
- `src/pages/DealAnalyzer.jsx` - Main analyzer page (form + results)
- `src/pages/MyProperties.jsx` - List of saved properties

**Tests:**
- `tests/utils/calculations.test.js` - Unit tests for all calculation functions
- `tests/utils/formatters.test.js` - Unit tests for formatters
- `tests/components/analyzer/PropertyForm.test.jsx` - Component tests for form
- `tests/components/analyzer/AnalysisResults.test.jsx` - Component tests for results
- `tests/pages/DealAnalyzer.test.jsx` - Integration tests for analyzer page

### Modified Files

- `src/App.jsx` - Add routes for /analyzer and /properties
- `src/pages/Dashboard.jsx` - Add navigation links to analyzer and properties

### Firestore

- Security rules update (done manually via Firebase Console)

---

## Chunk 1: Calculation Utilities & Tests

### Task 1: Mortgage Payment Calculator

**Files:**
- Create: `src/utils/calculations.js`
- Create: `tests/utils/calculations.test.js`

- [ ] **Step 1: Write failing test for mortgage payment calculation**

```javascript
// tests/utils/calculations.test.js
import { describe, it, expect } from 'vitest';
import { calculateMortgagePayment } from '../../src/utils/calculations';

describe('calculateMortgagePayment', () => {
  it('should calculate monthly payment for 30-year loan', () => {
    const loanAmount = 240000; // $300k purchase - $60k down
    const annualRate = 7; // 7%
    const years = 30;

    const payment = calculateMortgagePayment(loanAmount, annualRate, years);

    // Expected: $1,596.45 (standard amortization formula)
    expect(payment).toBeCloseTo(1596.45, 2);
  });

  it('should calculate monthly payment for 15-year loan', () => {
    const loanAmount = 240000;
    const annualRate = 6.5;
    const years = 15;

    const payment = calculateMortgagePayment(loanAmount, annualRate, years);

    // Expected: $2,089.70
    expect(payment).toBeCloseTo(2089.70, 2);
  });

  it('should handle 0% interest rate (cash purchase)', () => {
    const loanAmount = 240000;
    const annualRate = 0;
    const years = 30;

    const payment = calculateMortgagePayment(loanAmount, annualRate, years);

    // Expected: principal / months = 240000 / 360 = 666.67
    expect(payment).toBeCloseTo(666.67, 2);
  });

  it('should return 0 for zero loan amount', () => {
    const payment = calculateMortgagePayment(0, 7, 30);
    expect(payment).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test calculations.test.js`
Expected: FAIL - "calculateMortgagePayment is not defined"

- [ ] **Step 3: Implement mortgage payment calculator**

```javascript
// src/utils/calculations.js

/**
 * Calculate monthly mortgage payment using amortization formula
 * @param {number} loanAmount - Total loan amount
 * @param {number} annualInterestRate - Annual interest rate as percentage (e.g., 7 for 7%)
 * @param {number} loanTermYears - Loan term in years
 * @returns {number} Monthly payment (principal + interest)
 */
export function calculateMortgagePayment(loanAmount, annualInterestRate, loanTermYears) {
  if (loanAmount === 0) return 0;

  // Handle 0% interest rate (cash purchase scenario)
  if (annualInterestRate === 0) {
    const totalMonths = loanTermYears * 12;
    return loanAmount / totalMonths;
  }

  const monthlyRate = annualInterestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;

  // M = P[r(1+r)^n] / [(1+r)^n - 1]
  const numerator = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments);
  const denominator = Math.pow(1 + monthlyRate, numberOfPayments) - 1;

  return numerator / denominator;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test calculations.test.js`
Expected: All 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/calculations.js tests/utils/calculations.test.js
git commit -m "feat: add mortgage payment calculator with tests

Implement standard amortization formula for calculating monthly
mortgage payments. Handles edge cases: 0% interest (cash purchase)
and zero loan amount.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2: Cash Flow & ROI Calculators

**Files:**
- Modify: `src/utils/calculations.js`
- Modify: `tests/utils/calculations.test.js`

- [ ] **Step 1: Write failing tests for cash flow calculations**

```javascript
// tests/utils/calculations.test.js (add to existing file)

import { calculateMonthlyCashFlow, calculateAnnualCashFlow } from '../../src/utils/calculations';

describe('calculateMonthlyCashFlow', () => {
  it('should calculate negative monthly cash flow', () => {
    const monthlyIncome = 2500;
    const monthlyExpenses = 975; // taxes + insurance + hoa + mgmt + maint + vacancy
    const mortgagePayment = 1596.45;

    const cashFlow = calculateMonthlyCashFlow(
      monthlyIncome,
      monthlyExpenses,
      mortgagePayment
    );

    // 2500 - 975 - 1596.45 = -71.45 (negative cash flow)
    expect(cashFlow).toBeCloseTo(-71.45, 2);
  });

  it('should calculate positive monthly cash flow', () => {
    const monthlyIncome = 3000;
    const monthlyExpenses = 800;
    const mortgagePayment = 1500;

    const cashFlow = calculateMonthlyCashFlow(
      monthlyIncome,
      monthlyExpenses,
      mortgagePayment
    );

    // 3000 - 800 - 1500 = 700
    expect(cashFlow).toBeCloseTo(700, 2);
  });
});

describe('calculateAnnualCashFlow', () => {
  it('should multiply monthly cash flow by 12', () => {
    const monthlyCashFlow = 250;
    const annual = calculateAnnualCashFlow(monthlyCashFlow);
    expect(annual).toBe(3000);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test calculations.test.js`
Expected: FAIL - "calculateMonthlyCashFlow is not defined"

- [ ] **Step 3: Implement cash flow calculators**

```javascript
// src/utils/calculations.js (add to existing file)

/**
 * Calculate net monthly cash flow
 * @param {number} monthlyIncome - Total monthly income (rent)
 * @param {number} monthlyExpenses - Sum of all monthly expenses
 * @param {number} mortgagePayment - Monthly mortgage payment
 * @returns {number} Net monthly cash flow (can be negative)
 */
export function calculateMonthlyCashFlow(monthlyIncome, monthlyExpenses, mortgagePayment) {
  return monthlyIncome - monthlyExpenses - mortgagePayment;
}

/**
 * Calculate annual cash flow
 * @param {number} monthlyCashFlow - Net monthly cash flow
 * @returns {number} Annual cash flow
 */
export function calculateAnnualCashFlow(monthlyCashFlow) {
  return monthlyCashFlow * 12;
}
```

- [ ] **Step 4: Write failing tests for ROI calculations**

```javascript
// tests/utils/calculations.test.js (add to existing file)

import {
  calculateCashOnCashReturn,
  calculateCapRate,
  calculateTotalInterest
} from '../../src/utils/calculations';

describe('calculateCashOnCashReturn', () => {
  it('should calculate cash-on-cash return percentage', () => {
    const annualCashFlow = 3000;
    const totalCashInvested = 69000; // $60k down + $9k closing

    const coC = calculateCashOnCashReturn(annualCashFlow, totalCashInvested);

    // (3000 / 69000) * 100 = 4.35%
    expect(coC).toBeCloseTo(4.35, 2);
  });

  it('should handle negative cash flow', () => {
    const annualCashFlow = -1200;
    const totalCashInvested = 60000;

    const coC = calculateCashOnCashReturn(annualCashFlow, totalCashInvested);

    // (-1200 / 60000) * 100 = -2%
    expect(coC).toBeCloseTo(-2, 2);
  });

  it('should return 0 when no cash invested', () => {
    const coC = calculateCashOnCashReturn(5000, 0);
    expect(coC).toBe(0);
  });
});

describe('calculateCapRate', () => {
  it('should calculate cap rate from NOI', () => {
    const annualIncome = 30000; // $2500/mo * 12
    const annualExpenses = 11700; // $975/mo * 12
    const purchasePrice = 300000;

    const capRate = calculateCapRate(annualIncome, annualExpenses, purchasePrice);

    // NOI = 30000 - 11700 = 18300
    // Cap Rate = (18300 / 300000) * 100 = 6.1%
    expect(capRate).toBeCloseTo(6.1, 2);
  });

  it('should return 0 when purchase price is 0', () => {
    const capRate = calculateCapRate(30000, 10000, 0);
    expect(capRate).toBe(0);
  });
});

describe('calculateTotalInterest', () => {
  it('should calculate total interest paid over loan term', () => {
    const monthlyPayment = 1596.45;
    const loanAmount = 240000;
    const loanTermYears = 30;

    const totalInterest = calculateTotalInterest(
      monthlyPayment,
      loanAmount,
      loanTermYears
    );

    // Total paid = 1596.45 * 360 = 574,722
    // Total interest = 574,722 - 240,000 = 334,722
    expect(totalInterest).toBeCloseTo(334722, 0);
  });
});
```

- [ ] **Step 5: Run tests to verify they fail**

Run: `npm test calculations.test.js`
Expected: FAIL - new functions not defined

- [ ] **Step 6: Implement ROI calculators**

```javascript
// src/utils/calculations.js (add to existing file)

/**
 * Calculate cash-on-cash return
 * @param {number} annualCashFlow - Net annual cash flow
 * @param {number} totalCashInvested - Down payment + closing costs
 * @returns {number} Cash-on-cash return as percentage
 */
export function calculateCashOnCashReturn(annualCashFlow, totalCashInvested) {
  if (totalCashInvested === 0) return 0;
  return (annualCashFlow / totalCashInvested) * 100;
}

/**
 * Calculate cap rate (capitalization rate)
 * @param {number} annualIncome - Total annual rental income
 * @param {number} annualExpenses - Total annual expenses (excluding mortgage)
 * @param {number} purchasePrice - Property purchase price
 * @returns {number} Cap rate as percentage
 */
export function calculateCapRate(annualIncome, annualExpenses, purchasePrice) {
  if (purchasePrice === 0) return 0;
  const noi = annualIncome - annualExpenses; // Net Operating Income
  return (noi / purchasePrice) * 100;
}

/**
 * Calculate total interest paid over loan term
 * @param {number} monthlyPayment - Monthly mortgage payment
 * @param {number} loanAmount - Original loan amount
 * @param {number} loanTermYears - Loan term in years
 * @returns {number} Total interest paid
 */
export function calculateTotalInterest(monthlyPayment, loanAmount, loanTermYears) {
  const totalPaid = monthlyPayment * loanTermYears * 12;
  return totalPaid - loanAmount;
}
```

- [ ] **Step 7: Run all calculation tests**

Run: `npm test calculations.test.js`
Expected: All tests PASS (should have ~10 tests total)

- [ ] **Step 8: Commit**

```bash
git add src/utils/calculations.js tests/utils/calculations.test.js
git commit -m "feat: add cash flow and ROI calculators

Add functions for calculating:
- Monthly and annual cash flow
- Cash-on-cash return
- Cap rate (capitalization rate)
- Total interest paid

All functions include comprehensive tests and handle edge cases.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 3: Formatting Utilities

**Files:**
- Create: `src/utils/formatters.js`
- Create: `tests/utils/formatters.test.js`

- [ ] **Step 1: Write failing tests for formatters**

```javascript
// tests/utils/formatters.test.js
import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPercent } from '../../src/utils/formatters';

describe('formatCurrency', () => {
  it('should format positive numbers', () => {
    expect(formatCurrency(1596.45)).toBe('$1,596.45');
    expect(formatCurrency(300000)).toBe('$300,000.00');
    expect(formatCurrency(50)).toBe('$50.00');
  });

  it('should format negative numbers', () => {
    expect(formatCurrency(-250.75)).toBe('-$250.75');
    expect(formatCurrency(-1000)).toBe('-$1,000.00');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should round to 2 decimal places', () => {
    expect(formatCurrency(123.456)).toBe('$123.46');
    expect(formatCurrency(99.994)).toBe('$99.99');
  });
});

describe('formatPercent', () => {
  it('should format percentages with 2 decimal places', () => {
    expect(formatPercent(7.5)).toBe('7.50%');
    expect(formatPercent(4.35)).toBe('4.35%');
    expect(formatPercent(12)).toBe('12.00%');
  });

  it('should handle negative percentages', () => {
    expect(formatPercent(-2.5)).toBe('-2.50%');
  });

  it('should handle zero', () => {
    expect(formatPercent(0)).toBe('0.00%');
  });

  it('should round to 2 decimal places', () => {
    expect(formatPercent(6.666)).toBe('6.67%');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test formatters.test.js`
Expected: FAIL - "formatCurrency is not defined"

- [ ] **Step 3: Implement formatters**

```javascript
// src/utils/formatters.js

/**
 * Format number as US currency
 * @param {number} amount - Dollar amount
 * @returns {string} Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(amount) {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(amount));

  return amount < 0 ? `-${formatted}` : formatted;
}

/**
 * Format number as percentage
 * @param {number} value - Percentage value
 * @returns {string} Formatted percentage string (e.g., "7.50%")
 */
export function formatPercent(value) {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  return `${sign}${abs.toFixed(2)}%`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test formatters.test.js`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/formatters.js tests/utils/formatters.test.js
git commit -m "feat: add currency and percentage formatters

Add utility functions for formatting:
- Currency with proper thousands separators
- Percentages with 2 decimal places
- Handles negative values correctly

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Chunk 2: PropertyForm Component

### Task 4: PropertyForm Component Structure

**Files:**
- Create: `src/components/analyzer/PropertyForm.jsx`
- Create: `tests/components/analyzer/PropertyForm.test.jsx`

- [ ] **Step 1: Write failing test for PropertyForm rendering**

```javascript
// tests/components/analyzer/PropertyForm.test.jsx
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

    expect(screen.getByLabelText(/Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Purchase Price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Monthly Rent/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Interest Rate/i)).toBeInTheDocument();
  });

  it('should display default values', () => {
    const onChange = vi.fn();
    render(<PropertyForm values={defaultValues} onChange={onChange} errors={{}} />);

    const downPaymentInput = screen.getByLabelText(/Down Payment/i);
    expect(downPaymentInput).toHaveValue(20);

    const interestRateInput = screen.getByLabelText(/Interest Rate/i);
    expect(interestRateInput).toHaveValue(7);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test PropertyForm.test.jsx`
Expected: FAIL - component doesn't exist

- [ ] **Step 3: Create PropertyForm component skeleton**

```javascript
// src/components/analyzer/PropertyForm.jsx
import { useState } from 'react';

export default function PropertyForm({ values, onChange, errors = {} }) {
  const handleInputChange = (field, value) => {
    onChange({ ...values, [field]: value });
  };

  const handleNestedChange = (parent, field, value) => {
    onChange({
      ...values,
      [parent]: {
        ...values[parent],
        [field]: value
      }
    });
  };

  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Property Details</h2>

      {/* Property Information */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Property Information</h3>
        <div className="form-control mb-3">
          <label className="label">
            <span className="label-text">Address *</span>
          </label>
          <input
            type="text"
            className={`input input-bordered w-full ${errors.address ? 'input-error' : ''}`}
            value={values.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="123 Main St, City, State"
          />
          {errors.address && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.address}</span>
            </label>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Bedrooms</span>
            </label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={values.bedrooms}
              onChange={(e) => handleInputChange('bedrooms', e.target.value)}
              placeholder="3"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Bathrooms</span>
            </label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={values.bathrooms}
              onChange={(e) => handleInputChange('bathrooms', e.target.value)}
              placeholder="2"
            />
          </div>
        </div>
      </div>

      {/* Purchase Details */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Purchase Details</h3>
        <div className="form-control mb-3">
          <label className="label">
            <span className="label-text">Purchase Price *</span>
          </label>
          <input
            type="number"
            className={`input input-bordered w-full ${errors.purchasePrice ? 'input-error' : ''}`}
            value={values.purchasePrice}
            onChange={(e) => handleInputChange('purchasePrice', parseFloat(e.target.value) || '')}
            placeholder="300000"
          />
          {errors.purchasePrice && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.purchasePrice}</span>
            </label>
          )}
        </div>

        <div className="form-control mb-3">
          <label className="label">
            <span className="label-text">Closing Costs</span>
          </label>
          <input
            type="number"
            className="input input-bordered w-full"
            value={values.closingCosts}
            onChange={(e) => handleInputChange('closingCosts', parseFloat(e.target.value) || '')}
            placeholder="9000 (3% of purchase price)"
          />
        </div>

        <div className="form-control mb-3">
          <label className="label">
            <span className="label-text">Down Payment (%)</span>
          </label>
          <input
            type="number"
            className={`input input-bordered w-full ${errors.downPaymentPercent ? 'input-error' : ''}`}
            value={values.downPaymentPercent}
            onChange={(e) => handleInputChange('downPaymentPercent', parseFloat(e.target.value) || '')}
            placeholder="20"
          />
          {errors.downPaymentPercent && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.downPaymentPercent}</span>
            </label>
          )}
        </div>
      </div>

      {/* Income */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Income</h3>
        <div className="form-control mb-3">
          <label className="label">
            <span className="label-text">Monthly Rent *</span>
          </label>
          <input
            type="number"
            className={`input input-bordered w-full ${errors.monthlyRent ? 'input-error' : ''}`}
            value={values.monthlyRent}
            onChange={(e) => handleInputChange('monthlyRent', parseFloat(e.target.value) || '')}
            placeholder="2500"
          />
          {errors.monthlyRent && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.monthlyRent}</span>
            </label>
          )}
        </div>
      </div>

      {/* Monthly Expenses */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Monthly Expenses</h3>
        <div className="form-control mb-3">
          <label className="label">
            <span className="label-text">Property Tax (annual ÷ 12)</span>
          </label>
          <input
            type="number"
            className="input input-bordered w-full"
            value={values.expenses.propertyTax}
            onChange={(e) => handleNestedChange('expenses', 'propertyTax', parseFloat(e.target.value) || '')}
            placeholder="250"
          />
        </div>

        <div className="form-control mb-3">
          <label className="label">
            <span className="label-text">Insurance (annual ÷ 12)</span>
          </label>
          <input
            type="number"
            className="input input-bordered w-full"
            value={values.expenses.insurance}
            onChange={(e) => handleNestedChange('expenses', 'insurance', parseFloat(e.target.value) || '')}
            placeholder="100"
          />
        </div>

        <div className="form-control mb-3">
          <label className="label">
            <span className="label-text">HOA Fees</span>
          </label>
          <input
            type="number"
            className="input input-bordered w-full"
            value={values.expenses.hoa}
            onChange={(e) => handleNestedChange('expenses', 'hoa', parseFloat(e.target.value) || '')}
            placeholder="0"
          />
        </div>

        <div className="form-control mb-3">
          <label className="label">
            <span className="label-text">Property Management (%)</span>
          </label>
          <input
            type="number"
            className="input input-bordered w-full"
            value={values.expenses.managementPercent}
            onChange={(e) => handleNestedChange('expenses', 'managementPercent', parseFloat(e.target.value) || '')}
            placeholder="10"
          />
        </div>

        <div className="form-control mb-3">
          <label className="label">
            <span className="label-text">Maintenance (% of purchase price)</span>
          </label>
          <input
            type="number"
            className="input input-bordered w-full"
            value={values.expenses.maintenancePercent}
            onChange={(e) => handleNestedChange('expenses', 'maintenancePercent', parseFloat(e.target.value) || '')}
            placeholder="1"
          />
        </div>

        <div className="form-control mb-3">
          <label className="label">
            <span className="label-text">Vacancy (%)</span>
          </label>
          <input
            type="number"
            className="input input-bordered w-full"
            value={values.expenses.vacancyPercent}
            onChange={(e) => handleNestedChange('expenses', 'vacancyPercent', parseFloat(e.target.value) || '')}
            placeholder="5"
          />
        </div>
      </div>

      {/* Financing */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Financing</h3>
        <div className="form-control mb-3">
          <label className="label">
            <span className="label-text">Interest Rate (%)</span>
          </label>
          <input
            type="number"
            step="0.1"
            className={`input input-bordered w-full ${errors.interestRate ? 'input-error' : ''}`}
            value={values.financing.interestRate}
            onChange={(e) => handleNestedChange('financing', 'interestRate', parseFloat(e.target.value) || '')}
            placeholder="7.0"
          />
          {errors.interestRate && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.interestRate}</span>
            </label>
          )}
        </div>

        <div className="form-control mb-3">
          <label className="label">
            <span className="label-text">Loan Term (years)</span>
          </label>
          <input
            type="number"
            className="input input-bordered w-full"
            value={values.financing.loanTerm}
            onChange={(e) => handleNestedChange('financing', 'loanTerm', parseInt(e.target.value) || '')}
            placeholder="30"
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify component renders**

Run: `npm test PropertyForm.test.jsx`
Expected: Tests PASS

- [ ] **Step 5: Write test for onChange callback**

```javascript
// tests/components/analyzer/PropertyForm.test.jsx (add to existing file)

it('should call onChange when inputs change', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<PropertyForm values={defaultValues} onChange={onChange} errors={{}} />);

  const addressInput = screen.getByLabelText(/Address/i);
  await user.type(addressInput, '123 Main St');

  expect(onChange).toHaveBeenCalled();
  expect(onChange.mock.calls[0][0]).toMatchObject({
    address: expect.stringContaining('1')
  });
});
```

- [ ] **Step 6: Run test to verify onChange works**

Run: `npm test PropertyForm.test.jsx`
Expected: New test PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/analyzer/PropertyForm.jsx tests/components/analyzer/PropertyForm.test.jsx
git commit -m "feat: create PropertyForm component

Add comprehensive form component for property data entry:
- Property info (address, bedrooms, bathrooms)
- Purchase details (price, closing costs, down payment)
- Income (monthly rent)
- Monthly expenses (taxes, insurance, HOA, management, etc.)
- Financing (interest rate, loan term)

Includes validation error display and onChange handling.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Chunk 3: AnalysisResults Component

### Task 5: AnalysisResults Component

**Files:**
- Create: `src/components/analyzer/AnalysisResults.jsx`
- Create: `tests/components/analyzer/AnalysisResults.test.jsx`

- [ ] **Step 1: Write failing test for AnalysisResults**

```javascript
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

    expect(screen.getByText(/Monthly Cash Flow/i)).toBeInTheDocument();
    expect(screen.getByText(/Annual Returns/i)).toBeInTheDocument();
    expect(screen.getByText(/Financing Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Expense Breakdown/i)).toBeInTheDocument();
  });

  it('should display formatted currency values', () => {
    render(<AnalysisResults calculations={mockCalculations} />);

    // Monthly cash flow should be formatted and displayed
    expect(screen.getByText(/\$2,500\.00/)).toBeInTheDocument(); // income
    expect(screen.getByText(/\$975\.00/)).toBeInTheDocument(); // expenses
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test AnalysisResults.test.jsx`
Expected: FAIL - component doesn't exist

- [ ] **Step 3: Create AnalysisResults component**

```javascript
// src/components/analyzer/AnalysisResults.jsx
import { formatCurrency, formatPercent } from '../../utils/formatters';

export default function AnalysisResults({ calculations }) {
  const {
    monthlyIncome,
    monthlyExpenses,
    mortgagePayment,
    monthlyCashFlow,
    annualCashFlow,
    totalCashInvested,
    cashOnCashReturn,
    noi,
    capRate,
    loanAmount,
    totalInterest,
    totalPaid
  } = calculations;

  const cashFlowColor = monthlyCashFlow >= 0 ? 'text-success' : 'text-error';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analysis Results</h2>

      {/* Monthly Cash Flow Card */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title">Monthly Cash Flow</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-base-content/70">Monthly Income:</span>
              <span className="font-semibold">{formatCurrency(monthlyIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-content/70">Monthly Expenses:</span>
              <span className="font-semibold">{formatCurrency(monthlyExpenses)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-content/70">Mortgage Payment:</span>
              <span className="font-semibold">{formatCurrency(mortgagePayment)}</span>
            </div>
            <div className="divider my-1"></div>
            <div className="flex justify-between text-lg">
              <span className="font-bold">Net Monthly Cash Flow:</span>
              <span className={`font-bold ${cashFlowColor}`}>
                {formatCurrency(monthlyCashFlow)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Annual Returns Card */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title">Annual Returns</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-base-content/70">Annual Cash Flow:</span>
              <span className={`font-semibold ${cashFlowColor}`}>
                {formatCurrency(annualCashFlow)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-content/70">Total Cash Invested:</span>
              <span className="font-semibold">{formatCurrency(totalCashInvested)}</span>
            </div>
            <div className="divider my-1"></div>
            <div className="flex justify-between">
              <span className="font-bold">Cash-on-Cash Return:</span>
              <span className={`font-bold ${cashFlowColor}`}>
                {formatPercent(cashOnCashReturn)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Cap Rate:</span>
              <span className="font-bold">{formatPercent(capRate)}</span>
            </div>
            <div className="text-sm text-base-content/60 mt-2">
              NOI (Net Operating Income): {formatCurrency(noi)}/year
            </div>
          </div>
        </div>
      </div>

      {/* Financing Details Card */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title">Financing Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-base-content/70">Loan Amount:</span>
              <span className="font-semibold">{formatCurrency(loanAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-content/70">Monthly Payment:</span>
              <span className="font-semibold">{formatCurrency(mortgagePayment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-content/70">Total Interest:</span>
              <span className="font-semibold">{formatCurrency(totalInterest)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-content/70">Total Paid:</span>
              <span className="font-semibold">{formatCurrency(totalPaid)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Breakdown Card */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title">Expense Breakdown</h3>
          <div className="space-y-2">
            <div className="text-sm text-base-content/70">
              Monthly expenses total: {formatCurrency(monthlyExpenses)}
            </div>
            <div className="text-sm text-base-content/60">
              (Individual expense breakdown will be calculated from form values)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify component renders**

Run: `npm test AnalysisResults.test.jsx`
Expected: Tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/analyzer/AnalysisResults.jsx tests/components/analyzer/AnalysisResults.test.jsx
git commit -m "feat: create AnalysisResults component

Add component to display calculated investment metrics:
- Monthly cash flow card (income, expenses, mortgage, net)
- Annual returns card (cash-on-cash, cap rate, NOI)
- Financing details card (loan amount, payments, interest)
- Expense breakdown card

Color-codes positive (green) and negative (red) cash flow.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Chunk 4: DealAnalyzer Page

### Task 6: DealAnalyzer Page with Live Calculations

**Files:**
- Create: `src/pages/DealAnalyzer.jsx`
- Create: `tests/pages/DealAnalyzer.test.jsx`

- [ ] **Step 1: Write failing test for DealAnalyzer page**

```javascript
// tests/pages/DealAnalyzer.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DealAnalyzer from '../../src/pages/DealAnalyzer';

// Mock useAuth hook
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-123', email: 'test@example.com' }
  })
}));

describe('DealAnalyzer', () => {
  it('should render PropertyForm and AnalysisResults', () => {
    render(
      <BrowserRouter>
        <DealAnalyzer />
      </BrowserRouter>
    );

    // Form should be present
    expect(screen.getByText(/Property Details/i)).toBeInTheDocument();

    // Results should be present
    expect(screen.getByText(/Analysis Results/i)).toBeInTheDocument();
  });

  it('should render save button', () => {
    render(
      <BrowserRouter>
        <DealAnalyzer />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /Save Property/i })).toBeInTheDocument();
  });

  it('should show validation errors when trying to save without required fields', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <DealAnalyzer />
      </BrowserRouter>
    );

    const saveButton = screen.getByRole('button', { name: /Save Property/i });
    await user.click(saveButton);

    // Should show validation errors
    expect(screen.getByText(/Address is required/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test DealAnalyzer.test.jsx`
Expected: FAIL - page doesn't exist

- [ ] **Step 3: Create DealAnalyzer page**

```javascript
// src/pages/DealAnalyzer.jsx
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { collection, addDoc, updateDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import PropertyForm from '../components/analyzer/PropertyForm';
import AnalysisResults from '../components/analyzer/AnalysisResults';
import {
  calculateMortgagePayment,
  calculateMonthlyCashFlow,
  calculateAnnualCashFlow,
  calculateCashOnCashReturn,
  calculateCapRate,
  calculateTotalInterest
} from '../utils/calculations';

const DEFAULT_VALUES = {
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

export default function DealAnalyzer() {
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('id');

  // Load property for editing
  useEffect(() => {
    const loadProperty = async () => {
      if (propertyId && user) {
        setLoading(true);
        try {
          const propertyDoc = await getDoc(doc(db, 'properties', propertyId));
          if (propertyDoc.exists() && propertyDoc.data().userId === user.uid) {
            setValues(propertyDoc.data());
          } else {
            alert('Property not found or access denied');
            navigate('/properties');
          }
        } catch (error) {
          console.error('Error loading property:', error);
          alert('Failed to load property');
        } finally {
          setLoading(false);
        }
      }
    };

    loadProperty();
  }, [propertyId, user, navigate]);

  // Calculate derived values
  const calculations = useMemo(() => {
    const purchasePrice = parseFloat(values.purchasePrice) || 0;
    const monthlyRent = parseFloat(values.monthlyRent) || 0;
    const downPaymentPercent = parseFloat(values.downPaymentPercent) || 0;
    const closingCosts = parseFloat(values.closingCosts) || (purchasePrice * 0.03);

    // Calculate down payment and loan amount
    const downPayment = purchasePrice * (downPaymentPercent / 100);
    const loanAmount = purchasePrice - downPayment;

    // Calculate expenses
    const propertyTax = parseFloat(values.expenses.propertyTax) || 0;
    const insurance = parseFloat(values.expenses.insurance) || 0;
    const hoa = parseFloat(values.expenses.hoa) || 0;

    const managementPercent = parseFloat(values.expenses.managementPercent) || 0;
    const management = monthlyRent * (managementPercent / 100);

    const maintenancePercent = parseFloat(values.expenses.maintenancePercent) || 0;
    const maintenance = (purchasePrice * (maintenancePercent / 100)) / 12;

    const vacancyPercent = parseFloat(values.expenses.vacancyPercent) || 0;
    const vacancy = monthlyRent * (vacancyPercent / 100);

    const monthlyExpenses = propertyTax + insurance + hoa + management + maintenance + vacancy;

    // Calculate mortgage payment
    const interestRate = parseFloat(values.financing.interestRate) || 0;
    const loanTerm = parseInt(values.financing.loanTerm) || 30;
    const mortgagePayment = calculateMortgagePayment(loanAmount, interestRate, loanTerm);

    // Calculate cash flow
    const monthlyCashFlow = calculateMonthlyCashFlow(monthlyRent, monthlyExpenses, mortgagePayment);
    const annualCashFlow = calculateAnnualCashFlow(monthlyCashFlow);

    // Calculate ROI metrics
    const totalCashInvested = downPayment + closingCosts;
    const cashOnCashReturn = calculateCashOnCashReturn(annualCashFlow, totalCashInvested);

    const annualIncome = monthlyRent * 12;
    const annualExpenses = monthlyExpenses * 12;
    const noi = annualIncome - annualExpenses;
    const capRate = calculateCapRate(annualIncome, annualExpenses, purchasePrice);

    // Calculate financing details
    const totalInterest = calculateTotalInterest(mortgagePayment, loanAmount, loanTerm);
    const totalPaid = mortgagePayment * loanTerm * 12;

    return {
      monthlyIncome: monthlyRent,
      monthlyExpenses,
      mortgagePayment,
      monthlyCashFlow,
      annualCashFlow,
      totalCashInvested,
      cashOnCashReturn,
      noi,
      capRate,
      loanAmount,
      totalInterest,
      totalPaid,
      downPayment,
      closingCosts
    };
  }, [values]);

  const validateForm = () => {
    const newErrors = {};

    if (!values.address || values.address.trim().length < 3) {
      newErrors.address = 'Address is required';
    }

    if (!values.purchasePrice || values.purchasePrice <= 0) {
      newErrors.purchasePrice = 'Purchase price must be greater than 0';
    }

    if (!values.monthlyRent || values.monthlyRent <= 0) {
      newErrors.monthlyRent = 'Monthly rent must be greater than 0';
    }

    if (values.downPaymentPercent < 0 || values.downPaymentPercent > 100) {
      newErrors.downPaymentPercent = 'Down payment must be between 0% and 100%';
    }

    if (values.financing.interestRate < 0.1 || values.financing.interestRate > 20) {
      newErrors.interestRate = 'Interest rate must be between 0.1% and 20%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const propertyData = {
        ...values,
        userId: user.uid,
        purchasePrice: parseFloat(values.purchasePrice),
        closingCosts: calculations.closingCosts,
        downPayment: calculations.downPayment,
        downPaymentPercent: parseFloat(values.downPaymentPercent),
        monthlyRent: parseFloat(values.monthlyRent),
        expenses: {
          propertyTax: parseFloat(values.expenses.propertyTax) || 0,
          insurance: parseFloat(values.expenses.insurance) || 0,
          hoa: parseFloat(values.expenses.hoa) || 0,
          managementPercent: parseFloat(values.expenses.managementPercent),
          maintenancePercent: parseFloat(values.expenses.maintenancePercent),
          vacancyPercent: parseFloat(values.expenses.vacancyPercent)
        },
        financing: {
          interestRate: parseFloat(values.financing.interestRate),
          loanTerm: parseInt(values.financing.loanTerm)
        },
        updatedAt: serverTimestamp()
      };

      if (propertyId) {
        // Update existing property
        await updateDoc(doc(db, 'properties', propertyId), propertyData);
      } else {
        // Create new property
        propertyData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'properties'), propertyData);
      }

      navigate('/properties');
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Failed to save property. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Deal Analyzer</h1>
          <p className="text-base-content/70 mt-2">
            Analyze your rental property investment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Column */}
          <div>
            <PropertyForm
              values={values}
              onChange={setValues}
              errors={errors}
            />
          </div>

          {/* Results Column */}
          <div>
            <AnalysisResults calculations={calculations} />

            {/* Save Button */}
            <div className="mt-6">
              <button
                className="btn btn-primary w-full"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <span className="loading loading-spinner"></span>
                ) : propertyId ? (
                  'Update Property'
                ) : (
                  'Save Property'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify page renders**

Run: `npm test DealAnalyzer.test.jsx`
Expected: Tests PASS (note: some tests may need adjustment based on actual rendering)

- [ ] **Step 5: Commit**

```bash
git add src/pages/DealAnalyzer.jsx tests/pages/DealAnalyzer.test.jsx
git commit -m "feat: create DealAnalyzer page with live calculations

Add main analyzer page that combines PropertyForm and AnalysisResults:
- Live calculation updates using useMemo
- Form validation before save
- Save new property or update existing (via ?id= URL param)
- Integrates with Firestore for persistence
- Responsive two-column layout (stacks on mobile)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Chunk 5: Properties List & Routing

### Task 7: PropertyCard Component

**Files:**
- Create: `src/components/analyzer/PropertyCard.jsx`
- Create: `tests/components/analyzer/PropertyCard.test.jsx`

- [ ] **Step 1: Write failing test for PropertyCard**

```javascript
// tests/components/analyzer/PropertyCard.test.jsx
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test PropertyCard.test.jsx`
Expected: FAIL - component doesn't exist

- [ ] **Step 3: Create PropertyCard component**

```javascript
// src/components/analyzer/PropertyCard.jsx
import { formatCurrency } from '../../utils/formatters';
import {
  calculateMortgagePayment,
  calculateMonthlyCashFlow
} from '../../utils/calculations';

export default function PropertyCard({ property, onEdit, onDelete }) {
  const {
    id,
    address,
    purchasePrice,
    monthlyRent,
    downPayment,
    expenses,
    financing
  } = property;

  // Calculate monthly cash flow for display
  const loanAmount = purchasePrice - downPayment;
  const mortgagePayment = calculateMortgagePayment(
    loanAmount,
    financing.interestRate,
    financing.loanTerm
  );

  const monthlyExpenses = Object.values(expenses).reduce((sum, val) => {
    return sum + (parseFloat(val) || 0);
  }, 0);

  const cashFlow = calculateMonthlyCashFlow(
    monthlyRent,
    monthlyExpenses,
    mortgagePayment
  );

  const cashFlowColor = cashFlow >= 0 ? 'text-success' : 'text-error';

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
      <div className="card-body">
        <h3 className="card-title text-lg">{address}</h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-base-content/70">Purchase Price:</span>
            <span className="font-semibold">{formatCurrency(purchasePrice)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-base-content/70">Monthly Rent:</span>
            <span className="font-semibold">{formatCurrency(monthlyRent)}</span>
          </div>

          <div className="divider my-1"></div>

          <div className="flex justify-between">
            <span className="font-bold">Monthly Cash Flow:</span>
            <span className={`font-bold ${cashFlowColor}`}>
              {formatCurrency(cashFlow)}
            </span>
          </div>
        </div>

        <div className="card-actions justify-end mt-4">
          <button
            className="btn btn-sm btn-outline"
            onClick={() => onEdit(id)}
          >
            Edit
          </button>
          <button
            className="btn btn-sm btn-outline btn-error"
            onClick={() => onDelete(id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify component works**

Run: `npm test PropertyCard.test.jsx`
Expected: Tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/analyzer/PropertyCard.jsx tests/components/analyzer/PropertyCard.test.jsx
git commit -m "feat: create PropertyCard component

Add card component for displaying property summary:
- Shows address, purchase price, monthly rent
- Calculates and displays monthly cash flow
- Color-codes positive/negative cash flow
- Edit and delete buttons with callbacks

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 8: MyProperties Page

**Files:**
- Create: `src/pages/MyProperties.jsx`
- Create: `tests/pages/MyProperties.test.jsx`

- [ ] **Step 1: Write failing test for MyProperties**

```javascript
// tests/pages/MyProperties.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MyProperties from '../../src/pages/MyProperties';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
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
          monthlyRent: 2500
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
  it('should render page title', () => {
    render(
      <BrowserRouter>
        <MyProperties />
      </BrowserRouter>
    );

    expect(screen.getByText(/My Properties/i)).toBeInTheDocument();
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test MyProperties.test.jsx`
Expected: FAIL - page doesn't exist

- [ ] **Step 3: Create MyProperties page**

```javascript
// src/pages/MyProperties.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import PropertyCard from '../components/analyzer/PropertyCard';

export default function MyProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProperties();
  }, [user]);

  const loadProperties = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const q = query(
        collection(db, 'properties'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const propertiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProperties(propertiesData);
    } catch (error) {
      console.error('Error loading properties:', error);
      alert('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (propertyId) => {
    navigate(`/analyzer?id=${propertyId}`);
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm('Are you sure? This cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'properties', propertyId));
      setProperties(properties.filter(p => p.id !== propertyId));
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" role="status"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Properties</h1>
            <p className="text-base-content/70 mt-2">
              View and manage your saved property analyses
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/analyzer')}
          >
            Analyze New Deal
          </button>
        </div>

        {properties.length === 0 ? (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body items-center text-center py-16">
              <div className="text-6xl mb-4">🏠</div>
              <h2 className="card-title text-2xl mb-2">No properties yet</h2>
              <p className="text-base-content/70 mb-6">
                Start analyzing your first deal!
              </p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/analyzer')}
              >
                Create Your First Deal
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify page works**

Run: `npm test MyProperties.test.jsx`
Expected: Tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/MyProperties.jsx tests/pages/MyProperties.test.jsx
git commit -m "feat: create MyProperties page

Add properties list page with:
- Grid layout of PropertyCard components
- Load user's properties from Firestore
- Edit button navigates to analyzer with ?id= param
- Delete button with confirmation dialog
- Empty state for new users
- Loading state during fetch

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 9: Update Routing and Navigation

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/pages/Dashboard.jsx`

- [ ] **Step 1: Add routes to App.jsx**

```javascript
// src/App.jsx (add new imports and routes)
import DealAnalyzer from './pages/DealAnalyzer';
import MyProperties from './pages/MyProperties';

// In the Routes section, add:
<Route path="/analyzer" element={<ProtectedRoute><DealAnalyzer /></ProtectedRoute>} />
<Route path="/properties" element={<ProtectedRoute><MyProperties /></ProtectedRoute>} />
```

- [ ] **Step 2: Test routes work**

Run: `npm run dev` and manually test:
- Navigate to http://localhost:5173/analyzer
- Navigate to http://localhost:5173/properties

Expected: Both pages load correctly

- [ ] **Step 3: Update Dashboard with navigation links**

```javascript
// src/pages/Dashboard.jsx (add navigation section in the dashboard content area)

// Add this after the navbar, before the placeholder content:
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
  <div
    className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
    onClick={() => navigate('/analyzer')}
  >
    <div className="card-body">
      <h2 className="card-title">
        <span className="text-3xl mr-3">📊</span>
        Analyze New Deal
      </h2>
      <p>Evaluate rental property investments with detailed financial analysis</p>
      <div className="card-actions justify-end">
        <button className="btn btn-primary btn-sm">Get Started</button>
      </div>
    </div>
  </div>

  <div
    className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
    onClick={() => navigate('/properties')}
  >
    <div className="card-body">
      <h2 className="card-title">
        <span className="text-3xl mr-3">🏘️</span>
        My Properties
      </h2>
      <p>View and manage your saved property analyses</p>
      <div className="card-actions justify-end">
        <button className="btn btn-primary btn-sm">View Properties</button>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 4: Test navigation from dashboard**

Run: `npm run dev`
- Sign in
- Click "Analyze New Deal" → should navigate to /analyzer
- Click "My Properties" → should navigate to /properties

Expected: Navigation works correctly

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/pages/Dashboard.jsx
git commit -m "feat: add routing for analyzer and properties pages

Update App.jsx routes:
- Add /analyzer route (protected)
- Add /properties route (protected)

Update Dashboard:
- Add navigation cards for analyzer and properties
- Cards are clickable and navigate to respective pages

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Chunk 6: Firestore Security Rules & Final Testing

### Task 10: Update Firestore Security Rules

**Files:**
- Manual update via Firebase Console

- [ ] **Step 1: Open Firebase Console**

Navigate to: https://console.firebase.google.com/
Select project: real-estate-investor-too-7d09e
Click: Firestore Database → Rules

- [ ] **Step 2: Update security rules**

Replace existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /properties/{propertyId} {
      // Users can read their own properties
      allow read: if request.auth != null
                  && request.auth.uid == resource.data.userId;

      // Users can update their own properties
      allow update: if request.auth != null
                    && request.auth.uid == resource.data.userId
                    && request.auth.uid == request.resource.data.userId;

      // Users can create properties for themselves
      allow create: if request.auth != null
                    && request.auth.uid == request.resource.data.userId;

      // Users can delete their own properties
      allow delete: if request.auth != null
                    && request.auth.uid == resource.data.userId;
    }
  }
}
```

- [ ] **Step 3: Publish rules**

Click "Publish" button in Firebase Console

- [ ] **Step 4: Document completion**

Create a note that Firestore rules have been updated manually via console.

---

### Task 11: End-to-End Testing

**Files:**
- Manual testing

- [ ] **Step 1: Test complete user flow**

1. Start dev server: `npm run dev`
2. Sign in with Google or GitHub
3. Navigate to Dashboard
4. Click "Analyze New Deal"
5. Fill in property details:
   - Address: "123 Test St"
   - Purchase price: 300000
   - Monthly rent: 2500
   - Fill in expenses and financing
6. Verify calculations update live
7. Click "Save Property"
8. Verify redirect to My Properties
9. Verify property card appears with correct data
10. Click "Edit" on property
11. Verify form pre-fills with saved data
12. Make a change and click "Update Property"
13. Verify changes saved
14. Click "Delete" on property
15. Confirm deletion dialog
16. Verify property removed from list

Expected: All steps work without errors

- [ ] **Step 2: Test validation**

1. Go to /analyzer
2. Click "Save Property" without filling required fields
3. Verify error messages appear
4. Fill in only address
5. Click "Save Property"
6. Verify error for purchase price
7. Fill all required fields
8. Verify "Save Property" button works

Expected: Validation prevents saving incomplete data

- [ ] **Step 3: Test edge cases**

1. Test with 0% down payment
2. Test with 0% interest rate (cash purchase)
3. Test with negative cash flow property
4. Test with very large numbers
5. Test rapid typing (verify debouncing works)

Expected: All edge cases handled gracefully

- [ ] **Step 4: Test responsive design**

1. Resize browser to mobile width
2. Verify forms stack vertically
3. Verify cards are full width
4. Verify navigation works
5. Test on actual mobile device if available

Expected: Mobile experience is usable

- [ ] **Step 5: Document completion**

All manual testing complete. Feature is ready for user acceptance testing.

---

## Verification & Completion

### Pre-Launch Checklist

- [ ] All unit tests pass: `npm test`
- [ ] All calculation formulas verified against industry standards
- [ ] Form validation prevents invalid data
- [ ] Firestore security rules prevent unauthorized access
- [ ] Responsive design works on mobile and desktop
- [ ] Navigation flows work correctly
- [ ] Empty states display appropriately
- [ ] Error messages are user-friendly
- [ ] Loading states provide feedback

### Known Limitations (MVP)

1. No address auto-population (deferred to post-MVP)
2. No property comparison views
3. No export/PDF functionality
4. No appreciation projections
5. Rental properties only (flip/multi-family deferred)

### Next Steps (Post-MVP)

1. Integrate Rentcast API for address lookup
2. Add fix-and-flip calculator
3. Add multi-family per-unit analysis
4. Add property comparison view
5. Add export to PDF
6. Add portfolio analytics dashboard

---

## Notes for Implementation

- Follow TDD discipline: write test first, see it fail, implement, see it pass
- Commit frequently with descriptive messages
- Run `npm test` after each task to verify nothing broke
- Use DaisyUI classes for consistent styling
- All calculations must be pure functions in utils/calculations.js
- Keep components focused and single-responsibility
- Use useMemo for expensive calculations
- Handle loading and error states consistently

---

**Total estimated time:** 4-6 hours for complete implementation
**Skill level required:** Intermediate React, basic Firebase knowledge
