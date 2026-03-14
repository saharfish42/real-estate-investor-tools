// src/components/analyzer/AnalysisResults.jsx
import { formatCurrency, formatPercent } from '../../utils/formatters';

export default function AnalysisResults({ calculations }) {
  if (!calculations) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Analysis Results</h2>
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <p className="text-base-content/70">Enter property details to see analysis</p>
          </div>
        </div>
      </div>
    );
  }

  const {
    monthlyIncome,
    monthlyExpenses,
    mortgagePayment,
    monthlyCashFlow,
    annualCashFlow,
    totalCashInvested,
    cashOnCashReturn,
    noi,
    capRate,
    loanAmount,
    totalInterest,
    totalPaid,
    purchasePrice,
    cashDown,
    initialLoan,
    rehabBudget,
    cashPulledOut,
    netCashInvested
  } = calculations;

  const cashFlowColor = monthlyCashFlow >= 0 ? 'text-success' : 'text-error';
  const hasRefinance = cashPulledOut > 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analysis Results</h2>

      {/* Investment Summary Card */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title">Investment Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-base-content/70">Purchase Price:</span>
              <span className="font-semibold">{formatCurrency(purchasePrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-content/70">Cash Down:</span>
              <span className="font-semibold">{formatCurrency(cashDown)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-content/70">Initial Loan:</span>
              <span className="font-semibold">{formatCurrency(initialLoan)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-content/70">Rehab Budget:</span>
              <span className="font-semibold">{formatCurrency(rehabBudget)}</span>
            </div>
            {hasRefinance && (
              <>
                <div className="divider my-1"></div>
                <div className="flex justify-between">
                  <span className="text-base-content/70">Refinance Loan:</span>
                  <span className="font-semibold">{formatCurrency(loanAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/70">Cash Pulled Out:</span>
                  <span className="font-semibold">{formatCurrency(cashPulledOut)}</span>
                </div>
                <div className="divider my-1"></div>
                <div className="flex justify-between">
                  <span className="font-bold">Net Cash Invested:</span>
                  <span className="font-bold">{formatCurrency(netCashInvested)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Cash Flow Card */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title">Monthly Cash Flow</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-base-content/70">Monthly Income:</span>
              <span className="font-semibold">{formatCurrency(monthlyIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-content/70">Monthly Expenses:</span>
              <span className="font-semibold">{formatCurrency(monthlyExpenses)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-content/70">Mortgage Payment:</span>
              <span className="font-semibold">{formatCurrency(mortgagePayment)}</span>
            </div>
            <div className="divider my-1"></div>
            <div className="flex justify-between text-lg">
              <span className="font-bold">Net Monthly Cash Flow:</span>
              <span className={`font-bold ${cashFlowColor}`}>
                {formatCurrency(monthlyCashFlow)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Annual Returns Card */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title">Annual Returns</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-base-content/70">Annual Cash Flow:</span>
              <span className={`font-semibold ${cashFlowColor}`}>
                {formatCurrency(annualCashFlow)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-content/70">Total Cash Invested:</span>
              <span className="font-semibold">{formatCurrency(totalCashInvested)}</span>
            </div>
            <div className="divider my-1"></div>
            <div className="flex justify-between">
              <span className="font-bold">Cash-on-Cash Return:</span>
              <span className={`font-bold ${cashFlowColor}`}>
                {formatPercent(cashOnCashReturn)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Cap Rate:</span>
              <span className="font-bold">{formatPercent(capRate)}</span>
            </div>
            <div className="text-sm text-base-content/60 mt-2">
              NOI (Net Operating Income): {formatCurrency(noi)}/year
            </div>
          </div>
        </div>
      </div>

      {/* Financing Details Card */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title">Financing Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-base-content/70">Active Loan Amount:</span>
              <span className="font-semibold">{formatCurrency(loanAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-content/70">Monthly Payment:</span>
              <span className="font-semibold">{formatCurrency(mortgagePayment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-content/70">Total Interest:</span>
              <span className="font-semibold">{formatCurrency(totalInterest)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-content/70">Total Paid:</span>
              <span className="font-semibold">{formatCurrency(totalPaid)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Breakdown Card */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title">Expense Breakdown</h3>
          <div className="space-y-2">
            <div className="text-sm text-base-content/70">
              Monthly expenses total: {formatCurrency(monthlyExpenses)}
            </div>
            <div className="text-sm text-base-content/60">
              (Individual expense breakdown will be calculated from form values)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
