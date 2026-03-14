import { describe, it, expect } from 'vitest';
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
} from '../../src/utils/calculations';

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
