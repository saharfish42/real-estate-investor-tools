export default function PropertyForm({ values, onChange, errors = {} }) {
  const handleInputChange = (field, value) => {
    onChange({ ...values, [field]: value });
  };

  const handleNestedChange = (parent, field, value) => {
    onChange({
      ...values,
      [parent]: {
        ...values[parent],
        [field]: value
      }
    });
  };

  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Property Details</h2>

      {/* Property Information */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Property Information</h3>
        <div className="form-control mb-3">
          <label htmlFor="address" className="label">
            <span className="label-text">Address *</span>
          </label>
          <input
            id="address"
            type="text"
            className={`input input-bordered w-full ${errors.address ? 'input-error' : ''}`}
            value={values.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="123 Main St, City, State"
          />
          {errors.address && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.address}</span>
            </label>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="form-control">
            <label htmlFor="bedrooms" className="label">
              <span className="label-text">Bedrooms</span>
            </label>
            <input
              id="bedrooms"
              type="number"
              className="input input-bordered w-full"
              value={values.bedrooms}
              onChange={(e) => handleInputChange('bedrooms', e.target.value)}
              placeholder="3"
            />
          </div>
          <div className="form-control">
            <label htmlFor="bathrooms" className="label">
              <span className="label-text">Bathrooms</span>
            </label>
            <input
              id="bathrooms"
              type="number"
              className="input input-bordered w-full"
              value={values.bathrooms}
              onChange={(e) => handleInputChange('bathrooms', e.target.value)}
              placeholder="2"
            />
          </div>
        </div>
      </div>

      {/* Purchase Details */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Purchase Details</h3>

        <div className="form-control mb-3">
          <label htmlFor="purchasePrice" className="label">
            <span className="label-text">Purchase Price *</span>
          </label>
          <input
            id="purchasePrice"
            type="number"
            className={`input input-bordered w-full ${errors.purchasePrice ? 'input-error' : ''}`}
            value={values.purchasePrice}
            onChange={(e) => {
              const parsed = parseFloat(e.target.value);
              handleInputChange('purchasePrice', Number.isNaN(parsed) ? '' : parsed);
            }}
            placeholder="256200"
          />
          {errors.purchasePrice && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.purchasePrice}</span>
            </label>
          )}
        </div>

        <div className="form-control mb-3">
          <label htmlFor="cashDown" className="label">
            <span className="label-text">Cash Down Payment *</span>
          </label>
          <input
            id="cashDown"
            type="number"
            className={`input input-bordered w-full ${errors.cashDown ? 'input-error' : ''}`}
            value={values.cashDown}
            onChange={(e) => {
              const parsed = parseFloat(e.target.value);
              handleInputChange('cashDown', Number.isNaN(parsed) ? '' : parsed);
            }}
            placeholder="44000"
          />
          {errors.cashDown && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.cashDown}</span>
            </label>
          )}
        </div>

        <div className="form-control mb-3">
          <label htmlFor="initialLoan" className="label">
            <span className="label-text">Initial Loan Amount *</span>
          </label>
          <input
            id="initialLoan"
            type="number"
            className={`input input-bordered w-full ${errors.initialLoan ? 'input-error' : ''}`}
            value={values.initialLoan}
            onChange={(e) => {
              const parsed = parseFloat(e.target.value);
              handleInputChange('initialLoan', Number.isNaN(parsed) ? '' : parsed);
            }}
            placeholder="232500"
          />
          {errors.initialLoan && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.initialLoan}</span>
            </label>
          )}
        </div>

        <div className="form-control mb-3">
          <label htmlFor="rehabBudget" className="label">
            <span className="label-text">Rehab Budget (calculated)</span>
          </label>
          <input
            id="rehabBudget"
            type="text"
            className="input input-bordered w-full bg-base-200"
            value={((parseFloat(values.initialLoan) || 0) + (parseFloat(values.cashDown) || 0) - (parseFloat(values.purchasePrice) || 0)).toFixed(0)}
            readOnly
          />
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              Initial Loan + Cash Down - Purchase Price
            </span>
          </label>
        </div>
      </div>

      {/* Income */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Income</h3>
        <div className="form-control mb-3">
          <label htmlFor="monthlyRent" className="label">
            <span className="label-text">Monthly Rent *</span>
          </label>
          <input
            id="monthlyRent"
            type="number"
            className={`input input-bordered w-full ${errors.monthlyRent ? 'input-error' : ''}`}
            value={values.monthlyRent}
            onChange={(e) => {
              const parsed = parseFloat(e.target.value);
              handleInputChange('monthlyRent', Number.isNaN(parsed) ? '' : parsed);
            }}
            placeholder="2500"
          />
          {errors.monthlyRent && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.monthlyRent}</span>
            </label>
          )}
        </div>
      </div>

      {/* Monthly Expenses */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Monthly Expenses</h3>
        <div className="form-control mb-3">
          <label htmlFor="propertyTax" className="label">
            <span className="label-text">Property Tax (annual ÷ 12)</span>
          </label>
          <input
            id="propertyTax"
            type="number"
            className="input input-bordered w-full"
            value={values.expenses.propertyTax}
            onChange={(e) => {
              const parsed = parseFloat(e.target.value);
              handleNestedChange('expenses', 'propertyTax', Number.isNaN(parsed) ? '' : parsed);
            }}
            placeholder="250"
          />
        </div>

        <div className="form-control mb-3">
          <label htmlFor="insurance" className="label">
            <span className="label-text">Insurance (annual ÷ 12)</span>
          </label>
          <input
            id="insurance"
            type="number"
            className="input input-bordered w-full"
            value={values.expenses.insurance}
            onChange={(e) => {
              const parsed = parseFloat(e.target.value);
              handleNestedChange('expenses', 'insurance', Number.isNaN(parsed) ? '' : parsed);
            }}
            placeholder="100"
          />
        </div>

        <div className="form-control mb-3">
          <label htmlFor="hoa" className="label">
            <span className="label-text">HOA Fees</span>
          </label>
          <input
            id="hoa"
            type="number"
            className="input input-bordered w-full"
            value={values.expenses.hoa}
            onChange={(e) => {
              const parsed = parseFloat(e.target.value);
              handleNestedChange('expenses', 'hoa', Number.isNaN(parsed) ? '' : parsed);
            }}
            placeholder="0"
          />
        </div>

        <div className="form-control mb-3">
          <label htmlFor="managementPercent" className="label">
            <span className="label-text">Property Management (%)</span>
          </label>
          <input
            id="managementPercent"
            type="number"
            className="input input-bordered w-full"
            value={values.expenses.managementPercent}
            onChange={(e) => {
              const parsed = parseFloat(e.target.value);
              handleNestedChange('expenses', 'managementPercent', Number.isNaN(parsed) ? '' : parsed);
            }}
            placeholder="10"
          />
        </div>

        <div className="form-control mb-3">
          <label htmlFor="maintenancePercent" className="label">
            <span className="label-text">Maintenance (% of purchase price)</span>
          </label>
          <input
            id="maintenancePercent"
            type="number"
            className="input input-bordered w-full"
            value={values.expenses.maintenancePercent}
            onChange={(e) => {
              const parsed = parseFloat(e.target.value);
              handleNestedChange('expenses', 'maintenancePercent', Number.isNaN(parsed) ? '' : parsed);
            }}
            placeholder="1"
          />
        </div>

        <div className="form-control mb-3">
          <label htmlFor="vacancyPercent" className="label">
            <span className="label-text">Vacancy (%)</span>
          </label>
          <input
            id="vacancyPercent"
            type="number"
            className="input input-bordered w-full"
            value={values.expenses.vacancyPercent}
            onChange={(e) => {
              const parsed = parseFloat(e.target.value);
              handleNestedChange('expenses', 'vacancyPercent', Number.isNaN(parsed) ? '' : parsed);
            }}
            placeholder="5"
          />
        </div>
      </div>

      {/* Financing */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Financing</h3>
        <div className="form-control mb-3">
          <label htmlFor="interestRate" className="label">
            <span className="label-text">Interest Rate (%)</span>
          </label>
          <input
            id="interestRate"
            type="number"
            step="0.1"
            className={`input input-bordered w-full ${errors.interestRate ? 'input-error' : ''}`}
            value={values.financing.interestRate}
            onChange={(e) => {
              const parsed = parseFloat(e.target.value);
              handleNestedChange('financing', 'interestRate', Number.isNaN(parsed) ? '' : parsed);
            }}
            placeholder="7.0"
          />
          {errors.interestRate && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.interestRate}</span>
            </label>
          )}
        </div>

        <div className="form-control mb-3">
          <label htmlFor="loanTerm" className="label">
            <span className="label-text">Loan Term (years)</span>
          </label>
          <input
            id="loanTerm"
            type="number"
            className={`input input-bordered w-full ${errors.loanTerm ? 'input-error' : ''}`}
            value={values.financing.loanTerm}
            onChange={(e) => {
              const parsed = parseInt(e.target.value);
              handleNestedChange('financing', 'loanTerm', Number.isNaN(parsed) ? '' : parsed);
            }}
            placeholder="30"
          />
          {errors.loanTerm && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.loanTerm}</span>
            </label>
          )}
        </div>
      </div>

      {/* Refinance */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Refinance</h3>
        <div className="form-control mb-3">
          <label htmlFor="refinanceLoan" className="label">
            <span className="label-text">Refinance Loan Amount</span>
          </label>
          <input
            id="refinanceLoan"
            type="number"
            className="input input-bordered w-full"
            value={values.refinance.refinanceLoan}
            onChange={(e) => {
              const parsed = parseFloat(e.target.value);
              handleNestedChange('refinance', 'refinanceLoan', Number.isNaN(parsed) ? '' : parsed);
            }}
            placeholder="280000"
          />
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              Optional: Enter if refinancing after initial purchase and rehab
            </span>
          </label>
        </div>

        <div className="form-control mb-3">
          <label htmlFor="cashPulledOut" className="label">
            <span className="label-text">Cash Pulled Out (calculated)</span>
          </label>
          <input
            id="cashPulledOut"
            type="text"
            className="input input-bordered w-full bg-base-200"
            value={
              values.refinance.refinanceLoan
                ? (parseFloat(values.refinance.refinanceLoan) - (parseFloat(values.initialLoan) || 0)).toFixed(0)
                : '0'
            }
            readOnly
          />
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              Refinance Loan - Initial Loan
            </span>
          </label>
        </div>

        <div className="form-control mb-3">
          <label htmlFor="netCashInvested" className="label">
            <span className="label-text">Net Cash Invested (calculated)</span>
          </label>
          <input
            id="netCashInvested"
            type="text"
            className="input input-bordered w-full bg-base-200"
            value={
              values.refinance.refinanceLoan
                ? ((parseFloat(values.cashDown) || 0) - (parseFloat(values.refinance.refinanceLoan) - (parseFloat(values.initialLoan) || 0))).toFixed(0)
                : (parseFloat(values.cashDown) || 0).toFixed(0)
            }
            readOnly
          />
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              Cash Down - Cash Pulled Out
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
