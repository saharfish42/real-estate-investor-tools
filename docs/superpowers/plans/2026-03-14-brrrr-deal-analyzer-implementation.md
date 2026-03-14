# BRRRR Deal Analyzer Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance Deal Analyzer to support BRRRR strategy with purchase tracking, refinance calculations, and annual expense inputs.

**Architecture:** Modify existing Deal Analyzer components to track full BRRRR cycle (purchase + refinance). Add new calculation functions for rehab budget, cash pulled out, and net cash invested. Update form to use annual expense inputs (tax, insurance, HOA) and replace purchase price + down payment % with purchase price + cash down + loan amount structure.

**Tech Stack:** React 19, Firebase/Firestore, Vitest, React Testing Library, DaisyUI

---

## File Structure

### Files to Modify

**Utilities:**
- `src/utils/calculations.js` - Add 3 new calculation functions for BRRRR metrics

**Pages:**
- `src/pages/DealAnalyzer.jsx` - Update state structure, calculations logic, validation, and save/load logic

**Components:**
- `src/components/analyzer/PropertyForm.jsx` - Replace purchase fields, add refinance section, change expense labels
- `src/components/analyzer/AnalysisResults.jsx` - Add Investment Summary card with BRRRR metrics
- `src/components/analyzer/PropertyCard.jsx` - Update to display net cash invested

**Tests:**
- `tests/utils/calculations.test.js` - Add tests for new calculation functions
- `tests/pages/DealAnalyzer.test.jsx` - Update tests for new state and validation
- `tests/components/analyzer/PropertyForm.test.jsx` - Update tests for new form structure
- `tests/components/analyzer/AnalysisResults.test.jsx` - Add tests for Investment Summary card
- `tests/components/analyzer/PropertyCard.test.jsx` - Update tests for new data structure

---

## Chunk 1: Calculation Functions

### Task 1: Add BRRRR Calculation Functions

**Files:**
- Modify: `src/utils/calculations.js`
- Test: `tests/utils/calculations.test.js`

**Context:** Add three new pure functions to calculate BRRRR-specific metrics: rehab budget, cash pulled out on refinance, and net cash invested.

- [ ] **Step 1: Write failing tests for new calculation functions**

Add to `tests/utils/calculations.test.js`:

```javascript
import {
  calculateRehabBudget,
  calculateCashPulledOut,
  calculateNetCashInvested
} from '../src/utils/calculations';

describe('BRRRR Calculations', () => {
  describe('calculateRehabBudget', () => {
    it('should calculate rehab budget correctly', () => {
      // Example: Initial Loan $232,500 + Cash Down $44,000 - Purchase Price $256,200 = $20,300
      expect(calculateRehabBudget(232500, 44000, 256200)).toBe(20300);
    });

    it('should return 0 when loan + cash equals purchase price', () => {
      expect(calculateRehabBudget(200000, 50000, 250000)).toBe(0);
    });

    it('should handle negative rehab budget (user paid more cash)', () => {
      // User paid $60k cash but only borrowed $190k for $260k property = -$10k
      expect(calculateRehabBudget(190000, 60000, 260000)).toBe(-10000);
    });
  });

  describe('calculateCashPulledOut', () => {
    it('should calculate cash pulled out on refinance', () => {
      // Refinance $253,300 - Initial Loan $232,500 = $20,800
      expect(calculateCashPulledOut(253300, 232500)).toBe(20800);
    });

    it('should return 0 when no refinance occurred', () => {
      expect(calculateCashPulledOut(null, 232500)).toBe(0);
    });

    it('should return 0 when refinance is 0', () => {
      expect(calculateCashPulledOut(0, 232500)).toBe(0);
    });

    it('should handle paying down loan on refinance (negative cash out)', () => {
      // Refinanced to lower amount
      expect(calculateCashPulledOut(220000, 232500)).toBe(-12500);
    });
  });

  describe('calculateNetCashInvested', () => {
    it('should calculate net cash invested after refinance', () => {
      // Cash Down $44,000 - Cash Pulled Out $20,800 = $23,200
      expect(calculateNetCashInvested(44000, 20800)).toBe(23200);
    });

    it('should return cash down when no cash pulled out', () => {
      expect(calculateNetCashInvested(44000, 0)).toBe(44000);
    });

    it('should handle pulling out more than initially invested (negative)', () => {
      // Pulled out more than down payment = negative net invested
      expect(calculateNetCashInvested(44000, 50000)).toBe(-6000);
    });

    it('should handle zero down payment', () => {
      expect(calculateNetCashInvested(0, 0)).toBe(0);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npm test -- tests/utils/calculations.test.js
```

Expected: FAIL with "calculateRehabBudget is not defined", etc.

- [ ] **Step 3: Implement calculation functions**

Add to `src/utils/calculations.js`:

```javascript
/**
 * Calculate rehab budget from loan structure
 * @param {number} initialLoan - Initial loan amount (may include rehab costs)
 * @param {number} cashDown - Cash down payment
 * @param {number} purchasePrice - Property purchase price
 * @returns {number} Rehab budget (can be negative if user overpaid in cash)
 */
export function calculateRehabBudget(initialLoan, cashDown, purchasePrice) {
  return (initialLoan + cashDown) - purchasePrice;
}

/**
 * Calculate cash pulled out on refinance
 * @param {number|null} refinanceLoan - Refinance loan amount (null if no refinance)
 * @param {number} initialLoan - Original loan amount
 * @returns {number} Cash pulled out (can be negative if paid down)
 */
export function calculateCashPulledOut(refinanceLoan, initialLoan) {
  if (!refinanceLoan || refinanceLoan === 0) return 0;
  return refinanceLoan - initialLoan;
}

/**
 * Calculate net cash invested after refinance
 * @param {number} cashDown - Initial cash down payment
 * @param {number} cashPulledOut - Cash pulled out on refinance
 * @returns {number} Net cash still invested (can be negative if pulled out more)
 */
export function calculateNetCashInvested(cashDown, cashPulledOut) {
  return cashDown - cashPulledOut;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npm test -- tests/utils/calculations.test.js
```

Expected: All 10 new tests PASS (3 + 4 + 3 for each function)

- [ ] **Step 5: Commit**

```bash
git add src/utils/calculations.js tests/utils/calculations.test.js
git commit -m "feat: add BRRRR calculation functions for rehab budget and refinance"
```

---

## Chunk 2: PropertyForm Component Updates

### Task 2: Update PropertyForm - Purchase Details Section

**Files:**
- Modify: `src/components/analyzer/PropertyForm.jsx:72-135`
- Test: `tests/components/analyzer/PropertyForm.test.jsx`

**Context:** Replace "Closing Costs" and "Down Payment %" with "Cash Down" and "Initial Loan Amount". Add read-only "Rehab Budget" field.

- [ ] **Step 1: Write failing test for new purchase fields**

Add to `tests/components/analyzer/PropertyForm.test.jsx`:

```javascript
it('should render new purchase detail fields', () => {
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
  render(<PropertyForm values={defaultValues} onChange={mockOnChange} />);

  const cashDownInput = screen.getByLabelText(/cash down payment/i);
  await user.clear(cashDownInput);
  await user.type(cashDownInput, '50000');

  expect(mockOnChange).toHaveBeenCalledWith(
    expect.objectContaining({ cashDown: 50000 })
  );
});

it('should call onChange when initial loan changes', async () => {
  const user = userEvent.setup();
  render(<PropertyForm values={defaultValues} onChange={mockOnChange} />);

  const initialLoanInput = screen.getByLabelText(/initial loan amount/i);
  await user.clear(initialLoanInput);
  await user.type(initialLoanInput, '240000');

  expect(mockOnChange).toHaveBeenCalledWith(
    expect.objectContaining({ initialLoan: 240000 })
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npm test -- tests/components/analyzer/PropertyForm.test.jsx -t "purchase detail"
```

Expected: FAIL - fields not found

- [ ] **Step 3: Update PropertyForm Purchase Details section**

In `src/components/analyzer/PropertyForm.jsx`, replace lines 72-135 (Purchase Details section):

```javascript
{/* Purchase Details */}
<div className="mb-6">
  <h3 className="text-lg font-semibold mb-3">Purchase Details</h3>

  <div className="form-control mb-3">
    <label htmlFor="purchasePrice" className="label">
      <span className="label-text">Purchase Price *</span>
    </label>
    <input
      id="purchasePrice"
      type="number"
      className={`input input-bordered w-full ${errors.purchasePrice ? 'input-error' : ''}`}
      value={values.purchasePrice}
      onChange={(e) => {
        const parsed = parseFloat(e.target.value);
        handleInputChange('purchasePrice', Number.isNaN(parsed) ? '' : parsed);
      }}
      placeholder="256200"
    />
    {errors.purchasePrice && (
      <label className="label">
        <span className="label-text-alt text-error">{errors.purchasePrice}</span>
      </label>
    )}
  </div>

  <div className="form-control mb-3">
    <label htmlFor="cashDown" className="label">
      <span className="label-text">Cash Down Payment *</span>
    </label>
    <input
      id="cashDown"
      type="number"
      className={`input input-bordered w-full ${errors.cashDown ? 'input-error' : ''}`}
      value={values.cashDown}
      onChange={(e) => {
        const parsed = parseFloat(e.target.value);
        handleInputChange('cashDown', Number.isNaN(parsed) ? '' : parsed);
      }}
      placeholder="44000"
    />
    {errors.cashDown && (
      <label className="label">
        <span className="label-text-alt text-error">{errors.cashDown}</span>
      </label>
    )}
  </div>

  <div className="form-control mb-3">
    <label htmlFor="initialLoan" className="label">
      <span className="label-text">Initial Loan Amount *</span>
    </label>
    <input
      id="initialLoan"
      type="number"
      className={`input input-bordered w-full ${errors.initialLoan ? 'input-error' : ''}`}
      value={values.initialLoan}
      onChange={(e) => {
        const parsed = parseFloat(e.target.value);
        handleInputChange('initialLoan', Number.isNaN(parsed) ? '' : parsed);
      }}
      placeholder="232500"
    />
    {errors.initialLoan && (
      <label className="label">
        <span className="label-text-alt text-error">{errors.initialLoan}</span>
      </label>
    )}
  </div>

  <div className="form-control mb-3">
    <label htmlFor="rehabBudget" className="label">
      <span className="label-text">Rehab Budget (calculated)</span>
    </label>
    <input
      id="rehabBudget"
      type="text"
      className="input input-bordered w-full bg-base-200"
      value={((parseFloat(values.initialLoan) || 0) + (parseFloat(values.cashDown) || 0) - (parseFloat(values.purchasePrice) || 0)).toFixed(0)}
      readOnly
    />
    <label className="label">
      <span className="label-text-alt text-base-content/60">
        Initial Loan + Cash Down - Purchase Price
      </span>
    </label>
  </div>
</div>
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npm test -- tests/components/analyzer/PropertyForm.test.jsx -t "purchase detail"
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/analyzer/PropertyForm.jsx tests/components/analyzer/PropertyForm.test.jsx
git commit -m "feat: update PropertyForm purchase fields for BRRRR (cashDown, initialLoan, rehabBudget)"
```

### Task 3: Add PropertyForm - Refinance Section

**Files:**
- Modify: `src/components/analyzer/PropertyForm.jsx` (add after Purchase Details)
- Test: `tests/components/analyzer/PropertyForm.test.jsx`

**Context:** Add optional Refinance section with refinance loan field and calculated fields. Note: For MVP simplicity, the section will always be visible (not collapsible) but fields are optional. Collapsible behavior can be added in future iteration.

- [ ] **Step 1: Write failing test for refinance section**

Add to `tests/components/analyzer/PropertyForm.test.jsx`:

```javascript
it('should render refinance section', () => {
  const values = {
    ...defaultValues,
    purchasePrice: 256200,
    cashDown: 44000,
    initialLoan: 232500,
    refinanceLoan: 253300
  };

  render(<PropertyForm values={values} onChange={mockOnChange} />);

  // Should have refinance field
  expect(screen.getByLabelText(/refinance loan amount/i)).toBeInTheDocument();

  // Should show calculated fields (read-only)
  const cashPulledOut = screen.getByLabelText(/cash pulled out/i);
  expect(cashPulledOut).toBeInTheDocument();
  expect(cashPulledOut).toHaveAttribute('readonly');
  expect(cashPulledOut).toHaveValue('20800'); // 253300 - 232500

  const netCashInvested = screen.getByLabelText(/net cash invested/i);
  expect(netCashInvested).toBeInTheDocument();
  expect(netCashInvested).toHaveAttribute('readonly');
  expect(netCashInvested).toHaveValue('23200'); // 44000 - 20800
});

it('should call onChange when refinance loan changes', async () => {
  const user = userEvent.setup();
  render(<PropertyForm values={defaultValues} onChange={mockOnChange} />);

  const refinanceLoanInput = screen.getByLabelText(/refinance loan amount/i);
  await user.clear(refinanceLoanInput);
  await user.type(refinanceLoanInput, '250000');

  expect(mockOnChange).toHaveBeenCalledWith(
    expect.objectContaining({ refinanceLoan: 250000 })
  );
});

it('should show 0 for cash pulled out when no refinance', () => {
  const values = {
    ...defaultValues,
    initialLoan: 232500,
    refinanceLoan: ''
  };

  render(<PropertyForm values={values} onChange={mockOnChange} />);

  const cashPulledOut = screen.getByLabelText(/cash pulled out/i);
  expect(cashPulledOut).toHaveValue('0');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npm test -- tests/components/analyzer/PropertyForm.test.jsx -t "refinance"
```

Expected: FAIL - fields not found

- [ ] **Step 3: Add Refinance section to PropertyForm**

In `src/components/analyzer/PropertyForm.jsx`, add after Purchase Details section (after line ~135):

```javascript
{/* Refinance (Optional) */}
<div className="mb-6">
  <h3 className="text-lg font-semibold mb-3">Refinance (Optional)</h3>

  <div className="form-control mb-3">
    <label htmlFor="refinanceLoan" className="label">
      <span className="label-text">Refinance Loan Amount</span>
    </label>
    <input
      id="refinanceLoan"
      type="number"
      className={`input input-bordered w-full ${errors.refinanceLoan ? 'input-error' : ''}`}
      value={values.refinanceLoan}
      onChange={(e) => {
        const parsed = parseFloat(e.target.value);
        handleInputChange('refinanceLoan', Number.isNaN(parsed) ? '' : parsed);
      }}
      placeholder="253300"
    />
    {errors.refinanceLoan && (
      <label className="label">
        <span className="label-text-alt text-error">{errors.refinanceLoan}</span>
      </label>
    )}
  </div>

  <div className="form-control mb-3">
    <label htmlFor="cashPulledOut" className="label">
      <span className="label-text">Cash Pulled Out (calculated)</span>
    </label>
    <input
      id="cashPulledOut"
      type="text"
      className="input input-bordered w-full bg-base-200"
      value={(() => {
        const refinance = parseFloat(values.refinanceLoan) || 0;
        const initial = parseFloat(values.initialLoan) || 0;
        if (refinance === 0) return '0';
        return (refinance - initial).toFixed(0);
      })()}
      readOnly
    />
    <label className="label">
      <span className="label-text-alt text-base-content/60">
        Refinance Loan - Initial Loan
      </span>
    </label>
  </div>

  <div className="form-control mb-3">
    <label htmlFor="netCashInvested" className="label">
      <span className="label-text">Net Cash Invested (calculated)</span>
    </label>
    <input
      id="netCashInvested"
      type="text"
      className="input input-bordered w-full bg-base-200"
      value={(() => {
        const cashDown = parseFloat(values.cashDown) || 0;
        const refinance = parseFloat(values.refinanceLoan) || 0;
        const initial = parseFloat(values.initialLoan) || 0;
        const cashPulledOut = refinance > 0 ? (refinance - initial) : 0;
        return (cashDown - cashPulledOut).toFixed(0);
      })()}
      readOnly
    />
    <label className="label">
      <span className="label-text-alt text-base-content/60">
        Cash Down - Cash Pulled Out
      </span>
    </label>
  </div>
</div>
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npm test -- tests/components/analyzer/PropertyForm.test.jsx -t "refinance"
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/analyzer/PropertyForm.jsx tests/components/analyzer/PropertyForm.test.jsx
git commit -m "feat: add refinance section to PropertyForm with calculated fields"
```

### Task 4: Update PropertyForm - Expense Labels to Annual

**Files:**
- Modify: `src/components/analyzer/PropertyForm.jsx:163-215`
- Test: `tests/components/analyzer/PropertyForm.test.jsx`

**Context:** Change Property Tax, Insurance, and HOA labels from "annual ÷ 12" or monthly to "annual" since division by 12 will happen in calculations.

- [ ] **Step 1: Write failing test for annual expense labels**

Add to `tests/components/analyzer/PropertyForm.test.jsx`:

```javascript
it('should label property tax, insurance, and HOA as annual', () => {
  render(<PropertyForm values={defaultValues} onChange={mockOnChange} />);

  expect(screen.getByLabelText(/property tax.*annual/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/insurance.*annual/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/hoa.*annual/i)).toBeInTheDocument();

  // Should NOT say "÷ 12" or "monthly"
  expect(screen.queryByText(/÷ 12/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npm test -- tests/components/analyzer/PropertyForm.test.jsx -t "annual expense"
```

Expected: FAIL - labels still say "÷ 12"

- [ ] **Step 3: Update expense labels**

In `src/components/analyzer/PropertyForm.jsx`, update lines ~163-215:

```javascript
{/* Monthly Expenses */}
<div className="mb-6">
  <h3 className="text-lg font-semibold mb-3">Expenses</h3>
  <div className="form-control mb-3">
    <label htmlFor="propertyTax" className="label">
      <span className="label-text">Property Tax (annual)</span>
    </label>
    <input
      id="propertyTax"
      type="number"
      className="input input-bordered w-full"
      value={values.expenses.propertyTax}
      onChange={(e) => {
        const parsed = parseFloat(e.target.value);
        handleNestedChange('expenses', 'propertyTax', Number.isNaN(parsed) ? '' : parsed);
      }}
      placeholder="3000"
    />
  </div>

  <div className="form-control mb-3">
    <label htmlFor="insurance" className="label">
      <span className="label-text">Insurance (annual)</span>
    </label>
    <input
      id="insurance"
      type="number"
      className="input input-bordered w-full"
      value={values.expenses.insurance}
      onChange={(e) => {
        const parsed = parseFloat(e.target.value);
        handleNestedChange('expenses', 'insurance', Number.isNaN(parsed) ? '' : parsed);
      }}
      placeholder="1200"
    />
  </div>

  <div className="form-control mb-3">
    <label htmlFor="hoa" className="label">
      <span className="label-text">HOA Fees (annual)</span>
    </label>
    <input
      id="hoa"
      type="number"
      className="input input-bordered w-full"
      value={values.expenses.hoa}
      onChange={(e) => {
        const parsed = parseFloat(e.target.value);
        handleNestedChange('expenses', 'hoa', Number.isNaN(parsed) ? '' : parsed);
      }}
      placeholder="0"
    />
  </div>

  {/* Keep other expense fields unchanged - they're already % or monthly */}
</div>
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npm test -- tests/components/analyzer/PropertyForm.test.jsx -t "annual expense"
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/analyzer/PropertyForm.jsx tests/components/analyzer/PropertyForm.test.jsx
git commit -m "feat: update expense labels to annual (tax, insurance, HOA)"
```

---

## Chunk 3: DealAnalyzer Page Logic Updates

### Task 5: Update DealAnalyzer - State Structure

**Files:**
- Modify: `src/pages/DealAnalyzer.jsx:18-38`
- Test: `tests/pages/DealAnalyzer.test.jsx`

**Context:** Update DEFAULT_VALUES to match new state structure (remove closingCosts, downPaymentPercent; add cashDown, initialLoan, refinanceLoan).

- [ ] **Step 1: Write failing test for new state structure**

Add to `tests/pages/DealAnalyzer.test.jsx`:

```javascript
it('should initialize with new BRRRR state structure', () => {
  render(<DealAnalyzer />);

  // Should have new fields
  expect(screen.getByLabelText(/cash down payment/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/initial loan amount/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/refinance loan amount/i)).toBeInTheDocument();

  // Should NOT have old fields
  expect(screen.queryByLabelText(/closing costs/i)).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/down payment.*%/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npm test -- tests/pages/DealAnalyzer.test.jsx -t "BRRRR state"
```

Expected: FAIL - old fields still present

- [ ] **Step 3: Update DEFAULT_VALUES**

In `src/pages/DealAnalyzer.jsx`, replace lines 18-38:

```javascript
const DEFAULT_VALUES = {
  address: '',
  bedrooms: '',
  bathrooms: '',
  purchasePrice: '',
  cashDown: '',
  initialLoan: '',
  refinanceLoan: '',
  monthlyRent: '',
  expenses: {
    propertyTax: '',      // now annual
    insurance: '',        // now annual
    hoa: '',             // now annual
    managementPercent: 10,
    maintenancePercent: 1,
    vacancyPercent: 5
  },
  financing: {
    interestRate: 7,
    loanTerm: 30
  }
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npm test -- tests/pages/DealAnalyzer.test.jsx -t "BRRRR state"
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/DealAnalyzer.jsx tests/pages/DealAnalyzer.test.jsx
git commit -m "refactor: update DealAnalyzer state structure for BRRRR"
```

### Task 6: Update DealAnalyzer - Calculations Logic

**Files:**
- Modify: `src/pages/DealAnalyzer.jsx:82-146` (calculations useMemo)
- Test: `tests/pages/DealAnalyzer.test.jsx`

**Context:** Update calculations to use active loan (refinance if present, otherwise initial), divide annual expenses by 12, and calculate BRRRR metrics.

- [ ] **Step 1: Write failing test for calculations with refinance**

Add to `tests/pages/DealAnalyzer.test.jsx`:

```javascript
it('should use refinance loan for mortgage calculation when present', async () => {
  const user = userEvent.setup();
  render(<DealAnalyzer />);

  // Enter property details
  await user.type(screen.getByLabelText(/purchase price/i), '256200');
  await user.type(screen.getByLabelText(/cash down/i), '44000');
  await user.type(screen.getByLabelText(/initial loan/i), '232500');
  await user.type(screen.getByLabelText(/monthly rent/i), '2500');

  // Enter refinance
  await user.type(screen.getByLabelText(/refinance loan/i), '253300');

  // Should show mortgage payment based on $253,300 loan, not $232,500
  // At 7% for 30 years: ~$1,684/month for $253,300
  expect(screen.getByText(/\$1,68[34]/)).toBeInTheDocument(); // Allowing for rounding
});

it('should use initial loan when no refinance', async () => {
  const user = userEvent.setup();
  render(<DealAnalyzer />);

  await user.type(screen.getByLabelText(/purchase price/i), '256200');
  await user.type(screen.getByLabelText(/cash down/i), '44000');
  await user.type(screen.getByLabelText(/initial loan/i), '232500');
  await user.type(screen.getByLabelText(/monthly rent/i), '2500');

  // No refinance - should use $232,500
  // At 7% for 30 years: ~$1,547/month
  expect(screen.getByText(/\$1,54[67]/)).toBeInTheDocument();
});

it('should calculate net cash invested correctly', async () => {
  const user = userEvent.setup();
  render(<DealAnalyzer />);

  await user.type(screen.getByLabelText(/cash down/i), '44000');
  await user.type(screen.getByLabelText(/initial loan/i), '232500');
  await user.type(screen.getByLabelText(/refinance loan/i), '253300');

  // Net Cash Invested = $44,000 - ($253,300 - $232,500) = $23,200
  expect(screen.getByText(/\$23,200/)).toBeInTheDocument();
});

it('should divide annual expenses by 12 for monthly calculation', async () => {
  const user = userEvent.setup();
  render(<DealAnalyzer />);

  // Enter annual property tax = $3,000
  await user.type(screen.getByLabelText(/property tax.*annual/i), '3000');
  await user.type(screen.getByLabelText(/monthly rent/i), '2500');

  // Monthly property tax should be $250 (3000/12)
  // This will show in expense breakdown
  expect(screen.getByText(/Property Tax.*\$250/)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npm test -- tests/pages/DealAnalyzer.test.jsx -t "calculations"
```

Expected: FAIL - calculations using old logic

- [ ] **Step 3: Update calculations useMemo**

In `src/pages/DealAnalyzer.jsx`, replace lines 82-146:

```javascript
// Calculate derived values
const calculations = useMemo(() => {
  const purchasePrice = parseFloat(values.purchasePrice) || 0;
  const monthlyRent = parseFloat(values.monthlyRent) || 0;
  const cashDown = parseFloat(values.cashDown) || 0;
  const initialLoan = parseFloat(values.initialLoan) || 0;
  const refinanceLoan = parseFloat(values.refinanceLoan) || 0;

  // Determine active loan (use refinance if present, otherwise initial)
  const activeLoanAmount = refinanceLoan > 0 ? refinanceLoan : initialLoan;

  // Calculate BRRRR metrics
  const rehabBudget = calculateRehabBudget(initialLoan, cashDown, purchasePrice);
  const cashPulledOut = calculateCashPulledOut(refinanceLoan, initialLoan);
  const netCashInvested = calculateNetCashInvested(cashDown, cashPulledOut);

  // Calculate monthly expenses (divide annual by 12)
  const propertyTax = (parseFloat(values.expenses.propertyTax) || 0) / 12;
  const insurance = (parseFloat(values.expenses.insurance) || 0) / 12;
  const hoa = (parseFloat(values.expenses.hoa) || 0) / 12;

  const managementPercent = parseFloat(values.expenses.managementPercent) || 0;
  const management = monthlyRent * (managementPercent / 100);

  const maintenancePercent = parseFloat(values.expenses.maintenancePercent) || 0;
  const maintenance = (purchasePrice * (maintenancePercent / 100)) / 12;

  const vacancyPercent = parseFloat(values.expenses.vacancyPercent) || 0;
  const vacancy = monthlyRent * (vacancyPercent / 100);

  const monthlyExpenses = propertyTax + insurance + hoa + management + maintenance + vacancy;

  // Calculate mortgage payment using active loan
  const interestRate = parseFloat(values.financing.interestRate) || 0;
  const loanTerm = parseInt(values.financing.loanTerm) || 30;
  const mortgagePayment = calculateMortgagePayment(activeLoanAmount, interestRate, loanTerm);

  // Calculate cash flow
  const monthlyCashFlow = calculateMonthlyCashFlow(monthlyRent, monthlyExpenses, mortgagePayment);
  const annualCashFlow = calculateAnnualCashFlow(monthlyCashFlow);

  // Calculate ROI metrics using net cash invested
  const cashOnCashReturn = calculateCashOnCashReturn(annualCashFlow, netCashInvested);

  const annualIncome = monthlyRent * 12;
  const annualExpenses = monthlyExpenses * 12;
  const noi = annualIncome - annualExpenses;
  const capRate = calculateCapRate(annualIncome, annualExpenses, purchasePrice);

  // Calculate financing details
  const totalInterest = calculateTotalInterest(mortgagePayment, activeLoanAmount, loanTerm);
  const totalPaid = mortgagePayment * loanTerm * 12;

  return {
    // BRRRR metrics
    rehabBudget,
    cashPulledOut,
    netCashInvested,
    activeLoanAmount,

    // Cash flow
    monthlyIncome: monthlyRent,
    monthlyExpenses,
    mortgagePayment,
    monthlyCashFlow,
    annualCashFlow,

    // ROI
    cashOnCashReturn,
    noi,
    capRate,

    // Financing
    totalInterest,
    totalPaid,

    // Individual expenses (for breakdown display)
    expenses: {
      propertyTax,
      insurance,
      hoa,
      management,
      maintenance,
      vacancy
    }
  };
}, [values]);
```

Also add import at top:

```javascript
import {
  calculateMortgagePayment,
  calculateMonthlyCashFlow,
  calculateAnnualCashFlow,
  calculateCashOnCashReturn,
  calculateCapRate,
  calculateTotalInterest,
  calculateRehabBudget,
  calculateCashPulledOut,
  calculateNetCashInvested
} from '../utils/calculations';
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npm test -- tests/pages/DealAnalyzer.test.jsx -t "calculations"
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/DealAnalyzer.jsx tests/pages/DealAnalyzer.test.jsx
git commit -m "feat: update calculations to use active loan and BRRRR metrics"
```

### Task 7: Update DealAnalyzer - Validation Logic

**Files:**
- Modify: `src/pages/DealAnalyzer.jsx:148-177` (validateForm function)
- Test: `tests/pages/DealAnalyzer.test.jsx`

**Context:** Update validation to require new fields (cashDown, initialLoan) and validate optional refinanceLoan. Remove old field validations.

- [ ] **Step 1: Write failing tests for new validations**

Add to `tests/pages/DealAnalyzer.test.jsx`:

```javascript
describe('validation', () => {
  it('should validate cash down must be >= 0 when entered', async () => {
    const user = userEvent.setup();
    render(<DealAnalyzer />);

    // Try to save with negative cash down
    await user.type(screen.getByLabelText(/address/i), '123 Main St');
    await user.type(screen.getByLabelText(/purchase price/i), '250000');
    await user.type(screen.getByLabelText(/cash down/i), '-5000');
    await user.type(screen.getByLabelText(/initial loan/i), '200000');
    await user.type(screen.getByLabelText(/monthly rent/i), '2000');
    await user.click(screen.getByRole('button', { name: /save property/i }));

    expect(screen.getByText(/cash down must be 0 or greater/i)).toBeInTheDocument();
  });

  it('should validate initial loan is required and > 0', async () => {
    const user = userEvent.setup();
    render(<DealAnalyzer />);

    await user.type(screen.getByLabelText(/address/i), '123 Main St');
    await user.type(screen.getByLabelText(/purchase price/i), '250000');
    await user.type(screen.getByLabelText(/cash down/i), '50000');
    await user.type(screen.getByLabelText(/monthly rent/i), '2000');
    await user.click(screen.getByRole('button', { name: /save property/i }));

    expect(screen.getByText(/initial loan amount must be greater than 0/i)).toBeInTheDocument();
  });

  it('should validate refinance loan must be > 0 if entered', async () => {
    const user = userEvent.setup();
    render(<DealAnalyzer />);

    await user.type(screen.getByLabelText(/address/i), '123 Main St');
    await user.type(screen.getByLabelText(/purchase price/i), '250000');
    await user.type(screen.getByLabelText(/cash down/i), '50000');
    await user.type(screen.getByLabelText(/initial loan/i), '200000');
    await user.type(screen.getByLabelText(/monthly rent/i), '2000');
    await user.type(screen.getByLabelText(/refinance loan/i), '0');
    await user.click(screen.getByRole('button', { name: /save property/i }));

    expect(screen.getByText(/refinance loan must be greater than 0/i)).toBeInTheDocument();
  });

  it('should NOT show errors for old fields', () => {
    render(<DealAnalyzer />);

    // Should not validate for closing costs or down payment percent
    expect(screen.queryByText(/closing costs/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/down payment.*percent/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npm test -- tests/pages/DealAnalyzer.test.jsx -t "validation"
```

Expected: FAIL - validation not updated

- [ ] **Step 3: Update validateForm function**

In `src/pages/DealAnalyzer.jsx`, replace lines 148-177:

```javascript
const validateForm = () => {
  const newErrors = {};

  if (!values.address || values.address.trim().length < 3) {
    newErrors.address = 'Address is required';
  }

  if (!values.purchasePrice || values.purchasePrice <= 0) {
    newErrors.purchasePrice = 'Purchase price must be greater than 0';
  }

  if (values.cashDown === '' || values.cashDown < 0) {
    newErrors.cashDown = 'Cash down must be 0 or greater';
  }

  if (!values.initialLoan || values.initialLoan <= 0) {
    newErrors.initialLoan = 'Initial loan amount must be greater than 0';
  }

  if (!values.monthlyRent || values.monthlyRent <= 0) {
    newErrors.monthlyRent = 'Monthly rent must be greater than 0';
  }

  // Optional refinance validation
  if (values.refinanceLoan && values.refinanceLoan <= 0) {
    newErrors.refinanceLoan = 'Refinance loan must be greater than 0';
  }

  if (values.financing.interestRate < 0.1 || values.financing.interestRate > 20) {
    newErrors.interestRate = 'Interest rate must be between 0.1% and 20%';
  }

  if (values.financing.loanTerm < 1 || values.financing.loanTerm > 50) {
    newErrors.loanTerm = 'Loan term must be between 1 and 50 years';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npm test -- tests/pages/DealAnalyzer.test.jsx -t "validation"
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/DealAnalyzer.jsx tests/pages/DealAnalyzer.test.jsx
git commit -m "feat: update validation for BRRRR fields"
```

### Task 8: Update DealAnalyzer - Save Logic

**Files:**
- Modify: `src/pages/DealAnalyzer.jsx:179-237` (handleSave function)
- Test: `tests/pages/DealAnalyzer.test.jsx`

**Context:** Update handleSave to save new data structure with BRRRR fields and calculated values. Store annual expenses as annual values. Note: Load logic already exists and will work with new structure since we're using spread operator. Old properties won't load correctly but this is acceptable pre-production.

- [ ] **Step 1: Write failing test for save with new structure**

Add to `tests/pages/DealAnalyzer.test.jsx`:

```javascript
it('should save property with BRRRR structure', async () => {
  const user = userEvent.setup();
  const mockAddDoc = vi.fn().mockResolvedValue({ id: 'test-property-id' });
  vi.spyOn(require('firebase/firestore'), 'addDoc').mockImplementation(mockAddDoc);

  render(<DealAnalyzer />);

  // Fill in BRRRR property
  await user.type(screen.getByLabelText(/address/i), '123 Main St');
  await user.type(screen.getByLabelText(/purchase price/i), '256200');
  await user.type(screen.getByLabelText(/cash down/i), '44000');
  await user.type(screen.getByLabelText(/initial loan/i), '232500');
  await user.type(screen.getByLabelText(/refinance loan/i), '253300');
  await user.type(screen.getByLabelText(/monthly rent/i), '2500');
  await user.type(screen.getByLabelText(/property tax.*annual/i), '3000');
  await user.type(screen.getByLabelText(/insurance.*annual/i), '1200');

  await user.click(screen.getByRole('button', { name: /save property/i }));

  expect(mockAddDoc).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      purchasePrice: 256200,
      cashDown: 44000,
      initialLoan: 232500,
      rehabBudget: 20300, // calculated
      refinanceLoan: 253300,
      cashPulledOut: 20800, // calculated
      netCashInvested: 23200, // calculated
      expenses: expect.objectContaining({
        propertyTax: 3000, // annual
        insurance: 1200 // annual
      })
    })
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npm test -- tests/pages/DealAnalyzer.test.jsx -t "save.*BRRRR"
```

Expected: FAIL - wrong data structure saved

- [ ] **Step 3: Update handleSave function**

In `src/pages/DealAnalyzer.jsx`, replace lines 179-237:

```javascript
const handleSave = async () => {
  if (!user) {
    alert('You must be logged in to save properties.');
    return;
  }

  if (!validateForm()) return;

  setSaving(true);
  try {
    const monthlyRent = parseFloat(values.monthlyRent) || 0;
    const purchasePrice = parseFloat(values.purchasePrice) || 0;
    const managementPercent = parseFloat(values.expenses.managementPercent) || 0;
    const maintenancePercent = parseFloat(values.expenses.maintenancePercent) || 0;
    const vacancyPercent = parseFloat(values.expenses.vacancyPercent) || 0;

    const propertyData = {
      ...values,
      userId: user.uid,
      purchasePrice: purchasePrice,
      cashDown: parseFloat(values.cashDown) || 0,
      initialLoan: parseFloat(values.initialLoan) || 0,
      rehabBudget: calculations.rehabBudget,
      refinanceLoan: values.refinanceLoan ? parseFloat(values.refinanceLoan) : null,
      cashPulledOut: calculations.cashPulledOut,
      netCashInvested: calculations.netCashInvested,
      monthlyRent: monthlyRent,
      expenses: {
        propertyTax: parseFloat(values.expenses.propertyTax) || 0,      // annual
        insurance: parseFloat(values.expenses.insurance) || 0,          // annual
        hoa: parseFloat(values.expenses.hoa) || 0,                     // annual
        management: calculations.expenses.management,                   // monthly (calculated)
        managementPercent: managementPercent,
        maintenance: calculations.expenses.maintenance,                 // monthly (calculated)
        maintenancePercent: maintenancePercent,
        vacancy: calculations.expenses.vacancy,                         // monthly (calculated)
        vacancyPercent: vacancyPercent
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npm test -- tests/pages/DealAnalyzer.test.jsx -t "save.*BRRRR"
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/DealAnalyzer.jsx tests/pages/DealAnalyzer.test.jsx
git commit -m "feat: update save logic for BRRRR data structure"
```

---

## Chunk 4: AnalysisResults Component Updates

### Task 9: Add Investment Summary Card to AnalysisResults

**Files:**
- Modify: `src/components/analyzer/AnalysisResults.jsx`
- Test: `tests/components/analyzer/AnalysisResults.test.jsx`

**Context:** Add a new "Investment Summary" card at the top showing all BRRRR metrics (purchase details, rehab budget, refinance details, net cash invested).

- [ ] **Step 1: Write failing test for Investment Summary card**

Add to `tests/components/analyzer/AnalysisResults.test.jsx`:

```javascript
it('should display Investment Summary card with BRRRR metrics', () => {
  const calculations = {
    rehabBudget: 20300,
    cashPulledOut: 20800,
    netCashInvested: 23200,
    activeLoanAmount: 253300,
    monthlyIncome: 2500,
    monthlyExpenses: 975,
    mortgagePayment: 1684,
    monthlyCashFlow: -159,
    annualCashFlow: -1908,
    cashOnCashReturn: -8.22,
    capRate: 6.1,
    noi: 18300,
    totalInterest: 352640,
    totalPaid: 605640,
    expenses: {
      propertyTax: 250,
      insurance: 100,
      hoa: 0,
      management: 250,
      maintenance: 213,
      vacancy: 125
    }
  };

  // Also pass in the form values for purchase/refinance display
  const formValues = {
    purchasePrice: 256200,
    cashDown: 44000,
    initialLoan: 232500,
    refinanceLoan: 253300
  };

  render(<AnalysisResults calculations={calculations} formValues={formValues} />);

  // Should show Investment Summary heading
  expect(screen.getByText(/investment summary/i)).toBeInTheDocument();

  // Should show purchase details
  expect(screen.getByText(/purchase price/i)).toBeInTheDocument();
  expect(screen.getByText(/\$256,200/)).toBeInTheDocument();

  expect(screen.getByText(/cash down/i)).toBeInTheDocument();
  expect(screen.getByText(/\$44,000/)).toBeInTheDocument();

  expect(screen.getByText(/initial loan/i)).toBeInTheDocument();
  expect(screen.getByText(/\$232,500/)).toBeInTheDocument();

  expect(screen.getByText(/rehab budget/i)).toBeInTheDocument();
  expect(screen.getByText(/\$20,300/)).toBeInTheDocument();

  // Should show refinance section
  expect(screen.getByText(/refinance loan/i)).toBeInTheDocument();
  expect(screen.getByText(/\$253,300/)).toBeInTheDocument();

  expect(screen.getByText(/cash pulled out/i)).toBeInTheDocument();
  expect(screen.getByText(/\$20,800/)).toBeInTheDocument();

  expect(screen.getByText(/net cash invested/i)).toBeInTheDocument();
  expect(screen.getByText(/\$23,200/)).toBeInTheDocument();
});

it('should NOT show refinance section when no refinance', () => {
  const calculations = {
    rehabBudget: 20300,
    cashPulledOut: 0,
    netCashInvested: 44000,
    activeLoanAmount: 232500,
    // ... other fields
  };

  const formValues = {
    purchasePrice: 256200,
    cashDown: 44000,
    initialLoan: 232500,
    refinanceLoan: ''
  };

  render(<AnalysisResults calculations={calculations} formValues={formValues} />);

  // Should NOT show refinance details
  expect(screen.queryByText(/refinance loan/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/cash pulled out/i)).not.toBeInTheDocument();

  // But should still show net cash invested (equals cash down)
  expect(screen.getByText(/net cash invested/i)).toBeInTheDocument();
  expect(screen.getByText(/\$44,000/)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npm test -- tests/components/analyzer/AnalysisResults.test.jsx -t "Investment Summary"
```

Expected: FAIL - component doesn't accept formValues prop, card doesn't exist

- [ ] **Step 3: Update AnalysisResults component signature and add Investment Summary card**

In `src/components/analyzer/AnalysisResults.jsx`, add the Investment Summary card at the beginning (before the existing cards). Update the component signature to accept formValues:

```javascript
export default function AnalysisResults({ calculations, formValues = {} }) {
  // ... existing formatters ...

  // Determine if property has been refinanced
  const hasRefinance = formValues.refinanceLoan && parseFloat(formValues.refinanceLoan) > 0;

  return (
    <div className="space-y-6">
      {/* Investment Summary Card (NEW) */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Investment Summary</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-base-content/60">Purchase Price</p>
              <p className="text-lg font-semibold">{formatCurrency(formValues.purchasePrice || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Cash Down</p>
              <p className="text-lg font-semibold">{formatCurrency(formValues.cashDown || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Initial Loan</p>
              <p className="text-lg font-semibold">{formatCurrency(formValues.initialLoan || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Rehab Budget</p>
              <p className="text-lg font-semibold">{formatCurrency(calculations.rehabBudget || 0)}</p>
            </div>
          </div>

          {hasRefinance && (
            <>
              <div className="divider my-2"></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-base-content/60">Refinance Loan</p>
                  <p className="text-lg font-semibold">{formatCurrency(formValues.refinanceLoan || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-base-content/60">Cash Pulled Out</p>
                  <p className="text-lg font-semibold">{formatCurrency(calculations.cashPulledOut || 0)}</p>
                </div>
              </div>
            </>
          )}

          <div className="divider my-2"></div>
          <div>
            <p className="text-sm text-base-content/60">Net Cash Invested</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(calculations.netCashInvested || 0)}</p>
          </div>
        </div>
      </div>

      {/* Existing Monthly Cash Flow Card */}
      {/* ... rest of existing cards ... */}
    </div>
  );
}
```

- [ ] **Step 4: Update DealAnalyzer to pass formValues prop**

In `src/pages/DealAnalyzer.jsx`, update the AnalysisResults component call (around line 269):

```javascript
<AnalysisResults
  calculations={calculations}
  formValues={values}
/>
```

- [ ] **Step 5: Run tests to verify they pass**

Run:
```bash
npm test -- tests/components/analyzer/AnalysisResults.test.jsx -t "Investment Summary"
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/analyzer/AnalysisResults.jsx src/pages/DealAnalyzer.jsx tests/components/analyzer/AnalysisResults.test.jsx
git commit -m "feat: add Investment Summary card to AnalysisResults with BRRRR metrics"
```

### Task 10: Update AnalysisResults - Financing Details Card

**Files:**
- Modify: `src/components/analyzer/AnalysisResults.jsx` (Financing Details card)
- Test: `tests/components/analyzer/AnalysisResults.test.jsx`

**Context:** Update Financing Details card to show "Active Loan Amount" (which could be refinance or initial) instead of just "Loan Amount".

- [ ] **Step 1: Write failing test for active loan display**

Add to `tests/components/analyzer/AnalysisResults.test.jsx`:

```javascript
it('should display active loan amount in Financing Details', () => {
  const calculations = {
    activeLoanAmount: 253300,
    mortgagePayment: 1684,
    totalInterest: 352640,
    totalPaid: 605640,
    // ... other fields
  };

  render(<AnalysisResults calculations={calculations} formValues={{}} />);

  // Should show "Active Loan Amount" label
  expect(screen.getByText(/active loan amount/i)).toBeInTheDocument();
  expect(screen.getByText(/\$253,300/)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npm test -- tests/components/analyzer/AnalysisResults.test.jsx -t "active loan"
```

Expected: FAIL - still says "Loan Amount"

- [ ] **Step 3: Update Financing Details card label**

In `src/components/analyzer/AnalysisResults.jsx`, find the Financing Details card and update the first label:

```javascript
{/* Financing Details Card */}
<div className="card bg-base-100 shadow-lg">
  <div className="card-body">
    <h2 className="card-title">Financing Details</h2>
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-base-content/70">Active Loan Amount</span>
        <span className="font-semibold">{formatCurrency(calculations.activeLoanAmount || 0)}</span>
      </div>
      {/* ... rest unchanged ... */}
    </div>
  </div>
</div>
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npm test -- tests/components/analyzer/AnalysisResults.test.jsx -t "active loan"
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/analyzer/AnalysisResults.jsx tests/components/analyzer/AnalysisResults.test.jsx
git commit -m "feat: update Financing Details to show Active Loan Amount"
```

---

## Chunk 5: PropertyCard Component and Final Integration

### Task 11: Update PropertyCard Component

**Files:**
- Modify: `src/components/analyzer/PropertyCard.jsx`
- Test: `tests/components/analyzer/PropertyCard.test.jsx`

**Context:** Update PropertyCard to use new data structure (netCashInvested, active loan) and calculate cash flow with annual expenses divided by 12.

- [ ] **Step 1: Write failing test for PropertyCard with new structure**

Update `tests/components/analyzer/PropertyCard.test.jsx`:

```javascript
it('should display property with BRRRR structure and use refinance loan', () => {
  const property = {
    id: 'test-id',
    address: '123 Main St',
    purchasePrice: 256200,
    cashDown: 44000,
    initialLoan: 232500,
    refinanceLoan: 253300,
    netCashInvested: 23200,
    monthlyRent: 2500,
    expenses: {
      propertyTax: 3000,  // annual
      insurance: 1200,    // annual
      hoa: 0,            // annual
      management: 250,    // monthly (calculated)
      managementPercent: 10,
      maintenance: 213,   // monthly (calculated)
      maintenancePercent: 1,
      vacancy: 125,       // monthly (calculated)
      vacancyPercent: 5
    },
    financing: {
      interestRate: 7,
      loanTerm: 30
    }
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  render(<PropertyCard property={property} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

  // Should display address
  expect(screen.getByText('123 Main St')).toBeInTheDocument();

  // Should display purchase price
  expect(screen.getByText(/\$256,200/)).toBeInTheDocument();

  // Should calculate monthly cash flow using refinance loan
  // Monthly expenses = (3000+1200+0)/12 + 250 + 213 + 125 = 350 + 588 = 938
  // Mortgage at 7% on $253,300 for 30 years ≈ $1,684
  // Cash flow = 2500 - 938 - 1684 = -122
  expect(screen.getByText(/-\$122/)).toBeInTheDocument(); // Allow rounding
});

it('should use initial loan when no refinance', () => {
  const property = {
    id: 'test-id',
    address: '456 Oak Ave',
    purchasePrice: 200000,
    cashDown: 50000,
    initialLoan: 150000,
    refinanceLoan: null,
    netCashInvested: 50000,
    monthlyRent: 2000,
    expenses: {
      propertyTax: 2400,
      insurance: 960,
      hoa: 0,
      management: 200,
      managementPercent: 10,
      maintenance: 167,
      maintenancePercent: 1,
      vacancy: 100,
      vacancyPercent: 5
    },
    financing: {
      interestRate: 7,
      loanTerm: 30
    }
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  render(<PropertyCard property={property} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

  // Should use initial loan $150,000
  // Monthly expenses = (2400+960)/12 + 200 + 167 + 100 = 280 + 467 = 747
  // Mortgage ≈ $998
  // Cash flow = 2000 - 747 - 998 = 255
  expect(screen.getByText(/\$255/)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npm test -- tests/components/analyzer/PropertyCard.test.jsx
```

Expected: FAIL - calculations wrong, using old structure

- [ ] **Step 3: Update PropertyCard calculations**

In `src/components/analyzer/PropertyCard.jsx`, update the entire calculation logic:

```javascript
import { calculateMortgagePayment } from '../../utils/calculations';

export default function PropertyCard({ property, onEdit, onDelete }) {
  // Determine active loan
  const activeLoan = property.refinanceLoan && property.refinanceLoan > 0
    ? property.refinanceLoan
    : property.initialLoan;

  // Calculate monthly expenses (divide annual by 12)
  const monthlyPropertyTax = (property.expenses.propertyTax || 0) / 12;
  const monthlyInsurance = (property.expenses.insurance || 0) / 12;
  const monthlyHOA = (property.expenses.hoa || 0) / 12;

  const totalMonthlyExpenses = monthlyPropertyTax +
    monthlyInsurance +
    monthlyHOA +
    (property.expenses.management || 0) +
    (property.expenses.maintenance || 0) +
    (property.expenses.vacancy || 0);

  // Calculate mortgage payment using active loan
  const mortgagePayment = calculateMortgagePayment(
    activeLoan,
    property.financing.interestRate,
    property.financing.loanTerm
  );

  // Calculate monthly cash flow
  const monthlyCashFlow = property.monthlyRent - totalMonthlyExpenses - mortgagePayment;

  // Format currency
  const formatCurrency = (value) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(value));
    return value < 0 ? `-${formatted}` : formatted;
  };

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
      <div className="card-body">
        <h2 className="card-title">{property.address}</h2>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-base-content/70">Purchase Price</span>
            <span className="font-semibold">{formatCurrency(property.purchasePrice)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-base-content/70">Monthly Cash Flow</span>
            <span className={`font-bold ${monthlyCashFlow >= 0 ? 'text-success' : 'text-error'}`}>
              {formatCurrency(monthlyCashFlow)}
            </span>
          </div>
        </div>

        <div className="card-actions justify-end mt-4">
          <button className="btn btn-sm btn-primary" onClick={() => onEdit(property.id)}>
            Edit
          </button>
          <button className="btn btn-sm btn-error" onClick={() => onDelete(property.id)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npm test -- tests/components/analyzer/PropertyCard.test.jsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/analyzer/PropertyCard.jsx tests/components/analyzer/PropertyCard.test.jsx
git commit -m "feat: update PropertyCard to use BRRRR structure and active loan"
```

### Task 12: Final Verification

**Files:**
- All test files

**Context:** Run full test suite, verify all changes integrate correctly, and prepare for deployment.

- [ ] **Step 1: Run complete test suite**

Run:
```bash
npm test
```

Expected: All tests PASS

If any tests fail:
- Review the failure
- Fix the issue
- Re-run tests
- Commit the fix

- [ ] **Step 2: Build and verify in dev environment**

Run:
```bash
npm run dev
```

Open browser to http://localhost:5173 and manually test:
1. Create BRRRR property with refinance
2. Verify all calculations display correctly in Investment Summary
3. Verify cash flow calculations use refinance loan
4. Save property
5. Load property from list - verify PropertyCard shows correct cash flow
6. Edit property - verify all fields pre-fill correctly
7. Create simple property without refinance
8. Verify it uses initial loan for calculations
9. Test form validation for new required fields

- [ ] **Step 3: Commit any final fixes**

If you made any changes during manual testing:

```bash
git add .
git commit -m "fix: address issues found during manual testing"
```

- [ ] **Step 4: Build production bundle**

Run:
```bash
npm run build
```

Expected: Build succeeds with no errors

- [ ] **Step 5: Final commit and summary**

```bash
git log --oneline | head -15
```

Review all commits from this implementation. Should see:
- feat: add BRRRR calculation functions
- feat: update PropertyForm purchase fields
- feat: add refinance section to PropertyForm
- feat: update expense labels to annual
- refactor: update DealAnalyzer state structure
- feat: update calculations to use active loan
- feat: update validation for BRRRR fields
- feat: update save logic for BRRRR data structure
- feat: add Investment Summary card
- feat: update Financing Details card
- feat: update PropertyCard for BRRRR
- Plus any fixes

---

## Summary

This plan implements the BRRRR Deal Analyzer enhancement through 12 tasks organized into 5 chunks:

**Chunk 1 (Task 1):** Add calculation functions for BRRRR metrics
**Chunk 2 (Tasks 2-4):** Update PropertyForm component with new fields
**Chunk 3 (Tasks 5-8):** Update DealAnalyzer page logic
**Chunk 4 (Tasks 9-10):** Update AnalysisResults component
**Chunk 5 (Tasks 11-12):** Update PropertyCard and final verification

Each task follows TDD principles:
1. Write failing test
2. Run test to verify failure
3. Implement minimal code
4. Run test to verify pass
5. Commit

**Total estimated time:** 4-6 hours for all tasks

**Key implementation notes:**
- Always use active loan (refinance if present, otherwise initial) for mortgage calculations
- Store annual expenses as annual values, divide by 12 for monthly calculations
- Refinance section is optional - handle both scenarios gracefully
- Net cash invested can be negative if user pulled out more than initially invested
- Follow TDD strictly - no code without tests first
- Make frequent, atomic commits for easy rollback if needed

**Deployment:**
After all tasks complete and tests pass:
```bash
git push origin main
npm run build
firebase deploy --only hosting
```

Then update the live app URL in Task 11 (End-to-End Testing) checklist to test BRRRR features.

