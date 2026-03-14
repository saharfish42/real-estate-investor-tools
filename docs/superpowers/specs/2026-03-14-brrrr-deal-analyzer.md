# BRRRR Deal Analyzer - Design Specification

**Date:** 2026-03-14
**Status:** Approved
**Scope:** Enhance Deal Analyzer to support BRRRR strategy with refinance tracking

## Overview

Enhance the existing Deal Analyzer to support the BRRRR (Buy, Rehab, Rent, Refinance, Repeat) investment strategy. Users can track the full cycle from purchase through refinance, with automatic calculation of rehab budget, cash pulled out, and net cash invested.

## Goals

1. Support BRRRR investment strategy with full cycle tracking
2. Simplify purchase inputs by removing closing costs and down payment percentage
3. Track refinance details and calculate cash-out refinance metrics
4. Change expense inputs from monthly to annual (HOA, tax, insurance)
5. Maintain backward compatibility with existing saved properties

## Changes from Current Implementation

### Form Field Changes

**Removed:**
- Closing Costs field
- Down Payment Percent field

**Modified:**
- Purchase Price → remains but relationship changes
- HOA, Property Tax, Insurance → changed from monthly to annual inputs

**Added:**
- Cash Down Payment (dollar amount)
- Initial Loan Amount
- Rehab Budget (auto-calculated, read-only)
- Refinance section (optional/collapsible):
  - Refinance Loan Amount
  - Cash Pulled Out (auto-calculated)
  - Net Cash Invested (auto-calculated)

### Calculation Changes

**Active Loan Logic:**
- If refinance loan exists → use refinance loan for mortgage calculations
- If no refinance → use initial loan for mortgage calculations

**New Calculations:**
- Rehab Budget = (Initial Loan + Cash Down) - Purchase Price
- Cash Pulled Out = Refinance Loan - Initial Loan
- Net Cash Invested = Cash Down - Cash Pulled Out

**Modified Calculations:**
- Monthly Expenses now divides annual expenses by 12
- Cash-on-Cash Return uses Net Cash Invested instead of Down Payment + Closing Costs

## Component Architecture

### Modified Components

#### 1. PropertyForm.jsx

**Updated Sections:**

**Purchase Details Section:**
```javascript
// Old structure:
- Purchase Price
- Closing Costs ($ or %)
- Down Payment (%)

// New structure:
- Purchase Price
- Cash Down Payment ($)
- Initial Loan Amount ($)
- Rehab Budget (calculated, read-only, $)
```

**New Refinance Section (collapsible/optional):**
```javascript
- Refinance Loan Amount ($)
- Cash Pulled Out (calculated, read-only, $)
- Net Cash Invested (calculated, read-only, $)
```

**Yearly Expenses Section:**
```javascript
// Old labels:
- Property Tax (annual ÷ 12)
- Insurance (annual ÷ 12)
- HOA Fees (monthly)

// New labels:
- Property Tax (annual)
- Insurance (annual)
- HOA Fees (annual)
```

#### 2. DealAnalyzer.jsx

**Updated State (DEFAULT_VALUES):**
```javascript
{
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
}
```

**Updated Calculations (useMemo):**

```javascript
// Determine active loan
const initialLoan = parseFloat(values.initialLoan) || 0;
const refinanceLoan = parseFloat(values.refinanceLoan) || 0;
const activeLoanAmount = refinanceLoan > 0 ? refinanceLoan : initialLoan;

// Calculate rehab budget
const purchasePrice = parseFloat(values.purchasePrice) || 0;
const cashDown = parseFloat(values.cashDown) || 0;
const rehabBudget = (initialLoan + cashDown) - purchasePrice;

// Calculate refinance metrics
const cashPulledOut = refinanceLoan > 0 ? (refinanceLoan - initialLoan) : 0;
const netCashInvested = cashDown - cashPulledOut;

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

// Mortgage payment uses active loan
const mortgagePayment = calculateMortgagePayment(activeLoanAmount, interestRate, loanTerm);

// Cash-on-cash return uses net cash invested
const annualCashFlow = monthlyCashFlow * 12;
const cashOnCashReturn = calculateCashOnCashReturn(annualCashFlow, netCashInvested);
```

**Updated Validation:**
```javascript
// Required fields
if (!values.address || values.address.trim().length < 3) {
  newErrors.address = 'Address is required';
}

if (!values.purchasePrice || values.purchasePrice <= 0) {
  newErrors.purchasePrice = 'Purchase price must be greater than 0';
}

if (values.cashDown < 0) {
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

// Existing validations
if (values.financing.interestRate < 0.1 || values.financing.interestRate > 20) {
  newErrors.interestRate = 'Interest rate must be between 0.1% and 20%';
}

if (values.financing.loanTerm < 1 || values.financing.loanTerm > 50) {
  newErrors.loanTerm = 'Loan term must be between 1 and 50 years';
}
```

**Updated Save Logic:**
```javascript
const propertyData = {
  ...values,
  userId: user.uid,
  purchasePrice: parseFloat(values.purchasePrice),
  cashDown: parseFloat(values.cashDown),
  initialLoan: parseFloat(values.initialLoan),
  rehabBudget: calculations.rehabBudget,
  refinanceLoan: values.refinanceLoan ? parseFloat(values.refinanceLoan) : null,
  cashPulledOut: calculations.cashPulledOut,
  netCashInvested: calculations.netCashInvested,
  monthlyRent: parseFloat(values.monthlyRent),
  expenses: {
    propertyTax: parseFloat(values.expenses.propertyTax) || 0,      // annual
    insurance: parseFloat(values.expenses.insurance) || 0,          // annual
    hoa: parseFloat(values.expenses.hoa) || 0,                     // annual
    management: calculations.management,                            // monthly (calculated)
    managementPercent: parseFloat(values.expenses.managementPercent),
    maintenance: calculations.maintenance,                          // monthly (calculated)
    maintenancePercent: parseFloat(values.expenses.maintenancePercent),
    vacancy: calculations.vacancy,                                  // monthly (calculated)
    vacancyPercent: parseFloat(values.expenses.vacancyPercent)
  },
  financing: {
    interestRate: parseFloat(values.financing.interestRate),
    loanTerm: parseInt(values.financing.loanTerm)
  },
  updatedAt: serverTimestamp()
};
```

#### 3. AnalysisResults.jsx

**Updated Display Sections:**

**Investment Summary Card (new):**
- Purchase Price: $256,200
- Cash Down: $44,000
- Initial Loan: $232,500
- Rehab Budget: $20,300 (calculated)
- *If refinanced:*
  - Refinance Loan: $253,300
  - Cash Pulled Out: $20,800
  - Net Cash Invested: $23,200

**Monthly Cash Flow Card (updated):**
- Monthly Income: $2,500
- Monthly Expenses: $975
- Mortgage Payment: $1,597 (based on active loan)
- **Net Monthly Cash Flow:** $-72 (color-coded)

**Annual Returns Card (updated):**
- Annual Cash Flow: $-864
- Total Cash Invested: $23,200 (net after refinance)
- **Cash-on-Cash Return:** -3.74%
- **Cap Rate:** 6.1%

**Financing Details Card (updated):**
- Active Loan Amount: $253,300 (or $232,500 if not refinanced)
- Monthly Mortgage Payment: $1,597
- Total Interest Over Term: $322,000
- Total Paid: $575,000

**Expense Breakdown Card (unchanged):**
- List of all expenses with percentages

#### 4. PropertyCard.jsx (minimal changes)

**Update display to use new fields:**
- Show Net Cash Invested instead of Down Payment
- Display remains largely the same (address, purchase price, cash flow)

## Data Model

### Firestore Structure

**Collection:** `properties`

**Updated Document Schema:**
```javascript
{
  // Ownership
  userId: string,              // Firebase Auth UID

  // Property Info
  address: string,             // "123 Main St, City, State"
  bedrooms: number | null,
  bathrooms: number | null,

  // Purchase
  purchasePrice: number,       // 256200
  cashDown: number,            // 44000
  initialLoan: number,         // 232500
  rehabBudget: number,         // 20300 (calculated)

  // Refinance (optional)
  refinanceLoan: number | null,  // 253300 or null
  cashPulledOut: number,         // 20800 (calculated)
  netCashInvested: number,       // 23200 (calculated)

  // Income
  monthlyRent: number,         // 2500

  // Expenses (annual values, divided by 12 for calculations)
  expenses: {
    propertyTax: number,       // 3000 (annual)
    insurance: number,         // 1200 (annual)
    hoa: number,              // 0 (annual)
    management: number,        // 250 (monthly, calculated)
    managementPercent: number, // 10
    maintenance: number,       // 250 (monthly, calculated)
    maintenancePercent: number,// 1
    vacancy: number,           // 125 (monthly, calculated)
    vacancyPercent: number     // 5
  },

  // Financing
  financing: {
    interestRate: number,      // 7.0
    loanTerm: number          // 30
  },

  // Metadata
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Migration Strategy for Existing Data

Existing properties will have old schema. Handle gracefully:

```javascript
// When loading property
const loadedData = propertyDoc.data();

// Map old fields to new fields
const mappedData = {
  ...loadedData,
  // If old structure, convert to new
  cashDown: loadedData.cashDown || loadedData.downPayment || 0,
  initialLoan: loadedData.initialLoan || (loadedData.purchasePrice - (loadedData.downPayment || 0)),
  refinanceLoan: loadedData.refinanceLoan || null,
  expenses: {
    ...loadedData.expenses,
    // If old monthly values exist, convert to annual
    propertyTax: loadedData.expenses.propertyTax * (loadedData.expenses.propertyTaxIsAnnual ? 1 : 12),
    insurance: loadedData.expenses.insurance * (loadedData.expenses.insuranceIsAnnual ? 1 : 12),
    hoa: loadedData.expenses.hoa * (loadedData.expenses.hoaIsAnnual ? 1 : 12)
  }
};
```

**Note:** For simplicity, if migration is complex, can require users to re-enter old properties. Since this is pre-production, data migration may not be necessary.

## User Flows

### Create New BRRRR Property

1. User navigates to `/analyzer`
2. Form loads with default values
3. User enters purchase details:
   - Purchase Price: $256,200
   - Cash Down: $44,000
   - Initial Loan: $232,500
   - Sees Rehab Budget auto-calculate: $20,300
4. User enters income and expenses (annual values)
5. User expands "Refinance" section (optional)
6. User enters refinance loan: $253,300
   - Sees Cash Pulled Out: $20,800
   - Sees Net Cash Invested: $23,200
7. Calculations update live using refinance loan
8. User clicks "Save Property"
9. Validation runs
10. If valid → saves to Firestore → navigates to `/properties`

### Edit Existing Property

1. User clicks property from list
2. Navigate to `/analyzer?id={propertyId}`
3. Form pre-fills with all data
4. Refinance section expands if refinance loan exists
5. User modifies values
6. Calculations update live
7. User clicks "Update Property"
8. Saves changes to Firestore

### Create Simple Purchase (No Refinance)

1. User enters purchase details
2. User skips/collapses refinance section
3. Calculations use initial loan
4. Net Cash Invested = Cash Down
5. Works like traditional rental analysis

## Validation Rules

### Required Fields
- Address (string, min 3 characters)
- Purchase Price (number > 0)
- Cash Down (number ≥ 0)
- Initial Loan Amount (number > 0)
- Monthly Rent (number > 0)

### Numeric Constraints
- All currency fields: number ≥ 0
- Interest Rate: 0.1 - 20%
- Loan Term: 1 - 50 years
- All percentage fields: 0 - 100%

### Optional Field Validation
- Refinance Loan: if entered, must be > 0

### Error Messages
- "Address is required"
- "Purchase price must be greater than 0"
- "Cash down must be 0 or greater"
- "Initial loan amount must be greater than 0"
- "Monthly rent must be greater than 0"
- "Refinance loan must be greater than 0"
- "Interest rate must be between 0.1% and 20%"
- "Loan term must be between 1 and 50 years"

### Display Behavior
- Inline errors below each field
- Red border on invalid fields
- Save button disabled if validation errors exist
- Toast notification on successful save

## UI/UX Considerations

### Refinance Section

**Collapsible Design:**
- Section header: "Refinance (Optional)" with expand/collapse icon
- Collapsed by default for new properties
- Auto-expands when editing property with refinance data
- Shows calculated fields (Cash Pulled Out, Net Cash Invested) in read-only styled inputs

**Read-Only Calculated Fields:**
- Rehab Budget
- Cash Pulled Out
- Net Cash Invested

Style these differently to indicate they're calculated:
- Lighter background
- Disabled appearance
- Info icon with tooltip explaining calculation

### Expense Input Labels

Update labels to be clear about annual vs monthly:
- "Property Tax (annual)"
- "Insurance (annual)"
- "HOA Fees (annual)"
- "Property Management (% of monthly rent)"
- "Maintenance (% of purchase price, annual)"
- "Vacancy (% of monthly rent)"

### Investment Summary Display

Add new card in AnalysisResults showing:
```
Investment Summary
─────────────────
Purchase Price:        $256,200
Cash Down:             $44,000
Initial Loan:          $232,500
Rehab Budget:          $20,300

[If refinanced:]
Refinance Loan:        $253,300
Cash Pulled Out:       $20,800
Net Cash Invested:     $23,200
```

## Testing Strategy

### Unit Tests - Calculations

**New Calculation Functions:**
```javascript
// test calculateRehabBudget()
test('calculates rehab budget correctly', () => {
  expect(calculateRehabBudget(232500, 44000, 256200)).toBe(20300);
});

// test calculateCashPulledOut()
test('calculates cash pulled out on refinance', () => {
  expect(calculateCashPulledOut(253300, 232500)).toBe(20800);
});

// test calculateNetCashInvested()
test('calculates net cash invested after refinance', () => {
  expect(calculateNetCashInvested(44000, 20800)).toBe(23200);
});

// test activeLoanAmount logic
test('uses refinance loan when present', () => {
  expect(getActiveLoan(232500, 253300)).toBe(253300);
});

test('uses initial loan when no refinance', () => {
  expect(getActiveLoan(232500, null)).toBe(232500);
});
```

**Updated Calculation Tests:**
```javascript
// test expense division by 12
test('converts annual property tax to monthly', () => {
  const monthly = calculateMonthlyExpense(3000);
  expect(monthly).toBe(250);
});

// test cash-on-cash with net cash invested
test('calculates cash-on-cash return with refinance', () => {
  const annualCashFlow = -864;
  const netCashInvested = 23200;
  expect(calculateCashOnCashReturn(annualCashFlow, netCashInvested)).toBeCloseTo(-3.72, 2);
});
```

### Component Tests

**PropertyForm:**
- Renders new purchase fields (cashDown, initialLoan)
- Shows rehab budget as calculated/read-only
- Refinance section collapses/expands
- Shows refinance calculated fields when refinance loan entered
- Annual expense labels display correctly
- Validation errors show for new required fields

**DealAnalyzer:**
- Calculates rehab budget correctly
- Uses refinance loan when present for mortgage calculation
- Uses initial loan when no refinance
- Calculates net cash invested correctly
- Converts annual expenses to monthly for calculations
- Saves both annual and calculated monthly values

**AnalysisResults:**
- Displays Investment Summary card with all BRRRR metrics
- Shows refinance section only when refinance data exists
- Cash-on-cash return uses net cash invested
- Active loan shown in financing details

### Integration Tests

**BRRRR Flow:**
- Create property with purchase details → rehab budget calculates
- Add refinance loan → cash pulled out and net invested calculate
- Mortgage payment updates to use refinance loan
- Save property → all fields persist correctly
- Load property → refinance section expands with data

**Simple Purchase Flow:**
- Create property without refinance
- Net cash invested = cash down
- Mortgage uses initial loan
- Save and load correctly

**Migration:**
- Load old property format
- Maps old fields to new structure
- Displays without errors
- Can edit and save in new format

### Edge Cases

**Zero Rehab Budget:**
- Initial Loan + Cash Down = Purchase Price exactly
- Rehab Budget = $0
- Should display and calculate correctly

**Negative Rehab Budget:**
- Initial Loan + Cash Down < Purchase Price
- Shows negative rehab (user paid more cash than expected)
- Should display and calculate correctly (valid scenario)

**Large Refinance:**
- Refinance Loan > Initial Loan significantly
- Large cash pulled out
- Net cash invested might be negative (pulled more than initially invested)
- Should handle gracefully

**No Down Payment:**
- Cash Down = $0
- 100% financing scenario
- Should validate and calculate correctly

## Success Metrics

Implementation successful if:
1. User can enter BRRRR deal with all phases (purchase + refinance)
2. Rehab budget auto-calculates correctly
3. Refinance metrics (cash out, net invested) calculate correctly
4. Mortgage calculations use active loan (refinance when present)
5. Annual expenses convert to monthly correctly
6. All existing tests still pass
7. New BRRRR-specific tests pass
8. Form validation prevents invalid data
9. Data saves and loads correctly with new schema
10. UI clearly shows calculated vs. input fields

## Implementation Plan

Will be created in next phase using the `superpowers:writing-plans` skill.
