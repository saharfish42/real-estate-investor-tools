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
