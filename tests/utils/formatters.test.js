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
