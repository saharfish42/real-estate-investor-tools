import { formatCurrency } from '../../utils/formatters';

export default function PropertyCard({ property, onEdit, onDelete }) {
  const {
    id,
    address,
    purchasePrice,
    monthlyRent
  } = property;

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
