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
          <h1 className="text-3xl font-bold mb-2">Your Properties</h1>
          <p className="text-base-content/70">
            Your property portfolio will appear here
          </p>
        </div>

        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <p className="text-lg mb-4">No properties yet</p>
            <Button>Add Your First Property</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
