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
