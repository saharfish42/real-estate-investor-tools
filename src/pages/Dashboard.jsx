import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

export default function Dashboard() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <span className="text-xl font-bold px-4">RE Investor Tools</span>
        </div>
        <div className="flex-none gap-2">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} />
                ) : (
                  <div className="bg-neutral-focus text-neutral-content rounded-full w-10 h-10 flex items-center justify-center">
                    {user?.email?.[0].toUpperCase()}
                  </div>
                )}
              </div>
            </label>
            <ul tabIndex={0} className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52">
              <li className="menu-title">
                <span>{user?.email}</span>
              </li>
              <li>
                <button onClick={handleSignOut}>Logout</button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-base-content/70">
            Welcome to your real estate investment tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Link to="/analyzer" className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body">
              <h2 className="card-title text-2xl">Analyze New Deal</h2>
              <p className="text-base-content/70">
                Calculate ROI, cash flow, and cap rate for potential investment properties
              </p>
              <div className="card-actions justify-end mt-4">
                <Button>Get Started</Button>
              </div>
            </div>
          </Link>

          <Link to="/properties" className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body">
              <h2 className="card-title text-2xl">My Properties</h2>
              <p className="text-base-content/70">
                View and manage your saved property portfolio
              </p>
              <div className="card-actions justify-end mt-4">
                <Button>View Properties</Button>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
