// src/pages/MyProperties.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import PropertyCard from '../components/analyzer/PropertyCard';

export default function MyProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProperties();
  }, [user]);

  const loadProperties = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const q = query(
        collection(db, 'properties'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const propertiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProperties(propertiesData);
    } catch (error) {
      console.error('Error loading properties:', error);
      alert('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (propertyId) => {
    navigate(`/analyzer?id=${propertyId}`);
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm('Are you sure? This cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'properties', propertyId));
      setProperties(properties.filter(p => p.id !== propertyId));
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" role="status"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Properties</h1>
            <p className="text-base-content/70 mt-2">
              View and manage your saved property analyses
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/analyzer')}
          >
            Analyze New Deal
          </button>
        </div>

        {properties.length === 0 ? (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body items-center text-center py-16">
              <div className="text-6xl mb-4">🏠</div>
              <h2 className="card-title text-2xl mb-2">No properties yet</h2>
              <p className="text-base-content/70 mb-6">
                Start analyzing your first deal!
              </p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/analyzer')}
              >
                Create Your First Deal
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
