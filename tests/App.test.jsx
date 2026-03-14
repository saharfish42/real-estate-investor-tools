import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

// Mock Firebase auth functions
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (auth, callback) => {
    callback(null);
    return vi.fn();
  },
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  GithubAuthProvider: vi.fn(),
  getAuth: vi.fn(),
}));

// Mock Firebase config
vi.mock('../src/config/firebase', () => ({
  auth: {},
  googleProvider: {},
  githubProvider: {},
}));

describe('App Routing', () => {
  it('should render landing page at root path', () => {
    window.history.pushState({}, '', '/');
    render(<App />);

    expect(screen.getByText('Real Estate Investor Tools')).toBeInTheDocument();
    expect(screen.getByText(/Analyze deals, calculate ROI/i)).toBeInTheDocument();
  });

  it('should render login page at /login path', () => {
    window.history.pushState({}, '', '/login');
    render(<App />);

    expect(screen.getByText('Real Estate Investor Tools')).toBeInTheDocument();
    expect(screen.getByText(/Sign in to analyze deals/i)).toBeInTheDocument();
  });

  it('should redirect to login when accessing protected dashboard without auth', () => {
    window.history.pushState({}, '', '/dashboard');
    render(<App />);

    // Should redirect to login page
    expect(screen.getByText(/Sign in to analyze deals/i)).toBeInTheDocument();
  });

  it('should redirect unknown routes to landing page', () => {
    window.history.pushState({}, '', '/unknown-route');
    render(<App />);

    expect(screen.getByText('Real Estate Investor Tools')).toBeInTheDocument();
    expect(screen.getByText(/Analyze deals, calculate ROI/i)).toBeInTheDocument();
  });

  it('should redirect to login when accessing /analyzer without auth', () => {
    window.history.pushState({}, '', '/analyzer');
    render(<App />);

    // Should redirect to login page
    expect(screen.getByText(/Sign in to analyze deals/i)).toBeInTheDocument();
  });

  it('should redirect to login when accessing /properties without auth', () => {
    window.history.pushState({}, '', '/properties');
    render(<App />);

    // Should redirect to login page
    expect(screen.getByText(/Sign in to analyze deals/i)).toBeInTheDocument();
  });
});
