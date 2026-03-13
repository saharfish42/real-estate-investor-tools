import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../../src/contexts/AuthContext';
import { useAuth } from '../../src/hooks/useAuth';

// Mock Firebase auth functions
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (auth, callback) => {
    // Immediately call the callback with null user
    callback(null);
    // Return unsubscribe function
    return vi.fn();
  },
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  GithubAuthProvider: vi.fn(),
  getAuth: vi.fn(),
}));

// Mock Firebase config
vi.mock('../../src/config/firebase', () => ({
  auth: {},
  googleProvider: {},
  githubProvider: {},
}));

// Test component that uses the hook
function TestComponent() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (user) return <div>User: {user.email}</div>;
  return <div>No user</div>;
}

describe('AuthContext', () => {
  it('should provide auth state to children', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('No user')).toBeInTheDocument();
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    function BadComponent() {
      useAuth(); // This should throw
      return <div>Should not render</div>;
    }

    // Expect the render to throw an error
    expect(() => {
      render(<BadComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');
  });
});
