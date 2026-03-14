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
