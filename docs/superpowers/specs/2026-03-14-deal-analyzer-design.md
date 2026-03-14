# Deal Analyzer & Property Form - Design Specification

**Date:** 2026-03-14
**Status:** Approved
**Scope:** MVP - Rental Property Analysis with Manual Entry

## Overview

Build a deal analyzer for rental property investments that allows users to input property details manually and see live financial calculations. Users can save properties to Firebase for later comparison and editing.

## Goals

1. Enable users to evaluate rental property deals with key financial metrics
2. Provide real-time calculations as users input data
3. Save and manage multiple property analyses
4. Lay foundation for future expansion (fix-and-flip, multi-family)

## Non-Goals (Out of Scope for MVP)

- Auto-population from real estate APIs (Rentcast integration deferred)
- Fix-and-flip property analysis
- Multi-family property analysis
- Property comparison views
- Export/sharing functionality
- Mobile app

## Component Architecture

### New Pages

#### 1. DealAnalyzer (`/analyzer`)
- **Purpose:** Main analysis interface with form and live calculations
- **Layout:** Two-column (desktop) or stacked (mobile)
  - Left/Top: PropertyForm component
  - Right/Bottom: AnalysisResults component
- **State Management:** Local state for form values, useMemo for derived calculations
- **Actions:**
  - Save new property → navigate to `/properties`
  - Update existing property (when editing via URL parameter)

#### 2. MyProperties (`/properties`)
- **Purpose:** List all saved properties for the authenticated user
- **Layout:** Grid of property cards
- **Features:**
  - Display key info: address, purchase price, monthly cash flow
  - Click card → navigate to `/analyzer?id={propertyId}` (edit mode)
  - Delete button with confirmation dialog
  - Empty state when no properties saved
- **Data:** Fetch from Firestore where `userId == current user`

### New Components

#### 1. PropertyForm.jsx
**Responsibility:** Collect property investment data from user

**Props:**
- `values` - current form state object
- `onChange` - callback to update parent state
- `errors` - validation errors object

**Sections:**
1. **Property Info**
   - Address (text, required for saving)
   - Bedrooms (number, optional)
   - Bathrooms (number, optional)

2. **Purchase Details**
   - Purchase price ($, required)
   - Closing costs ($ or %, default 3%)
   - Down payment (%, default 20%)

3. **Income**
   - Monthly rent ($, required)

4. **Monthly Expenses**
   - Property tax (annual ÷ 12)
   - Insurance (annual ÷ 12)
   - HOA fees ($)
   - Property management (%, default 10% of rent)
   - Maintenance (%, default 1% of purchase price ÷ 12)
   - Vacancy (%, default 5% of rent)

5. **Financing**
   - Interest rate (%, default 7%)
   - Loan term (years, default 30)

**Behavior:**
- All fields editable
- Real-time validation with inline errors
- Sensible defaults pre-filled
- Responsive layout (single column on mobile)

#### 2. AnalysisResults.jsx
**Responsibility:** Display calculated investment metrics

**Props:**
- `calculations` - object containing all computed metrics

**Cards:**

1. **Monthly Cash Flow**
   - Monthly income (rent)
   - Monthly expenses (sum)
   - Mortgage payment (P&I)
   - **Net monthly cash flow** (bold, color-coded: green if positive, red if negative)

2. **Annual Returns**
   - Annual cash flow (monthly × 12)
   - Total cash invested (down payment + closing costs)
   - **Cash-on-cash return** (annual cash flow / total cash invested) × 100%
   - **Cap rate** (NOI / purchase price) × 100%
     - NOI = annual income - annual expenses (excluding mortgage)

3. **Financing Details**
   - Loan amount (purchase price - down payment)
   - Monthly mortgage payment
   - Total interest over loan term
   - Total paid over loan term

4. **Expense Breakdown**
   - List or visual breakdown showing each expense
   - Percentage of total expenses

**Behavior:**
- Updates live via useMemo when form values change
- Currency formatting ($X,XXX.XX)
- Percentage formatting (X.XX%)
- Loading state if calculations pending

#### 3. PropertyCard.jsx (for MyProperties page)
**Responsibility:** Display summary of a saved property

**Props:**
- `property` - property document from Firestore
- `onEdit` - callback to navigate to edit mode
- `onDelete` - callback to delete property

**Display:**
- Address (title)
- Purchase price
- Monthly cash flow (color-coded)
- Edit button
- Delete button

## Data Model

### Firestore Structure

**Collection:** `properties`

**Document Schema:**
```javascript
{
  // Ownership
  userId: string,              // Firebase Auth UID

  // Property Info
  address: string,             // "123 Main St, City, State"
  bedrooms: number | null,
  bathrooms: number | null,

  // Purchase
  purchasePrice: number,       // 300000
  closingCosts: number,        // 9000 (can be $ or calculated from %)
  downPayment: number,         // 60000 (calculated from %)
  downPaymentPercent: number,  // 20

  // Income
  monthlyRent: number,         // 2500

  // Monthly Expenses
  expenses: {
    propertyTax: number,       // 250 (annual / 12)
    insurance: number,         // 100 (annual / 12)
    hoa: number,              // 0
    management: number,        // 250 (10% of rent)
    managementPercent: number, // 10
    maintenance: number,       // 250 (1% of price / 12)
    maintenancePercent: number,// 1
    vacancy: number,           // 125 (5% of rent)
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

### Firestore Security Rules

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

## Calculation Logic

### Mortgage Payment (Principal & Interest)

Standard amortization formula:
```javascript
M = P[r(1+r)^n] / [(1+r)^n - 1]

Where:
M = Monthly payment
P = Loan amount (purchase price - down payment)
r = Monthly interest rate (annual rate / 12 / 100)
n = Total number of payments (loan term in years × 12)
```

### Monthly Cash Flow
```javascript
Net Monthly Cash Flow = Monthly Rent
                      - Total Monthly Expenses
                      - Mortgage Payment
```

### Cash-on-Cash Return
```javascript
Annual Cash Flow = Net Monthly Cash Flow × 12
Total Cash Invested = Down Payment + Closing Costs
Cash-on-Cash Return = (Annual Cash Flow / Total Cash Invested) × 100%
```

### Cap Rate (Capitalization Rate)
```javascript
Annual NOI = (Monthly Rent × 12) - (Total Monthly Expenses × 12)
// Note: NOI excludes mortgage payment
Cap Rate = (Annual NOI / Purchase Price) × 100%
```

### Total Interest Paid
```javascript
Total Paid = Monthly Payment × Number of Payments
Total Interest = Total Paid - Loan Amount
```

## User Flows

### Create New Property Analysis

1. User navigates to `/analyzer`
2. Form loads with default values
3. User fills in property details
4. Calculations update live as user types
5. User clicks "Save Property"
6. Validation runs:
   - Address required
   - Purchase price > 0
   - Monthly rent > 0
   - All numeric fields valid
7. If valid:
   - Save to Firestore with userId
   - Navigate to `/properties`
8. If invalid:
   - Show inline errors
   - Keep user on page

### Edit Existing Property

1. User on `/properties` page
2. Clicks property card
3. Navigate to `/analyzer?id={propertyId}`
4. DealAnalyzer reads `id` from URL
5. Fetch property from Firestore
6. Pre-fill form with property data
7. User edits values
8. Click "Update Property"
9. Update Firestore document
10. Navigate back to `/properties`

### Delete Property

1. User on `/properties` page
2. Clicks delete button on property card
3. Confirmation dialog: "Are you sure? This cannot be undone."
4. If confirmed:
   - Delete document from Firestore
   - Remove from UI
5. If canceled:
   - Close dialog, no action

## Validation Rules

### Required Fields (for saving)
- Address (string, min 3 characters)
- Purchase price (number > 0)
- Monthly rent (number > 0)

### Numeric Constraints
- All currency fields: number >= 0
- Down payment %: 0-100
- Interest rate %: 0.1-20
- Loan term: 1-50 years
- All percentage fields: 0-100

### Error Messages
- "Address is required"
- "Purchase price must be greater than 0"
- "Monthly rent must be greater than 0"
- "Down payment must be between 0% and 100%"
- "Interest rate must be between 0.1% and 20%"

### Display Behavior
- Inline errors below each field
- Red border on invalid fields
- "Save" button disabled if any validation errors
- Toast notification on successful save

## Error Handling

### Firestore Errors

**Network Error:**
- Show toast: "Connection issue. Please try again."
- Keep form data intact
- Allow retry

**Permission Denied:**
- Show toast: "Please sign in to save properties."
- Redirect to login page

**Document Not Found (edit mode):**
- Show toast: "Property not found. It may have been deleted."
- Redirect to `/properties`

### Loading States

**Saving Property:**
- Disable "Save" button
- Show spinner on button
- Disable form inputs

**Loading Properties List:**
- Show skeleton loaders for property cards
- Show spinner in center if first load

**Fetching Property for Edit:**
- Show spinner in form area
- Disable form until data loads

### Empty States

**No Properties Saved:**
```
🏠 No properties yet
Start analyzing your first deal!
[Create Your First Deal] button → navigate to /analyzer
```

## Routing Updates

Add new routes to App.jsx:
```javascript
<Route path="/analyzer" element={<ProtectedRoute><DealAnalyzer /></ProtectedRoute>} />
<Route path="/properties" element={<ProtectedRoute><MyProperties /></ProtectedRoute>} />
```

Update Dashboard to include navigation links:
- "Analyze New Deal" → `/analyzer`
- "My Properties" → `/properties`

## Testing Strategy

### Unit Tests

**Calculation Functions:**
- `calculateMortgagePayment()`
  - Test standard 30-year loan
  - Test 15-year loan
  - Test edge cases (0% down, high interest rate)
- `calculateCashFlow()`
  - Test positive cash flow
  - Test negative cash flow
- `calculateCashOnCashReturn()`
- `calculateCapRate()`

**Form Validation:**
- Test required fields
- Test numeric constraints
- Test percentage boundaries
- Test error message display

### Component Tests

**PropertyForm:**
- Renders all fields
- Calls onChange on input
- Displays validation errors
- Pre-fills default values

**AnalysisResults:**
- Renders all metric cards
- Formats currency correctly
- Color-codes positive/negative cash flow
- Updates when calculations change

**MyProperties:**
- Displays empty state when no properties
- Renders property cards
- Handles delete confirmation
- Navigates to edit mode on click

### Integration Tests

**Save/Load Flow:**
- Create property → saves to Firestore
- Navigate to properties → fetches user's properties
- Edit property → loads and updates correctly
- Delete property → removes from Firestore

**Use Firestore Emulator for tests** to avoid hitting production database.

## Future Enhancements (Post-MVP)

1. **API Integration**
   - Rentcast API for auto-population
   - Address autocomplete

2. **Additional Property Types**
   - Fix-and-flip calculator
   - Multi-family per-unit analysis

3. **Comparison Features**
   - Side-by-side property comparison
   - Sort/filter properties by ROI, cash flow, etc.

4. **Advanced Calculations**
   - Appreciation projections
   - Tax benefits (depreciation)
   - IRR calculations

5. **Export/Sharing**
   - Export to PDF
   - Share analysis via link

6. **Portfolio Analytics**
   - Total portfolio value
   - Combined cash flow
   - Diversification metrics

## Technical Decisions

### Why Local State for Form?
- Form data is transient until saved
- No need for global state or context
- Keeps DealAnalyzer self-contained

### Why useMemo for Calculations?
- Calculations are derived from form inputs
- Avoid recalculating on every render
- Dependencies: form values

### Why Cards for Metrics?
- Clear visual separation
- Easy to scan
- Responsive (stack on mobile)

### Why Firestore over Local Storage?
- Sync across devices
- Backup in cloud
- User can access from anywhere
- Foundation for future collaboration features

## Open Questions (None - All Resolved)

All design questions were answered during brainstorming session.

## Success Metrics

MVP will be considered successful if:
1. User can input property data and see accurate calculations
2. User can save, edit, and delete properties
3. All calculations match industry-standard formulas
4. Form validation prevents invalid data
5. Responsive design works on mobile and desktop
6. No data loss on save/edit operations

## Implementation Plan

Will be created in next phase using the `superpowers:writing-plans` skill.
