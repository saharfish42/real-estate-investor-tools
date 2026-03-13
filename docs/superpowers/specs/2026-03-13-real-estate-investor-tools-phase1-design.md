# Real Estate Investor Tools - Phase 1 Design

**Date:** March 13, 2026
**Author:** Claude (with saharfish42)
**Version:** 1.0
**Status:** Draft

## Executive Summary

A web application for individual real estate investors to analyze potential deals, calculate key investment metrics, and track their property portfolio. Phase 1 focuses on authentication, basic portfolio management, and a comprehensive deal analyzer supporting both rental and flip strategies.

## Project Context

### Target User
Individual real estate investors (house flippers and buy-and-hold rental investors) who need tools to:
- Quickly evaluate if a property deal makes financial sense
- Calculate ROI, cash flow, and other key metrics
- Save and compare multiple property analyses
- Track their investment portfolio over time

### Experience Level
Built for a beginner developer learning full-stack web development with focus on simplicity and clear documentation.

### Project Phases
This design covers **Phase 1** only. Future phases will add:
- Phase 2: ARV checker and rent estimator with API integrations
- Phase 3: Project timeline planner and expense tracking
- Phase 4: Portfolio analytics and mobile app

## Goals & Success Criteria

### Phase 1 Goals
1. User can sign in with Google or GitHub
2. User can add properties with financial details
3. Calculator shows accurate rental and flip analysis metrics
4. Properties are saved and can be viewed/edited/deleted
5. App is deployed and accessible from any browser
6. Free to host and run

### Success Metrics
- User can complete a property analysis in under 3 minutes
- Calculations are accurate (verified against manual spreadsheet)
- App loads in under 2 seconds on standard connection
- Zero cost to operate (within free tier limits)

## Architecture

### Technology Stack

**Frontend:**
- React 18+ with Vite (fast build tool)
- React Router for navigation
- Tailwind CSS for styling
- DaisyUI for UI components (clean, professional look)

**Backend/Services:**
- Firebase Authentication (Google and GitHub providers)
- Cloud Firestore (NoSQL database)
- Firebase Hosting (static site hosting)

**Why Firebase:**
- All-in-one platform (auth, database, hosting)
- Generous free tier perfect for MVP
- Minimal configuration for beginners
- Built-in social authentication
- Excellent documentation and community

### High-Level Architecture

```
┌─────────────────────────────────────────┐
│         React Frontend (Vite)           │
│  - Auth UI (Google/GitHub login)        │
│  - Property Form                        │
│  - Deal Analyzer Calculator             │
│  - Property List/Portfolio View         │
└──────────────┬──────────────────────────┘
               │ Firebase SDK
               ↓
┌──────────────────────────────────────────┐
│          Firebase Services               │
├──────────────────────────────────────────┤
│ • Firebase Auth (Social Login)           │
│ • Firestore Database (Properties)        │
│ • Firebase Hosting (Static Site)         │
└──────────────────────────────────────────┘
```

**Key Architecture Decisions:**
- **No backend functions** - All calculations happen in browser (JavaScript)
- **Direct Firestore access** - Frontend communicates directly with Firestore
- **Client-side routing** - React Router handles navigation
- **Static hosting** - No server needed, just HTML/CSS/JS files

### User Flow

```
1. User visits app → Landing page
2. Click "Sign in with Google/GitHub" → Firebase Auth popup
3. After login → Redirected to Portfolio Dashboard
4. Dashboard shows saved properties (empty on first visit)
5. Click "Add Property" → Property form
6. Fill in property details → Real-time calculations display
7. Click "Save Property" → Stored in Firestore
8. Return to dashboard → See property card with key metrics
9. Click property card → View full details and edit
```

## Component Structure

### Routes

```
/                    → LandingPage (public)
/login               → LoginPage (public)
/dashboard           → Dashboard (protected)
/property/new        → PropertyForm (protected)
/property/:id        → PropertyDetail (protected)
```

### React Component Tree

```
App
├── PublicLayout
│   ├── LandingPage
│   │   ├── Hero section
│   │   ├── Feature highlights
│   │   └── CTA button → /login
│   └── LoginPage
│       ├── Google login button
│       └── GitHub login button
│
└── PrivateLayout (requires authentication)
    ├── Navbar
    │   ├── Logo/Home link
    │   ├── Dashboard link
    │   └── User menu (profile, logout)
    │
    ├── Dashboard
    │   ├── Header ("Your Properties")
    │   ├── "Add Property" button
    │   └── PropertyCard[] (grid of property cards)
    │       ├── Address
    │       ├── Type badge (Rental/Flip)
    │       ├── Key metric (cash flow or profit)
    │       └── Edit/Delete buttons
    │
    ├── PropertyForm
    │   ├── TypeSelector (Rental/Flip toggle)
    │   ├── BasicInfoSection
    │   │   ├── Address input
    │   │   └── Property type dropdown
    │   ├── PurchaseDetailsSection
    │   │   ├── Purchase price
    │   │   ├── Down payment %
    │   │   ├── Interest rate
    │   │   ├── Loan term
    │   │   └── Closing costs
    │   ├── RentalInputsSection (if type=rental)
    │   │   ├── Monthly rent
    │   │   ├── Vacancy rate %
    │   │   ├── Property tax
    │   │   ├── Insurance
    │   │   ├── HOA fees
    │   │   ├── Maintenance
    │   │   └── Property management %
    │   ├── FlipInputsSection (if type=flip)
    │   │   ├── ARV (After Repair Value)
    │   │   ├── Repair costs
    │   │   ├── Holding time (months)
    │   │   ├── Selling costs
    │   │   └── Agent commission %
    │   ├── DealAnalyzer (real-time calculations)
    │   │   ├── Rental metrics panel
    │   │   │   ├── Monthly cash flow
    │   │   │   ├── Cap rate
    │   │   │   ├── Cash-on-cash return
    │   │   │   └── 1% rule indicator
    │   │   └── Flip metrics panel
    │   │       ├── Potential profit
    │   │       ├── ROI %
    │   │       ├── Break-even analysis
    │   │       └── Deal quality indicator
    │   └── Save/Cancel buttons
    │
    └── PropertyDetail
        ├── PropertyHeader (address, type)
        ├── FinancialSummary (all inputs)
        ├── DealMetricsDisplay (calculated results)
        ├── EditButton → PropertyForm
        └── DeleteButton
```

### Key Component Details

**PropertyForm:**
- Most complex component in the app
- Dynamically shows/hides sections based on property type
- Real-time calculations update as user types (debounced)
- Form validation with inline error messages
- Auto-saves draft to localStorage (prevent data loss)

**DealAnalyzer:**
- Pure calculation component (no state)
- Receives inputs as props, returns calculated metrics
- Visual indicators: green (good deal), yellow (marginal), red (avoid)
- Shows formulas in tooltips for transparency

**PropertyCard:**
- Summary view of a property
- Shows most important metric prominently
- Quick actions (edit, delete) on hover
- Color-coded by deal quality

## Data Model

### Firestore Structure

```
users/ (collection)
  {userId}/ (document)
    email: string
    displayName: string
    photoURL: string
    createdAt: timestamp

    properties/ (subcollection)
      {propertyId}/ (document)
        address: string
        createdAt: timestamp
        updatedAt: timestamp
        type: "rental" | "flip"

        purchase: {
          price: number
          downPaymentPercent: number
          interestRate: number
          loanTermYears: number
          closingCosts: number
        }

        rental: {
          monthlyRent: number
          vacancyRate: number
          propertyTax: number
          insurance: number
          hoa: number
          maintenance: number
          propertyManagement: number
        } | null

        flip: {
          arv: number
          repairCosts: number
          holdingTimeMonths: number
          sellingCosts: number
          agentCommission: number
        } | null

        calculated: {
          monthlyPayment: number
          totalInvestment: number
          monthlyCashFlow: number | null
          capRate: number | null
          cashOnCashReturn: number | null
          roi: number | null
          profit: number | null
        }
```

### Data Model Rationale

**Users as top-level collection:**
- Each user document contains their profile info
- Properties are nested as subcollection for automatic isolation
- No need for complex queries across users

**Separate rental and flip objects:**
- Clean separation of concerns
- One will be null based on property type
- Easy to extend with type-specific fields later

**Storing calculated values:**
- Preserves historical analysis if formulas change
- Enables quick dashboard display without recalculating
- Can compare "original analysis" vs "current market"

**All monetary values in USD:**
- Using whole dollars (not cents) for simplicity
- Frontend formats with locale-specific currency display

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }

    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if isOwner(userId);

      match /properties/{propertyId} {
        allow read, write: if isOwner(userId);
      }
    }
  }
}
```

## Calculation Formulas

### Rental Analysis Metrics

**Monthly Mortgage Payment (P&I):**
```
M = P * [r(1+r)^n] / [(1+r)^n - 1]

Where:
M = Monthly payment
P = Principal (loan amount)
r = Monthly interest rate (annual rate / 12)
n = Number of payments (years * 12)
```

**Monthly Cash Flow:**
```
Cash Flow = Monthly Rent - Expenses

Expenses = Mortgage Payment + Property Tax + Insurance + HOA
          + Maintenance + Property Management + Vacancy Reserve

Vacancy Reserve = Monthly Rent * Vacancy Rate
```

**Cap Rate (Capitalization Rate):**
```
Cap Rate = (Net Operating Income / Purchase Price) * 100

NOI = Annual Rent - Annual Expenses (excluding mortgage)
```

**Cash-on-Cash Return:**
```
CoC Return = (Annual Cash Flow / Total Cash Invested) * 100

Total Cash Invested = Down Payment + Closing Costs
Annual Cash Flow = Monthly Cash Flow * 12
```

**1% Rule:**
```
1% Rule = (Monthly Rent / Purchase Price) * 100

Result >= 1% → Meets rule (good deal indicator)
Result < 1% → Doesn't meet rule
```

### Flip Analysis Metrics

**Potential Profit:**
```
Profit = ARV - Total Costs

Total Costs = Purchase Price + Repair Costs + Holding Costs
            + Selling Costs + Agent Commission

Holding Costs = (Mortgage Payment * Holding Months) + (Property Tax * Holding Months / 12)
Agent Commission = ARV * Agent Commission %
```

**Return on Investment (ROI):**
```
ROI = (Profit / Total Investment) * 100

Total Investment = Down Payment + Closing Costs + Repair Costs
```

**Break-Even ARV:**
```
Break-Even ARV = Total Costs / (1 - Agent Commission %)

This shows the minimum ARV needed to not lose money
```

### Deal Quality Indicators

**Rental Properties:**
- Green (Good): Cash flow > $200/month AND CoC > 10%
- Yellow (Marginal): Cash flow > $0 OR CoC > 8%
- Red (Avoid): Negative cash flow AND CoC < 8%

**Flip Properties:**
- Green (Good): ROI > 15% AND Profit > $20,000
- Yellow (Marginal): ROI > 10% OR Profit > $10,000
- Red (Avoid): ROI < 10% AND Profit < $10,000

## Error Handling

### Authentication Errors

| Error | User Experience |
|-------|----------------|
| User cancels login | Show toast: "Login cancelled" |
| Network error | Show toast: "Connection error, please try again" |
| Popup blocked | Show alert with instructions to enable popups |
| Session expired | Auto-redirect to /login with message |

### Database Errors

| Error | User Experience |
|-------|----------------|
| Failed to save | Error toast, keep form data, retry button |
| Failed to load properties | "Unable to load properties" with retry button |
| Permission denied | Redirect to login (assume session expired) |
| Network timeout | Show offline indicator, queue writes for retry |

### Validation Errors

**Required Field Validation:**
- Inline error message appears below field
- Submit button disabled until all required fields valid
- Red border on invalid fields

**Value Validation:**
- Negative numbers → "Must be positive"
- Percentage > 100 → "Must be between 0 and 100"
- Invalid address format → "Please enter a valid address"
- Empty required fields → "This field is required"

### User-Friendly Error Messages

**What we do:**
- Toast notifications auto-dismiss after 3 seconds
- Errors are specific and actionable
- Technical details hidden (shown in console for debugging)
- Never blame the user ("Invalid input" not "You entered invalid input")

**What we avoid:**
- Generic error messages ("Error occurred")
- Technical jargon (HTTP status codes, stack traces)
- Losing user's form data on errors
- Modal dialogs that interrupt flow

### Data Loss Prevention

**Auto-save draft:**
- Save form to localStorage every 5 seconds
- Restore draft on page reload
- Clear draft after successful save
- Warn before leaving page with unsaved changes

## Testing Strategy

### Phase 1 Testing (Manual)

**Authentication Tests:**
- [ ] Sign in with Google works
- [ ] Sign in with GitHub works
- [ ] Sign out clears session
- [ ] Accessing protected route while logged out redirects to login
- [ ] Returning user stays logged in (refresh page)

**Property CRUD Tests:**
- [ ] Add new rental property saves to Firestore
- [ ] Add new flip property saves to Firestore
- [ ] View property shows correct details
- [ ] Edit property updates Firestore
- [ ] Delete property removes from Firestore
- [ ] Dashboard shows all user's properties

**Calculation Tests:**
- [ ] Rental calculations match spreadsheet (verify 3 examples)
- [ ] Flip calculations match spreadsheet (verify 3 examples)
- [ ] Calculations update in real-time as user types
- [ ] Deal quality indicators show correct color
- [ ] Negative cash flow shows in red

**UI/UX Tests:**
- [ ] App is responsive on mobile (375px width)
- [ ] App is responsive on tablet (768px width)
- [ ] Form validation shows inline errors
- [ ] Toast notifications appear and dismiss
- [ ] Loading states show during API calls

**Error Handling Tests:**
- [ ] Invalid form data shows validation errors
- [ ] Network error shows user-friendly message
- [ ] Unsaved changes warning appears before navigation

### Calculation Verification

A spreadsheet will be provided with example properties showing:
- Input values for rental and flip properties
- Expected calculation results
- Step-by-step formula breakdown

Developer will verify the app produces identical results.

### No Automated Tests (For Now)

Automated testing will be added in future phases. For Phase 1:
- Manual testing is sufficient for learning
- Focus on understanding the code, not testing infrastructure
- Automated tests add complexity better suited for later phases

## Deployment

### Firebase Setup

**Required Configuration:**
1. Create Firebase project at console.firebase.google.com
2. Enable Authentication (Google and GitHub providers)
3. Create Firestore database (start in test mode, then apply security rules)
4. Get Firebase config object (API keys, project ID, etc.)

**Environment Variables:**
```
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
```

### Deployment Process

**Local Development:**
```bash
npm install
npm run dev
# App runs at http://localhost:5173
```

**Deploy to Firebase Hosting:**
```bash
npm run build
firebase deploy --only hosting
# App deployed to https://PROJECT-ID.web.app
```

**Free Tier Limits:**
- Authentication: Unlimited
- Firestore: 50,000 reads/day, 20,000 writes/day, 1GB storage
- Hosting: 10GB storage, 360MB/day bandwidth

These limits are sufficient for Phase 1 with dozens of active users.

## Future Considerations (Not Phase 1)

### Phase 2: Property Intelligence
- Integrate free real estate APIs for property data
- ARV estimation using comparable sales
- Rent estimation using market data
- Property valuation history

### Phase 3: Project Management
- Timeline planner with Gantt chart
- Task dependencies and milestones
- Expense tracking (actual vs projected)
- Cash flow projections over time

### Phase 4: Portfolio Analytics
- Portfolio-wide metrics and reporting
- Property comparison views
- Export to PDF/Excel
- Mobile app (React Native)

### Technical Debt to Address Later
- Add automated tests (Jest, React Testing Library)
- Implement proper error logging (Sentry)
- Add analytics (Google Analytics or similar)
- Optimize bundle size (code splitting, lazy loading)
- Add offline support (Progressive Web App)
- Migrate to Firebase Functions for API proxying (hide API keys)

## Open Questions

None at this time. Design is approved and ready for implementation planning.

## Appendix

### Glossary

- **ARV**: After Repair Value - estimated property value after renovations
- **Cap Rate**: Capitalization Rate - measures return on investment property
- **Cash-on-Cash Return**: Annual return on actual cash invested
- **CoC**: Cash-on-Cash (abbreviation)
- **1% Rule**: Monthly rent should be at least 1% of purchase price
- **NOI**: Net Operating Income - income minus expenses (excluding mortgage)
- **ROI**: Return on Investment - profit as percentage of investment

### References

- Firebase Documentation: https://firebase.google.com/docs
- React Documentation: https://react.dev
- Vite Documentation: https://vitejs.dev
- Tailwind CSS: https://tailwindcss.com
- DaisyUI Components: https://daisyui.com
