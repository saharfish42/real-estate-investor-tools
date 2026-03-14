import { formatCurrency } from '../../utils/formatters';
import {
  calculateMortgagePayment,
  calculateMonthlyCashFlow
} from '../../utils/calculations';

export default function PropertyCard({ property, onEdit, onDelete }) {
  const {
    id,
    address,
    purchasePrice,
    monthlyRent,
    cashDown,
    downPayment, // Legacy field for backwards compatibility
    initialLoan,
    refinance,
    expenses,
    financing
  } = property;

  // Calculate monthly cash flow for display
  // Use refinance loan if present, otherwise initial loan
  // Fall back to calculated value for legacy properties
  const activeLoan = refinance?.refinanceLoan || initialLoan || (purchasePrice - (cashDown || downPayment || 0));
  const mortgagePayment = calculateMortgagePayment(
    activeLoan,
    financing.interestRate,
    financing.loanTerm
  );

  // Sum only the dollar amount fields, not the percentage fields
  const monthlyExpenses =
    (parseFloat(expenses.propertyTax) || 0) +
    (parseFloat(expenses.insurance) || 0) +
    (parseFloat(expenses.hoa) || 0) +
    (parseFloat(expenses.management) || 0) +
    (parseFloat(expenses.maintenance) || 0) +
    (parseFloat(expenses.vacancy) || 0);

  const cashFlow = calculateMonthlyCashFlow(
    monthlyRent,
    monthlyExpenses,
    mortgagePayment
  );

  const cashFlowColor = cashFlow >= 0 ? 'text-success' : 'text-error';

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
      <div className="card-body">
        <h3 className="card-title text-lg">{address}</h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-base-content/70">Purchase Price:</span>
            <span className="font-semibold">{formatCurrency(purchasePrice)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-base-content/70">Monthly Rent:</span>
            <span className="font-semibold">{formatCurrency(monthlyRent)}</span>
          </div>

          <div className="divider my-1"></div>

          <div className="flex justify-between">
            <span className="font-bold">Monthly Cash Flow:</span>
            <span className={`font-bold ${cashFlowColor}`}>
              {formatCurrency(cashFlow)}
            </span>
          </div>
        </div>

        <div className="card-actions justify-end mt-4">
          <button
            className="btn btn-sm btn-outline"
            onClick={() => onEdit(id)}
          >
            Edit
          </button>
          <button
            className="btn btn-sm btn-outline btn-error"
            onClick={() => onDelete(id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
