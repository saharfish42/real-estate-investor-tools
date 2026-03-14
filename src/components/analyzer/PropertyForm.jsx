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
            placeholder="300000"
          />
          {errors.purchasePrice && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.purchasePrice}</span>
            </label>
          )}
        </div>

        <div className="form-control mb-3">
          <label htmlFor="closingCosts" className="label">
            <span className="label-text">Closing Costs</span>
          </label>
          <input
            id="closingCosts"
            type="number"
            className="input input-bordered w-full"
            value={values.closingCosts}
            onChange={(e) => {
              const parsed = parseFloat(e.target.value);
              handleInputChange('closingCosts', Number.isNaN(parsed) ? '' : parsed);
            }}
            placeholder="9000 (3% of purchase price)"
          />
        </div>

        <div className="form-control mb-3">
          <label htmlFor="downPaymentPercent" className="label">
            <span className="label-text">Down Payment (%)</span>
          </label>
          <input
            id="downPaymentPercent"
            type="number"
            className={`input input-bordered w-full ${errors.downPaymentPercent ? 'input-error' : ''}`}
            value={values.downPaymentPercent}
            onChange={(e) => {
              const parsed = parseFloat(e.target.value);
              handleInputChange('downPaymentPercent', Number.isNaN(parsed) ? '' : parsed);
            }}
            placeholder="20"
          />
          {errors.downPaymentPercent && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.downPaymentPercent}</span>
            </label>
          )}
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
    </div>
  );
}
