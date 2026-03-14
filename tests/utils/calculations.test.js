import { describe, it, expect } from 'vitest';
import { calculateMortgagePayment } from '../../src/utils/calculations';

describe('calculateMortgagePayment', () => {
  it('should calculate monthly payment for 30-year loan', () => {
    const loanAmount = 240000; // $300k purchase - $60k down
    const annualRate = 7; // 7%
    const years = 30;

    const payment = calculateMortgagePayment(loanAmount, annualRate, years);

    // Expected: $1,596.73 (standard amortization formula)
    expect(payment).toBeCloseTo(1596.73, 2);
  });

  it('should calculate monthly payment for 15-year loan', () => {
    const loanAmount = 240000;
    const annualRate = 6.5;
    const years = 15;

    const payment = calculateMortgagePayment(loanAmount, annualRate, years);

    // Expected: $2,090.66 (standard amortization formula)
    expect(payment).toBeCloseTo(2090.66, 2);
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
