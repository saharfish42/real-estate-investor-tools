import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../src/contexts/AuthContext';

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
});
