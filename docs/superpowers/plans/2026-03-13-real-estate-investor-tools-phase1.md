# Real Estate Investor Tools - Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web app for real estate investors to analyze deals, calculate investment metrics, and track their property portfolio with Firebase authentication and Firestore database.

**Architecture:** React frontend with Vite, Firebase Auth for Google/GitHub login, Firestore for data persistence, client-side calculations, deployed to Firebase Hosting.

**Tech Stack:** React 18, Vite, Firebase SDK, React Router, Tailwind CSS, DaisyUI

---

## File Structure Overview

This plan will create the following file structure:

```
real-estate-investor-tools/
├── src/
│   ├── main.jsx                          # App entry point
│   ├── App.jsx                           # Root component with routing
│   ├── config/
│   │   └── firebase.js                   # Firebase configuration
│   ├── contexts/
│   │   └── AuthContext.jsx               # Authentication context provider
│   ├── hooks/
│   │   ├── useAuth.js                    # Auth hook
│   │   └── useProperties.js              # Properties CRUD hook
│   ├── utils/
│   │   ├── calculations.js               # Rental/flip calculation formulas
│   │   └── validation.js                 # Form validation utilities
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx                # Navigation bar
│   │   │   ├── PublicLayout.jsx          # Layout for public pages
│   │   │   └── PrivateLayout.jsx         # Layout for authenticated pages
│   │   ├── auth/
│   │   │   └── ProtectedRoute.jsx        # Route guard component
│   │   ├── property/
│   │   │   ├── PropertyCard.jsx          # Property summary card
│   │   │   ├── PropertyForm.jsx          # Add/edit property form
│   │   │   ├── DealAnalyzer.jsx          # Real-time calculations display
│   │   │   └── PropertyDetail.jsx        # Full property view
│   │   └── common/
│   │       ├── Button.jsx                # Reusable button component
│   │       ├── Input.jsx                 # Reusable input component
│   │       └── Toast.jsx                 # Toast notification component
│   ├── pages/
│   │   ├── LandingPage.jsx               # Public homepage
│   │   ├── LoginPage.jsx                 # Login with social auth
│   │   ├── Dashboard.jsx                 # Property portfolio view
│   │   ├── AddProperty.jsx               # Add new property page
│   │   └── ViewProperty.jsx              # View/edit property page
│   └── styles/
│       └── index.css                     # Global styles + Tailwind
├── public/
│   └── _redirects                        # For SPA routing on hosting
├── tests/
│   └── utils/
│       ├── calculations.test.js          # Unit tests for calculations
│       └── validation.test.js            # Unit tests for validation
├── .env.example                          # Example environment variables
├── .gitignore                            # Git ignore file
├── vite.config.js                        # Vite configuration
├── tailwind.config.js                    # Tailwind CSS configuration
├── package.json                          # Dependencies
├── firebase.json                         # Firebase hosting config
├── .firebaserc                           # Firebase project config
└── firestore.rules                       # Firestore security rules
```

**Decomposition Decisions:**
- Calculations separated into pure functions for easy testing
- Auth logic centralized in context + hook pattern
- Properties CRUD in dedicated hook to avoid prop drilling
- Components split by responsibility (layout, auth, property, common)
- Each component file focused on single responsibility
- Shared Navbar component to avoid duplication across pages
- Layout components (PublicLayout, PrivateLayout) for consistent page structure
- PropertyDetail for read-only view before editing

---

## Chunk 1: Project Setup & Configuration

### Task 1: Initialize Project

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `.gitignore`
- Create: `index.html`

- [ ] **Step 1: Initialize Vite React project**

```bash
cd ~/Desktop/real-estate-investor-tools
npm create vite@latest . -- --template react
```

Expected: Vite scaffolds React app in current directory

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install firebase react-router-dom
npm install -D tailwindcss postcss autoprefixer
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm install daisyui
```

Expected: All packages installed successfully

- [ ] **Step 3: Initialize Tailwind CSS**

```bash
npx tailwindcss init -p
```

Expected: Creates `tailwind.config.js` and `postcss.config.js`

- [ ] **Step 4: Verify installation**

```bash
npm run dev
```

Expected: Dev server starts on http://localhost:5173

- [ ] **Step 5: Stop dev server and commit**

```bash
git add .
git commit -m "chore: initialize Vite React project with dependencies"
```

---

### Task 2: Configure Tailwind and DaisyUI

**Files:**
- Modify: `tailwind.config.js`
- Modify: `src/index.css`
- Modify: `src/App.jsx`

- [ ] **Step 1: Configure Tailwind with DaisyUI**

Replace `tailwind.config.js` with:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark"],
  },
}
```

- [ ] **Step 2: Add Tailwind directives to CSS**

Replace `src/index.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles */
body {
  @apply min-h-screen bg-base-200;
}
```

- [ ] **Step 3: Test Tailwind setup**

Replace `src/App.jsx` with:

```jsx
function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Tailwind + DaisyUI Working!</h2>
          <p>If you can see styled components, the setup is correct.</p>
          <div className="card-actions justify-end">
            <button className="btn btn-primary">Test Button</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
```

- [ ] **Step 4: Verify Tailwind styling works**

```bash
npm run dev
```

Expected: See styled card with DaisyUI components in browser

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: configure Tailwind CSS and DaisyUI"
```

---

### Task 3: Setup Firebase Configuration

**Files:**
- Create: `src/config/firebase.js`
- Create: `.env.example`
- Create: `.env.local` (not committed)
- Modify: `.gitignore`

- [ ] **Step 1: Create Firebase project**

Manual step: Go to https://console.firebase.google.com
1. Click "Add project"
2. Name: "real-estate-investor-tools"
3. Disable Google Analytics (not needed for Phase 1)
4. Click "Create project"

- [ ] **Step 2: Register web app in Firebase**

Manual step: In Firebase Console
1. Click the web icon (</>)
2. App nickname: "Real Estate Investor Tools"
3. Don't setup Firebase Hosting yet
4. Click "Register app"
5. Copy the firebaseConfig object

- [ ] **Step 3: Enable authentication providers**

Manual step: In Firebase Console
1. Go to Authentication → Sign-in method
2. Enable "Google" provider
3. Enable "GitHub" provider (requires GitHub OAuth app)
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Create new OAuth App
   - Copy Client ID and Secret to Firebase
4. Click "Save"

- [ ] **Step 4: Create Firestore database**

Manual step: In Firebase Console
1. Go to Firestore Database
2. Click "Create database"
3. Start in "test mode" (we'll add security rules later)
4. Choose location (us-central or closest to you)
5. Click "Enable"

- [ ] **Step 5: Create environment file template**

Create `.env.example`:

```bash
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

- [ ] **Step 6: Create actual environment file**

Create `.env.local` with your actual Firebase config values from Step 2

- [ ] **Step 7: Update gitignore**

Add to `.gitignore`:

```
# Environment variables
.env.local
.env.*.local

# Firebase
.firebase/
```

- [ ] **Step 8: Create Firebase config module**

Create `src/config/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
```

- [ ] **Step 9: Verify Firebase config loads**

Add to `src/App.jsx` temporarily:

```jsx
import { auth } from './config/firebase';

function App() {
  console.log('Firebase Auth:', auth);
  // ... rest of component
}
```

Run `npm run dev` and check console for Firebase object.

- [ ] **Step 10: Remove test code and commit**

Remove the console.log from App.jsx, then:

```bash
git add .
git commit -m "feat: configure Firebase with Auth and Firestore"
```

---

### Task 4: Setup Testing Infrastructure

**Files:**
- Modify: `vite.config.js`
- Modify: `package.json`
- Create: `tests/setup.js`

- [ ] **Step 1: Configure Vitest in vite.config.js**

Replace `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
  },
})
```

- [ ] **Step 2: Create test setup file**

Create `tests/setup.js`:

```javascript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
});
```

- [ ] **Step 3: Add test scripts to package.json**

Add to `scripts` section in `package.json`:

```json
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest --coverage"
```

- [ ] **Step 4: Create a simple test to verify setup**

Create `tests/utils/sample.test.js`:

```javascript
import { describe, it, expect } from 'vitest';

describe('Test Setup', () => {
  it('should run tests', () => {
    expect(true).toBe(true);
  });

  it('should perform basic arithmetic', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run tests to verify setup**

```bash
npm test
```

Expected: 2 tests pass

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "test: setup Vitest testing infrastructure"
```

---

## Chunk 2: Authentication System

### Task 5: Create Auth Context

**Files:**
- Create: `src/contexts/AuthContext.jsx`
- Create: `src/hooks/useAuth.js`

- [ ] **Step 1: Write test for AuthContext**

Create `tests/contexts/AuthContext.test.jsx`:

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../src/contexts/AuthContext';

// Mock Firebase auth
vi.mock('../../src/config/firebase', () => ({
  auth: {
    currentUser: null,
  },
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test AuthContext
```

Expected: FAIL - AuthContext not defined

- [ ] **Step 3: Create AuthContext implementation**

Create `src/contexts/AuthContext.jsx`:

```jsx
import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../config/firebase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signInWithGithub = async () => {
    try {
      await signInWithPopup(auth, githubProvider);
    } catch (error) {
      console.error('Error signing in with GitHub:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithGithub,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test AuthContext
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add authentication context and hook"
```

---

### Task 6: Create Login Page

**Files:**
- Create: `src/pages/LoginPage.jsx`
- Create: `src/components/common/Button.jsx`

- [ ] **Step 1: Create reusable Button component**

Create `src/components/common/Button.jsx`:

```jsx
export default function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled = false,
  className = '',
}) {
  const baseClasses = 'btn';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Create LoginPage component**

Create `src/pages/LoginPage.jsx`:

```jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import { useState } from 'react';

export default function LoginPage() {
  const { signInWithGoogle, signInWithGithub } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Connection error. Please try again.');
      } else {
        setError('Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGithub();
      navigate('/dashboard');
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Popup blocked. Please enable popups for this site.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Connection error. Please try again.');
      } else {
        setError('Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold mb-4">
            Real Estate Investor Tools
          </h2>
          <p className="text-base-content/70 mb-6">
            Sign in to analyze deals and track your portfolio
          </p>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </Button>

            <Button
              onClick={handleGithubSignIn}
              disabled={loading}
              variant="secondary"
              className="w-full"
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  Sign in with GitHub
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Test LoginPage manually**

Update `src/App.jsx` temporarily:

```jsx
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  );
}

export default App;
```

Run `npm run dev` and verify:
- Page renders with styled buttons
- Clicking buttons triggers auth popup (will work once routing is set up)

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add login page with Google and GitHub auth"
```

---

### Task 7: Create Protected Route Component

**Files:**
- Create: `src/components/auth/ProtectedRoute.jsx`

- [ ] **Step 1: Create ProtectedRoute component**

Create `src/components/auth/ProtectedRoute.jsx`:

```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: add protected route component"
```

---

### Task 8: Setup Routing

**Files:**
- Create: `src/pages/LandingPage.jsx`
- Create: `src/pages/Dashboard.jsx`
- Modify: `src/App.jsx`
- Modify: `src/main.jsx`

- [ ] **Step 1: Create placeholder LandingPage**

Create `src/pages/LandingPage.jsx`:

```jsx
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="hero min-h-screen">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Real Estate Investor Tools</h1>
            <p className="py-6">
              Analyze deals, calculate ROI, and track your property portfolio all in one place.
            </p>
            <div className="space-x-4">
              <Link to="/login">
                <Button>Get Started</Button>
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">Deal Analyzer</h3>
                  <p className="text-sm">Calculate ROI, cash flow, and cap rate instantly</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">Portfolio Tracking</h3>
                  <p className="text-sm">Save and compare multiple properties</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">Rental & Flip Analysis</h3>
                  <p className="text-sm">Tools for both buy-and-hold and fix-and-flip strategies</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create placeholder Dashboard**

Create `src/pages/Dashboard.jsx`:

```jsx
import { useAuth } from '../contexts/AuthContext';
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
```

- [ ] **Step 3: Setup routing in App.jsx**

Replace `src/App.jsx`:

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

- [ ] **Step 4: Test routing manually**

```bash
npm run dev
```

Verify:
1. Navigate to http://localhost:5173 → See landing page
2. Click "Get Started" → Navigate to /login
3. Sign in with Google or GitHub → Redirect to /dashboard
4. See dashboard with user info and logout button
5. Click logout → Return to landing page

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: setup routing with landing, login, and dashboard pages"
```

---

### Task 8a: Create Shared Navbar Component

**Files:**
- Create: `src/components/layout/Navbar.jsx`

- [ ] **Step 1: Create reusable Navbar component**

Create `src/components/layout/Navbar.jsx`:

```jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar({ showAddButton = false }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="navbar bg-base-100 shadow-lg">
      <div className="flex-1">
        <span
          className="text-xl font-bold px-4 cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          RE Investor Tools
        </span>
      </div>
      <div className="flex-none gap-2">
        {showAddButton && (
          <button
            className="btn btn-primary"
            onClick={() => navigate('/property/new')}
          >
            Add Property
          </button>
        )}
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
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: create reusable Navbar component"
```

---

### Task 8b: Create PrivateLayout Component

**Files:**
- Create: `src/components/layout/PrivateLayout.jsx`

- [ ] **Step 1: Create PrivateLayout wrapper**

Create `src/components/layout/PrivateLayout.jsx`:

```jsx
import Navbar from './Navbar';

export default function PrivateLayout({ children, showAddButton = false }) {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar showAddButton={showAddButton} />
      <div className="container mx-auto p-8">
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update Dashboard to use PrivateLayout**

Replace content in `src/pages/Dashboard.jsx`:

```jsx
import { useNavigate } from 'react-router-dom';
import { useProperties } from '../hooks/useProperties';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/common/Button';
import PropertyCard from '../components/property/PropertyCard';
import PrivateLayout from '../components/layout/PrivateLayout';

export default function Dashboard() {
  const navigate = useNavigate();
  const { properties, loading, error, deleteProperty } = useProperties();
  const { showToast } = useToast();

  const handleDeleteProperty = async (propertyId) => {
    try {
      await deleteProperty(propertyId);
      showToast('Property deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete property', 'error');
    }
  };

  return (
    <PrivateLayout showAddButton>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Properties</h1>
        <p className="text-base-content/70">
          {properties.length === 0
            ? 'Your property portfolio will appear here'
            : `${properties.length} ${properties.length === 1 ? 'property' : 'properties'} in your portfolio`
          }
        </p>
      </div>

      {error && (
        <div className="alert alert-error mb-8">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : properties.length === 0 ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <p className="text-lg mb-4">No properties yet</p>
            <Button onClick={() => navigate('/property/new')}>
              Add Your First Property
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
            <PropertyCard
              key={property.id}
              property={property}
              onDelete={handleDeleteProperty}
            />
          ))}
        </div>
      )}
    </PrivateLayout>
  );
}
```

- [ ] **Step 3: Test Dashboard with new layout**

```bash
npm run dev
```

Verify navbar appears and Add Property button works

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: create PrivateLayout and refactor Dashboard to use it"
```

---

## Chunk 3: Calculation Utilities

### Task 9: Implement Rental Calculations

**Files:**
- Create: `src/utils/calculations.js`
- Create: `tests/utils/calculations.test.js`

- [ ] **Step 1: Write tests for rental calculations**

Create `tests/utils/calculations.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyPayment,
  calculateRentalMetrics,
  calculateFlipMetrics,
  getDealQuality,
} from '../../src/utils/calculations';

describe('Rental Calculations', () => {
  describe('calculateMonthlyPayment', () => {
    it('should calculate correct monthly payment', () => {
      const principal = 200000;
      const annualRate = 6; // 6%
      const years = 30;

      const payment = calculateMonthlyPayment(principal, annualRate, years);

      // Expected: ~$1,199.10
      expect(payment).toBeCloseTo(1199.10, 2);
    });

    it('should return 0 for zero principal', () => {
      const payment = calculateMonthlyPayment(0, 6, 30);
      expect(payment).toBe(0);
    });

    it('should return principal divided by months for 0% interest', () => {
      const payment = calculateMonthlyPayment(12000, 0, 1);
      expect(payment).toBe(1000); // 12000 / 12 months
    });
  });

  describe('calculateRentalMetrics', () => {
    it('should calculate all rental metrics correctly', () => {
      const inputs = {
        purchasePrice: 250000,
        downPaymentPercent: 20,
        interestRate: 6,
        loanTermYears: 30,
        closingCosts: 5000,
        monthlyRent: 2000,
        vacancyRate: 5,
        propertyTax: 250,
        insurance: 100,
        hoa: 0,
        maintenance: 100,
        propertyManagement: 10, // 10% of rent
      };

      const metrics = calculateRentalMetrics(inputs);

      // Verify structure
      expect(metrics).toHaveProperty('monthlyPayment');
      expect(metrics).toHaveProperty('totalInvestment');
      expect(metrics).toHaveProperty('monthlyCashFlow');
      expect(metrics).toHaveProperty('capRate');
      expect(metrics).toHaveProperty('cashOnCashReturn');
      expect(metrics).toHaveProperty('onePercentRule');

      // Verify calculations
      expect(metrics.monthlyPayment).toBeCloseTo(1199.10, 2);
      expect(metrics.totalInvestment).toBe(55000); // 50k down + 5k closing
      expect(metrics.monthlyCashFlow).toBeCloseTo(150.90, 2);
      expect(metrics.capRate).toBeCloseTo(3.63, 2);
      expect(metrics.cashOnCashReturn).toBeCloseTo(3.29, 2);
      expect(metrics.onePercentRule).toBeCloseTo(0.8, 2);
    });

    it('should handle negative cash flow', () => {
      const inputs = {
        purchasePrice: 300000,
        downPaymentPercent: 20,
        interestRate: 7,
        loanTermYears: 30,
        closingCosts: 5000,
        monthlyRent: 1500,
        vacancyRate: 5,
        propertyTax: 400,
        insurance: 150,
        hoa: 200,
        maintenance: 150,
        propertyManagement: 10,
      };

      const metrics = calculateRentalMetrics(inputs);

      expect(metrics.monthlyCashFlow).toBeLessThan(0);
    });
  });
});

describe('Flip Calculations', () => {
  describe('calculateFlipMetrics', () => {
    it('should calculate all flip metrics correctly', () => {
      const inputs = {
        purchasePrice: 200000,
        downPaymentPercent: 20,
        interestRate: 8,
        loanTermYears: 30,
        closingCosts: 5000,
        arv: 300000,
        repairCosts: 30000,
        holdingTimeMonths: 6,
        sellingCosts: 3000,
        agentCommission: 6, // 6%
        propertyTax: 200,
      };

      const metrics = calculateFlipMetrics(inputs);

      // Verify structure
      expect(metrics).toHaveProperty('totalInvestment');
      expect(metrics).toHaveProperty('totalCosts');
      expect(metrics).toHaveProperty('profit');
      expect(metrics).toHaveProperty('roi');
      expect(metrics).toHaveProperty('breakEvenARV');

      // Verify calculations
      expect(metrics.totalInvestment).toBe(75000); // 40k down + 5k closing + 30k repairs
      expect(metrics.profit).toBeGreaterThan(0);
      expect(metrics.roi).toBeGreaterThan(0);
    });

    it('should handle scenarios with loss', () => {
      const inputs = {
        purchasePrice: 200000,
        downPaymentPercent: 20,
        interestRate: 8,
        loanTermYears: 30,
        closingCosts: 5000,
        arv: 180000, // Lower than purchase price
        repairCosts: 30000,
        holdingTimeMonths: 12,
        sellingCosts: 5000,
        agentCommission: 6,
        propertyTax: 200,
      };

      const metrics = calculateFlipMetrics(inputs);

      expect(metrics.profit).toBeLessThan(0);
      expect(metrics.roi).toBeLessThan(0);
    });
  });
});

describe('Deal Quality Indicators', () => {
  it('should return "good" for strong rental deal', () => {
    const metrics = {
      monthlyCashFlow: 300,
      cashOnCashReturn: 12,
    };

    const quality = getDealQuality('rental', metrics);
    expect(quality).toBe('good');
  });

  it('should return "marginal" for okay rental deal', () => {
    const metrics = {
      monthlyCashFlow: 100,
      cashOnCashReturn: 8.5,
    };

    const quality = getDealQuality('rental', metrics);
    expect(quality).toBe('marginal');
  });

  it('should return "avoid" for poor rental deal', () => {
    const metrics = {
      monthlyCashFlow: -100,
      cashOnCashReturn: 5,
    };

    const quality = getDealQuality('rental', metrics);
    expect(quality).toBe('avoid');
  });

  it('should return "good" for strong flip deal', () => {
    const metrics = {
      profit: 50000,
      roi: 25,
    };

    const quality = getDealQuality('flip', metrics);
    expect(quality).toBe('good');
  });

  it('should return "marginal" for okay flip deal', () => {
    const metrics = {
      profit: 15000,
      roi: 12,
    };

    const quality = getDealQuality('flip', metrics);
    expect(quality).toBe('marginal');
  });

  it('should return "avoid" for poor flip deal', () => {
    const metrics = {
      profit: 5000,
      roi: 8,
    };

    const quality = getDealQuality('flip', metrics);
    expect(quality).toBe('avoid');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test calculations
```

Expected: FAIL - functions not defined

- [ ] **Step 3: Implement calculation functions**

Create `src/utils/calculations.js`:

```javascript
/**
 * Calculate monthly mortgage payment (Principal & Interest)
 * Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculateMonthlyPayment(principal, annualRate, years) {
  if (principal === 0) return 0;
  if (annualRate === 0) return principal / (years * 12);

  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                  (Math.pow(1 + monthlyRate, numPayments) - 1);

  return Math.round(payment * 100) / 100;
}

/**
 * Calculate rental property metrics
 */
export function calculateRentalMetrics(inputs) {
  const {
    purchasePrice,
    downPaymentPercent,
    interestRate,
    loanTermYears,
    closingCosts,
    monthlyRent,
    vacancyRate,
    propertyTax,
    insurance,
    hoa,
    maintenance,
    propertyManagement,
  } = inputs;

  // Calculate loan details
  const downPayment = (purchasePrice * downPaymentPercent) / 100;
  const loanAmount = purchasePrice - downPayment;
  const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanTermYears);

  // Calculate total investment
  const totalInvestment = downPayment + closingCosts;

  // Calculate monthly expenses
  const vacancyReserve = (monthlyRent * vacancyRate) / 100;
  const propertyManagementFee = (monthlyRent * propertyManagement) / 100;
  const totalMonthlyExpenses = monthlyPayment + propertyTax + insurance + hoa +
                               maintenance + propertyManagementFee + vacancyReserve;

  // Calculate monthly cash flow
  const monthlyCashFlow = monthlyRent - totalMonthlyExpenses;

  // Calculate annual metrics
  const annualRent = monthlyRent * 12;
  const annualExpensesWithoutMortgage = (propertyTax + insurance + hoa + maintenance +
                                         propertyManagementFee + vacancyReserve) * 12;
  const netOperatingIncome = annualRent - annualExpensesWithoutMortgage;

  // Calculate cap rate
  const capRate = (netOperatingIncome / purchasePrice) * 100;

  // Calculate cash-on-cash return
  const annualCashFlow = monthlyCashFlow * 12;
  const cashOnCashReturn = (annualCashFlow / totalInvestment) * 100;

  // Calculate 1% rule
  const onePercentRule = (monthlyRent / purchasePrice) * 100;

  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalInvestment,
    monthlyCashFlow: Math.round(monthlyCashFlow * 100) / 100,
    capRate: Math.round(capRate * 100) / 100,
    cashOnCashReturn: Math.round(cashOnCashReturn * 100) / 100,
    onePercentRule: Math.round(onePercentRule * 100) / 100,
  };
}

/**
 * Calculate flip property metrics
 */
export function calculateFlipMetrics(inputs) {
  const {
    purchasePrice,
    downPaymentPercent,
    interestRate,
    loanTermYears,
    closingCosts,
    arv,
    repairCosts,
    holdingTimeMonths,
    sellingCosts,
    agentCommission,
    propertyTax,
  } = inputs;

  // Calculate loan details
  const downPayment = (purchasePrice * downPaymentPercent) / 100;
  const loanAmount = purchasePrice - downPayment;
  const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanTermYears);

  // Calculate total investment (cash out of pocket)
  const totalInvestment = downPayment + closingCosts + repairCosts;

  // Calculate holding costs
  const holdingCosts = (monthlyPayment + propertyTax) * holdingTimeMonths;

  // Calculate selling costs
  const agentCommissionAmount = (arv * agentCommission) / 100;
  const totalSellingCosts = sellingCosts + agentCommissionAmount;

  // Calculate total costs
  const totalCosts = purchasePrice + repairCosts + holdingCosts + totalSellingCosts;

  // Calculate profit
  const profit = arv - totalCosts;

  // Calculate ROI
  const roi = (profit / totalInvestment) * 100;

  // Calculate break-even ARV
  const breakEvenARV = totalCosts / (1 - agentCommission / 100);

  return {
    totalInvestment,
    totalCosts: Math.round(totalCosts),
    profit: Math.round(profit),
    roi: Math.round(roi * 100) / 100,
    breakEvenARV: Math.round(breakEvenARV),
  };
}

/**
 * Determine deal quality based on metrics
 */
export function getDealQuality(type, metrics) {
  if (type === 'rental') {
    const { monthlyCashFlow, cashOnCashReturn } = metrics;

    if (monthlyCashFlow > 200 && cashOnCashReturn > 10) {
      return 'good';
    } else if (monthlyCashFlow > 0 || cashOnCashReturn > 8) {
      return 'marginal';
    } else {
      return 'avoid';
    }
  } else if (type === 'flip') {
    const { profit, roi } = metrics;

    if (profit > 20000 && roi > 15) {
      return 'good';
    } else if (profit > 10000 || roi > 10) {
      return 'marginal';
    } else {
      return 'avoid';
    }
  }

  return 'unknown';
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test calculations
```

Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: implement rental and flip calculation utilities with tests"
```

---

### Task 10: Implement Form Validation

**Files:**
- Create: `src/utils/validation.js`
- Create: `tests/utils/validation.test.js`

- [ ] **Step 1: Write tests for validation**

Create `tests/utils/validation.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import { validatePropertyForm } from '../../src/utils/validation';

describe('Form Validation', () => {
  it('should validate required fields', () => {
    const formData = {
      address: '',
      type: 'rental',
      purchasePrice: 0,
    };

    const errors = validatePropertyForm(formData);

    expect(errors.address).toBe('Address is required');
    expect(errors.purchasePrice).toBe('Purchase price must be greater than 0');
  });

  it('should validate positive numbers', () => {
    const formData = {
      address: '123 Main St',
      type: 'rental',
      purchasePrice: -1000,
      downPaymentPercent: -10,
      interestRate: -5,
    };

    const errors = validatePropertyForm(formData);

    expect(errors.purchasePrice).toBe('Purchase price must be greater than 0');
    expect(errors.downPaymentPercent).toBe('Down payment must be between 0 and 100');
    expect(errors.interestRate).toBe('Interest rate must be between 0 and 30');
  });

  it('should validate percentage ranges', () => {
    const formData = {
      address: '123 Main St',
      type: 'rental',
      purchasePrice: 200000,
      downPaymentPercent: 150,
      vacancyRate: 150,
    };

    const errors = validatePropertyForm(formData);

    expect(errors.downPaymentPercent).toBe('Down payment must be between 0 and 100');
    expect(errors.vacancyRate).toBe('Vacancy rate must be between 0 and 100');
  });

  it('should validate rental-specific fields', () => {
    const formData = {
      address: '123 Main St',
      type: 'rental',
      purchasePrice: 200000,
      downPaymentPercent: 20,
      interestRate: 6,
      loanTermYears: 30,
      monthlyRent: 0,
    };

    const errors = validatePropertyForm(formData);

    expect(errors.monthlyRent).toBe('Monthly rent must be greater than 0');
  });

  it('should validate flip-specific fields', () => {
    const formData = {
      address: '123 Main St',
      type: 'flip',
      purchasePrice: 200000,
      downPaymentPercent: 20,
      interestRate: 6,
      loanTermYears: 30,
      arv: 0,
      repairCosts: -1000,
    };

    const errors = validatePropertyForm(formData);

    expect(errors.arv).toBe('ARV must be greater than 0');
    expect(errors.repairCosts).toBe('Repair costs cannot be negative');
  });

  it('should return empty object for valid rental form', () => {
    const formData = {
      address: '123 Main St',
      type: 'rental',
      purchasePrice: 200000,
      downPaymentPercent: 20,
      interestRate: 6,
      loanTermYears: 30,
      closingCosts: 5000,
      monthlyRent: 2000,
      vacancyRate: 5,
      propertyTax: 200,
      insurance: 100,
      hoa: 0,
      maintenance: 100,
      propertyManagement: 10,
    };

    const errors = validatePropertyForm(formData);

    expect(Object.keys(errors).length).toBe(0);
  });

  it('should return empty object for valid flip form', () => {
    const formData = {
      address: '123 Main St',
      type: 'flip',
      purchasePrice: 200000,
      downPaymentPercent: 20,
      interestRate: 6,
      loanTermYears: 30,
      closingCosts: 5000,
      arv: 300000,
      repairCosts: 30000,
      holdingTimeMonths: 6,
      sellingCosts: 3000,
      agentCommission: 6,
      propertyTax: 200,
    };

    const errors = validatePropertyForm(formData);

    expect(Object.keys(errors).length).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test validation
```

Expected: FAIL - validatePropertyForm not defined

- [ ] **Step 3: Implement validation function**

Create `src/utils/validation.js`:

```javascript
/**
 * Validate property form data
 * Returns object with field names as keys and error messages as values
 */
export function validatePropertyForm(formData) {
  const errors = {};

  // Required fields
  if (!formData.address || formData.address.trim() === '') {
    errors.address = 'Address is required';
  }

  if (!formData.type) {
    errors.type = 'Property type is required';
  }

  // Purchase details validation
  if (!formData.purchasePrice || formData.purchasePrice <= 0) {
    errors.purchasePrice = 'Purchase price must be greater than 0';
  }

  if (formData.downPaymentPercent < 0 || formData.downPaymentPercent > 100) {
    errors.downPaymentPercent = 'Down payment must be between 0 and 100';
  }

  if (formData.interestRate < 0 || formData.interestRate > 30) {
    errors.interestRate = 'Interest rate must be between 0 and 30';
  }

  if (formData.loanTermYears <= 0 || formData.loanTermYears > 50) {
    errors.loanTermYears = 'Loan term must be between 1 and 50 years';
  }

  if (formData.closingCosts < 0) {
    errors.closingCosts = 'Closing costs cannot be negative';
  }

  // Type-specific validation
  if (formData.type === 'rental') {
    if (!formData.monthlyRent || formData.monthlyRent <= 0) {
      errors.monthlyRent = 'Monthly rent must be greater than 0';
    }

    if (formData.vacancyRate < 0 || formData.vacancyRate > 100) {
      errors.vacancyRate = 'Vacancy rate must be between 0 and 100';
    }

    if (formData.propertyTax < 0) {
      errors.propertyTax = 'Property tax cannot be negative';
    }

    if (formData.insurance < 0) {
      errors.insurance = 'Insurance cannot be negative';
    }

    if (formData.hoa < 0) {
      errors.hoa = 'HOA fees cannot be negative';
    }

    if (formData.maintenance < 0) {
      errors.maintenance = 'Maintenance cannot be negative';
    }

    if (formData.propertyManagement < 0 || formData.propertyManagement > 100) {
      errors.propertyManagement = 'Property management must be between 0 and 100';
    }
  } else if (formData.type === 'flip') {
    if (!formData.arv || formData.arv <= 0) {
      errors.arv = 'ARV must be greater than 0';
    }

    if (formData.repairCosts < 0) {
      errors.repairCosts = 'Repair costs cannot be negative';
    }

    if (formData.holdingTimeMonths <= 0 || formData.holdingTimeMonths > 120) {
      errors.holdingTimeMonths = 'Holding time must be between 1 and 120 months';
    }

    if (formData.sellingCosts < 0) {
      errors.sellingCosts = 'Selling costs cannot be negative';
    }

    if (formData.agentCommission < 0 || formData.agentCommission > 100) {
      errors.agentCommission = 'Agent commission must be between 0 and 100';
    }

    if (formData.propertyTax < 0) {
      errors.propertyTax = 'Property tax cannot be negative';
    }
  }

  return errors;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test validation
```

Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: implement form validation with tests"
```

---

## Chunk 4: Property Management & UI Components

### Task 11: Create Firestore Hook for Properties

**Files:**
- Create: `src/hooks/useProperties.js`

- [ ] **Step 1: Create useProperties hook**

Create `src/hooks/useProperties.js`:

```javascript
import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

export function useProperties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch properties
  useEffect(() => {
    if (!user) {
      setProperties([]);
      setLoading(false);
      return;
    }

    const fetchProperties = async () => {
      try {
        setLoading(true);
        const propertiesRef = collection(db, 'users', user.uid, 'properties');
        const q = query(propertiesRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const propertiesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProperties(propertiesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [user]);

  // Add property
  const addProperty = async (propertyData) => {
    if (!user) throw new Error('User must be logged in');

    try {
      const propertiesRef = collection(db, 'users', user.uid, 'properties');
      const docRef = await addDoc(propertiesRef, {
        ...propertyData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const newProperty = {
        id: docRef.id,
        ...propertyData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setProperties(prev => [newProperty, ...prev]);
      return docRef.id;
    } catch (err) {
      console.error('Error adding property:', err);
      throw new Error('Failed to add property');
    }
  };

  // Update property
  const updateProperty = async (propertyId, updates) => {
    if (!user) throw new Error('User must be logged in');

    try {
      const propertyRef = doc(db, 'users', user.uid, 'properties', propertyId);
      await updateDoc(propertyRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      setProperties(prev =>
        prev.map(prop =>
          prop.id === propertyId
            ? { ...prop, ...updates, updatedAt: new Date() }
            : prop
        )
      );
    } catch (err) {
      console.error('Error updating property:', err);
      throw new Error('Failed to update property');
    }
  };

  // Delete property
  const deleteProperty = async (propertyId) => {
    if (!user) throw new Error('User must be logged in');

    try {
      const propertyRef = doc(db, 'users', user.uid, 'properties', propertyId);
      await deleteDoc(propertyRef);

      setProperties(prev => prev.filter(prop => prop.id !== propertyId));
    } catch (err) {
      console.error('Error deleting property:', err);
      throw new Error('Failed to delete property');
    }
  };

  return {
    properties,
    loading,
    error,
    addProperty,
    updateProperty,
    deleteProperty,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: add useProperties hook for Firestore CRUD operations"
```

---

### Task 12: Create Common Input Component

**Files:**
- Create: `src/components/common/Input.jsx`

- [ ] **Step 1: Create Input component**

Create `src/components/common/Input.jsx`:

```jsx
export default function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  min,
  max,
  step,
  prefix,
  suffix,
  className = '',
}) {
  return (
    <div className={`form-control w-full ${className}`}>
      {label && (
        <label className="label">
          <span className="label-text">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </span>
        </label>
      )}

      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-3 text-base-content/50">
            {prefix}
          </span>
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={`input input-bordered w-full ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-12' : ''} ${
            error ? 'input-error' : ''
          }`}
        />

        {suffix && (
          <span className="absolute right-3 top-3 text-base-content/50">
            {suffix}
          </span>
        )}
      </div>

      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: create reusable Input component with validation support"
```

---

### Task 13: Create Toast Notification Component

**Files:**
- Create: `src/components/common/Toast.jsx`
- Create: `src/contexts/ToastContext.jsx`

- [ ] **Step 1: Create Toast component**

Create `src/components/common/Toast.jsx`:

```jsx
import { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeClasses = {
    success: 'alert-success',
    error: 'alert-error',
    warning: 'alert-warning',
    info: 'alert-info',
  };

  return (
    <div className="toast toast-top toast-end z-50">
      <div className={`alert ${typeClasses[type]} shadow-lg`}>
        <span>{message}</span>
        <button onClick={onClose} className="btn btn-sm btn-ghost">
          ✕
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create Toast context**

Create `src/contexts/ToastContext.jsx`:

```jsx
import { createContext, useContext, useState } from 'react';
import Toast from '../components/common/Toast';

const ToastContext = createContext({});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const hideToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
```

- [ ] **Step 3: Add ToastProvider to App**

Modify `src/App.jsx` to wrap with ToastProvider:

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add toast notification system with context"
```

---

## Chunk 5: Property Form & Deal Analyzer

### Task 14: Create DealAnalyzer Component

**Files:**
- Create: `src/components/property/DealAnalyzer.jsx`

- [ ] **Step 1: Create DealAnalyzer component**

Create `src/components/property/DealAnalyzer.jsx`:

```jsx
import { useMemo } from 'react';
import { calculateRentalMetrics, calculateFlipMetrics, getDealQuality } from '../../utils/calculations';

export default function DealAnalyzer({ formData, type }) {
  const metrics = useMemo(() => {
    if (type === 'rental') {
      return calculateRentalMetrics(formData);
    } else if (type === 'flip') {
      return calculateFlipMetrics(formData);
    }
    return null;
  }, [formData, type]);

  if (!metrics) return null;

  const quality = getDealQuality(type, metrics);
  const qualityConfig = {
    good: { color: 'success', text: 'Good Deal', icon: '✓' },
    marginal: { color: 'warning', text: 'Marginal', icon: '⚠' },
    avoid: { color: 'error', text: 'Avoid', icon: '✕' },
  };

  const { color, text, icon } = qualityConfig[quality] || {};

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h3 className="card-title">
          Deal Analysis
          {quality && (
            <span className={`badge badge-${color} ml-2`}>
              {icon} {text}
            </span>
          )}
        </h3>

        {type === 'rental' && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Monthly Payment</div>
              <div className="stat-value text-2xl">
                ${metrics.monthlyPayment.toLocaleString()}
              </div>
            </div>

            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Total Investment</div>
              <div className="stat-value text-2xl">
                ${metrics.totalInvestment.toLocaleString()}
              </div>
            </div>

            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Monthly Cash Flow</div>
              <div className={`stat-value text-2xl ${
                metrics.monthlyCashFlow >= 0 ? 'text-success' : 'text-error'
              }`}>
                ${metrics.monthlyCashFlow.toLocaleString()}
              </div>
            </div>

            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Cap Rate</div>
              <div className="stat-value text-2xl">
                {metrics.capRate.toFixed(2)}%
              </div>
            </div>

            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Cash-on-Cash Return</div>
              <div className="stat-value text-2xl">
                {metrics.cashOnCashReturn.toFixed(2)}%
              </div>
            </div>

            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">1% Rule</div>
              <div className={`stat-value text-2xl ${
                metrics.onePercentRule >= 1 ? 'text-success' : 'text-warning'
              }`}>
                {metrics.onePercentRule.toFixed(2)}%
              </div>
              <div className="stat-desc">
                {metrics.onePercentRule >= 1 ? 'Meets rule' : 'Below rule'}
              </div>
            </div>
          </div>
        )}

        {type === 'flip' && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Total Investment</div>
              <div className="stat-value text-2xl">
                ${metrics.totalInvestment.toLocaleString()}
              </div>
            </div>

            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Total Costs</div>
              <div className="stat-value text-2xl">
                ${metrics.totalCosts.toLocaleString()}
              </div>
            </div>

            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Potential Profit</div>
              <div className={`stat-value text-2xl ${
                metrics.profit >= 0 ? 'text-success' : 'text-error'
              }`}>
                ${metrics.profit.toLocaleString()}
              </div>
            </div>

            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">ROI</div>
              <div className={`stat-value text-2xl ${
                metrics.roi >= 0 ? 'text-success' : 'text-error'
              }`}>
                {metrics.roi.toFixed(2)}%
              </div>
            </div>

            <div className="stat bg-base-200 rounded-lg p-4 col-span-2">
              <div className="stat-title">Break-Even ARV</div>
              <div className="stat-value text-2xl">
                ${metrics.breakEvenARV.toLocaleString()}
              </div>
              <div className="stat-desc">
                Minimum ARV to avoid loss
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: create DealAnalyzer component for real-time calculations"
```

---

### Task 15: Create Property Form (Part 1 - Structure)

**Files:**
- Create: `src/components/property/PropertyForm.jsx`

- [ ] **Step 1: Create PropertyForm component with basic structure**

Create `src/components/property/PropertyForm.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import DealAnalyzer from './DealAnalyzer';
import { validatePropertyForm } from '../../utils/validation';
import { calculateRentalMetrics, calculateFlipMetrics } from '../../utils/calculations';
import { useProperties } from '../../hooks/useProperties';
import { useToast } from '../../contexts/ToastContext';

const INITIAL_FORM_DATA = {
  address: '',
  type: 'rental',
  purchasePrice: '',
  downPaymentPercent: 20,
  interestRate: 6,
  loanTermYears: 30,
  closingCosts: '',
  // Rental fields
  monthlyRent: '',
  vacancyRate: 5,
  propertyTax: '',
  insurance: '',
  hoa: 0,
  maintenance: '',
  propertyManagement: 10,
  // Flip fields
  arv: '',
  repairCosts: '',
  holdingTimeMonths: 6,
  sellingCosts: '',
  agentCommission: 6,
};

export default function PropertyForm({ initialData = null, propertyId = null }) {
  const navigate = useNavigate();
  const { addProperty, updateProperty } = useProperties();
  const { showToast } = useToast();
  const [formData, setFormData] = useState(initialData || INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Load from localStorage on mount (draft recovery)
  useEffect(() => {
    if (!initialData) {
      const draft = localStorage.getItem('propertyFormDraft');
      if (draft) {
        try {
          setFormData(JSON.parse(draft));
        } catch (e) {
          console.error('Failed to parse draft:', e);
        }
      }
    }
  }, [initialData]);

  // Save to localStorage (debounced)
  useEffect(() => {
    if (!propertyId) {
      const timer = setTimeout(() => {
        localStorage.setItem('propertyFormDraft', JSON.stringify(formData));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData, propertyId]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const processedValue = type === 'number' ? parseFloat(value) || '' : value;

    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleTypeChange = (newType) => {
    setFormData(prev => ({
      ...prev,
      type: newType,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validatePropertyForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast('Please fix the errors before submitting', 'error');
      return;
    }

    setLoading(true);

    try {
      // Calculate metrics to save with property
      const calculated = formData.type === 'rental'
        ? calculateRentalMetrics(formData)
        : calculateFlipMetrics(formData);

      const propertyData = {
        ...formData,
        calculated,
      };

      if (propertyId) {
        await updateProperty(propertyId, propertyData);
        showToast('Property updated successfully', 'success');
      } else {
        await addProperty(propertyData);
        showToast('Property added successfully', 'success');
        localStorage.removeItem('propertyFormDraft');
      }

      navigate('/dashboard');
    } catch (error) {
      showToast(error.message || 'Failed to save property', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type Selector */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">Property Type</h3>
          <div className="btn-group">
            <button
              type="button"
              className={`btn ${formData.type === 'rental' ? 'btn-active' : ''}`}
              onClick={() => handleTypeChange('rental')}
            >
              Rental Analysis
            </button>
            <button
              type="button"
              className={`btn ${formData.type === 'flip' ? 'btn-active' : ''}`}
              onClick={() => handleTypeChange('flip')}
            >
              Flip Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">Basic Information</h3>
          <Input
            label="Property Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            error={errors.address}
            placeholder="123 Main St, City, State ZIP"
            required
          />
        </div>
      </div>

      {/* Purchase Details */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">Purchase Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Purchase Price"
              type="number"
              name="purchasePrice"
              value={formData.purchasePrice}
              onChange={handleChange}
              error={errors.purchasePrice}
              prefix="$"
              required
            />
            <Input
              label="Down Payment"
              type="number"
              name="downPaymentPercent"
              value={formData.downPaymentPercent}
              onChange={handleChange}
              error={errors.downPaymentPercent}
              suffix="%"
              required
            />
            <Input
              label="Interest Rate"
              type="number"
              name="interestRate"
              value={formData.interestRate}
              onChange={handleChange}
              error={errors.interestRate}
              suffix="%"
              step="0.1"
              required
            />
            <Input
              label="Loan Term"
              type="number"
              name="loanTermYears"
              value={formData.loanTermYears}
              onChange={handleChange}
              error={errors.loanTermYears}
              suffix="years"
              required
            />
            <Input
              label="Closing Costs"
              type="number"
              name="closingCosts"
              value={formData.closingCosts}
              onChange={handleChange}
              error={errors.closingCosts}
              prefix="$"
            />
          </div>
        </div>
      </div>

      {/* Rental-specific fields */}
      {formData.type === 'rental' && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Rental Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Monthly Rent"
                type="number"
                name="monthlyRent"
                value={formData.monthlyRent}
                onChange={handleChange}
                error={errors.monthlyRent}
                prefix="$"
                required
              />
              <Input
                label="Vacancy Rate"
                type="number"
                name="vacancyRate"
                value={formData.vacancyRate}
                onChange={handleChange}
                error={errors.vacancyRate}
                suffix="%"
                required
              />
              <Input
                label="Property Tax (Monthly)"
                type="number"
                name="propertyTax"
                value={formData.propertyTax}
                onChange={handleChange}
                error={errors.propertyTax}
                prefix="$"
                required
              />
              <Input
                label="Insurance (Monthly)"
                type="number"
                name="insurance"
                value={formData.insurance}
                onChange={handleChange}
                error={errors.insurance}
                prefix="$"
                required
              />
              <Input
                label="HOA Fees (Monthly)"
                type="number"
                name="hoa"
                value={formData.hoa}
                onChange={handleChange}
                error={errors.hoa}
                prefix="$"
              />
              <Input
                label="Maintenance (Monthly)"
                type="number"
                name="maintenance"
                value={formData.maintenance}
                onChange={handleChange}
                error={errors.maintenance}
                prefix="$"
                required
              />
              <Input
                label="Property Management"
                type="number"
                name="propertyManagement"
                value={formData.propertyManagement}
                onChange={handleChange}
                error={errors.propertyManagement}
                suffix="%"
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Flip-specific fields */}
      {formData.type === 'flip' && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Flip Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="After Repair Value (ARV)"
                type="number"
                name="arv"
                value={formData.arv}
                onChange={handleChange}
                error={errors.arv}
                prefix="$"
                required
              />
              <Input
                label="Repair Costs"
                type="number"
                name="repairCosts"
                value={formData.repairCosts}
                onChange={handleChange}
                error={errors.repairCosts}
                prefix="$"
                required
              />
              <Input
                label="Holding Time"
                type="number"
                name="holdingTimeMonths"
                value={formData.holdingTimeMonths}
                onChange={handleChange}
                error={errors.holdingTimeMonths}
                suffix="months"
                required
              />
              <Input
                label="Selling Costs"
                type="number"
                name="sellingCosts"
                value={formData.sellingCosts}
                onChange={handleChange}
                error={errors.sellingCosts}
                prefix="$"
                required
              />
              <Input
                label="Agent Commission"
                type="number"
                name="agentCommission"
                value={formData.agentCommission}
                onChange={handleChange}
                error={errors.agentCommission}
                suffix="%"
                required
              />
              <Input
                label="Property Tax (Monthly)"
                type="number"
                name="propertyTax"
                value={formData.propertyTax}
                onChange={handleChange}
                error={errors.propertyTax}
                prefix="$"
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Deal Analyzer */}
      {formData.purchasePrice && (
        <DealAnalyzer formData={formData} type={formData.type} />
      )}

      {/* Form Actions */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="loading loading-spinner"></span>
              Saving...
            </>
          ) : (
            propertyId ? 'Update Property' : 'Save Property'
          )}
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: create PropertyForm component with validation and calculations"
```

---

## Chunk 6: Dashboard & Property Views

### Task 16: Create PropertyCard Component

**Files:**
- Create: `src/components/property/PropertyCard.jsx`

- [ ] **Step 1: Create PropertyCard component**

Create `src/components/property/PropertyCard.jsx`:

```jsx
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import { getDealQuality } from '../../utils/calculations';

export default function PropertyCard({ property, onDelete }) {
  const navigate = useNavigate();
  const quality = getDealQuality(property.type, property.calculated);

  const qualityConfig = {
    good: { badge: 'success', text: 'Good Deal' },
    marginal: { badge: 'warning', text: 'Marginal' },
    avoid: { badge: 'error', text: 'Avoid' },
  };

  const { badge, text } = qualityConfig[quality] || {};

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this property?')) {
      await onDelete(property.id);
    }
  };

  return (
    <div
      className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
      onClick={() => navigate(`/property/${property.id}`)}
    >
      <div className="card-body">
        <div className="flex justify-between items-start">
          <h3 className="card-title">{property.address}</h3>
          {quality && (
            <span className={`badge badge-${badge}`}>{text}</span>
          )}
        </div>

        <div className="space-y-2 mt-4">
          <div className="flex justify-between">
            <span className="text-base-content/70">Type:</span>
            <span className="font-semibold capitalize">{property.type}</span>
          </div>

          {property.type === 'rental' && property.calculated && (
            <>
              <div className="flex justify-between">
                <span className="text-base-content/70">Monthly Cash Flow:</span>
                <span className={`font-semibold ${
                  property.calculated.monthlyCashFlow >= 0 ? 'text-success' : 'text-error'
                }`}>
                  ${property.calculated.monthlyCashFlow?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">CoC Return:</span>
                <span className="font-semibold">
                  {property.calculated.cashOnCashReturn?.toFixed(2)}%
                </span>
              </div>
            </>
          )}

          {property.type === 'flip' && property.calculated && (
            <>
              <div className="flex justify-between">
                <span className="text-base-content/70">Potential Profit:</span>
                <span className={`font-semibold ${
                  property.calculated.profit >= 0 ? 'text-success' : 'text-error'
                }`}>
                  ${property.calculated.profit?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">ROI:</span>
                <span className="font-semibold">
                  {property.calculated.roi?.toFixed(2)}%
                </span>
              </div>
            </>
          )}
        </div>

        <div className="card-actions justify-end mt-4">
          <Button
            variant="ghost"
            onClick={handleDelete}
            className="btn-sm"
          >
            Delete
          </Button>
          <Button
            onClick={() => navigate(`/property/${property.id}`)}
            className="btn-sm"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: create PropertyCard component for portfolio display"
```

---

### Task 17: Add Property Loading to Dashboard

**Files:**
- Modify: `src/pages/Dashboard.jsx`

- [ ] **Step 1: Add property loading and display to Dashboard**

Update `src/pages/Dashboard.jsx` to add property management:

```jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProperties } from '../hooks/useProperties';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/common/Button';
import PropertyCard from '../components/property/PropertyCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { properties, loading, error, deleteProperty } = useProperties();
  const { showToast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    try {
      await deleteProperty(propertyId);
      showToast('Property deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete property', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <span className="text-xl font-bold px-4">RE Investor Tools</span>
        </div>
        <div className="flex-none gap-2">
          <Button onClick={() => navigate('/property/new')}>
            Add Property
          </Button>
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

      {/* Main Content */}
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Properties</h1>
          <p className="text-base-content/70">
            {properties.length === 0
              ? 'Your property portfolio will appear here'
              : `${properties.length} ${properties.length === 1 ? 'property' : 'properties'} in your portfolio`
            }
          </p>
        </div>

        {error && (
          <div className="alert alert-error mb-8">
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : properties.length === 0 ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <p className="text-lg mb-4">No properties yet</p>
              <Button onClick={() => navigate('/property/new')}>
                Add Your First Property
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                onDelete={handleDeleteProperty}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Test dashboard manually**

```bash
npm run dev
```

Verify:
- Dashboard shows loading state initially
- Empty state when no properties
- Properties display in grid after adding some
- Delete confirmation works

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: update dashboard to display property portfolio"
```

---

### Task 18: Create Add Property Page

**Files:**
- Create: `src/pages/AddProperty.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create AddProperty page**

Create `src/pages/AddProperty.jsx`:

```jsx
import PropertyForm from '../components/property/PropertyForm';
import PrivateLayout from '../components/layout/PrivateLayout';

export default function AddProperty() {
  return (
    <PrivateLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Add New Property</h1>
          <p className="text-base-content/70">
            Enter property details to analyze the deal
          </p>
        </div>

        <PropertyForm />
      </div>
    </PrivateLayout>
  );
}
```

- [ ] **Step 2: Add route to App.jsx**

Modify `src/App.jsx` to add the new route:

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AddProperty from './pages/AddProperty';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/property/new"
              element={
                <ProtectedRoute>
                  <AddProperty />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
```

- [ ] **Step 3: Test add property flow**

```bash
npm run dev
```

Verify:
1. Click "Add Property" from dashboard
2. Form renders with all fields
3. Real-time calculations update as you type
4. Form validation works
5. Saving property works and redirects to dashboard

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add property creation page with form"
```

---

### Task 19: Create PropertyDetail Component

**Files:**
- Create: `src/components/property/PropertyDetail.jsx`

- [ ] **Step 1: Create PropertyDetail component**

Create `src/components/property/PropertyDetail.jsx`:

```jsx
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import { getDealQuality } from '../../utils/calculations';
import { useToast } from '../../contexts/ToastContext';

export default function PropertyDetail({ property, onDelete }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const quality = getDealQuality(property.type, property.calculated);

  const qualityConfig = {
    good: { badge: 'success', text: 'Good Deal', icon: '✓' },
    marginal: { badge: 'warning', text: 'Marginal', icon: '⚠' },
    avoid: { badge: 'error', text: 'Avoid', icon: '✕' },
  };

  const { badge, text, icon } = qualityConfig[quality] || {};

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this property?')) {
      try {
        await onDelete(property.id);
        showToast('Property deleted successfully', 'success');
        navigate('/dashboard');
      } catch (error) {
        showToast('Failed to delete property', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="card-title text-2xl">{property.address}</h2>
              <p className="text-base-content/70 capitalize">{property.type} Property</p>
            </div>
            {quality && (
              <span className={`badge badge-${badge} badge-lg`}>
                {icon} {text}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Purchase Details */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">Purchase Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-base-content/70">Purchase Price</p>
              <p className="font-semibold">${property.purchasePrice?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-base-content/70">Down Payment</p>
              <p className="font-semibold">{property.downPaymentPercent}%</p>
            </div>
            <div>
              <p className="text-base-content/70">Interest Rate</p>
              <p className="font-semibold">{property.interestRate}%</p>
            </div>
            <div>
              <p className="text-base-content/70">Loan Term</p>
              <p className="font-semibold">{property.loanTermYears} years</p>
            </div>
            {property.closingCosts > 0 && (
              <div>
                <p className="text-base-content/70">Closing Costs</p>
                <p className="font-semibold">${property.closingCosts?.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Type-specific details */}
      {property.type === 'rental' && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Rental Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-base-content/70">Monthly Rent</p>
                <p className="font-semibold">${property.monthlyRent?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-base-content/70">Vacancy Rate</p>
                <p className="font-semibold">{property.vacancyRate}%</p>
              </div>
              <div>
                <p className="text-base-content/70">Property Tax</p>
                <p className="font-semibold">${property.propertyTax?.toLocaleString()}/mo</p>
              </div>
              <div>
                <p className="text-base-content/70">Insurance</p>
                <p className="font-semibold">${property.insurance?.toLocaleString()}/mo</p>
              </div>
              {property.hoa > 0 && (
                <div>
                  <p className="text-base-content/70">HOA Fees</p>
                  <p className="font-semibold">${property.hoa?.toLocaleString()}/mo</p>
                </div>
              )}
              <div>
                <p className="text-base-content/70">Maintenance</p>
                <p className="font-semibold">${property.maintenance?.toLocaleString()}/mo</p>
              </div>
              <div>
                <p className="text-base-content/70">Property Management</p>
                <p className="font-semibold">{property.propertyManagement}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {property.type === 'flip' && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Flip Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-base-content/70">After Repair Value (ARV)</p>
                <p className="font-semibold">${property.arv?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-base-content/70">Repair Costs</p>
                <p className="font-semibold">${property.repairCosts?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-base-content/70">Holding Time</p>
                <p className="font-semibold">{property.holdingTimeMonths} months</p>
              </div>
              <div>
                <p className="text-base-content/70">Selling Costs</p>
                <p className="font-semibold">${property.sellingCosts?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-base-content/70">Agent Commission</p>
                <p className="font-semibold">{property.agentCommission}%</p>
              </div>
              <div>
                <p className="text-base-content/70">Property Tax</p>
                <p className="font-semibold">${property.propertyTax?.toLocaleString()}/mo</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deal Metrics */}
      {property.calculated && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Deal Metrics</h3>
            {property.type === 'rental' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title">Monthly Payment</div>
                  <div className="stat-value text-2xl">
                    ${property.calculated.monthlyPayment?.toLocaleString()}
                  </div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title">Monthly Cash Flow</div>
                  <div className={`stat-value text-2xl ${
                    property.calculated.monthlyCashFlow >= 0 ? 'text-success' : 'text-error'
                  }`}>
                    ${property.calculated.monthlyCashFlow?.toLocaleString()}
                  </div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title">Cap Rate</div>
                  <div className="stat-value text-2xl">
                    {property.calculated.capRate?.toFixed(2)}%
                  </div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title">Cash-on-Cash Return</div>
                  <div className="stat-value text-2xl">
                    {property.calculated.cashOnCashReturn?.toFixed(2)}%
                  </div>
                </div>
              </div>
            )}
            {property.type === 'flip' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title">Total Investment</div>
                  <div className="stat-value text-2xl">
                    ${property.calculated.totalInvestment?.toLocaleString()}
                  </div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title">Potential Profit</div>
                  <div className={`stat-value text-2xl ${
                    property.calculated.profit >= 0 ? 'text-success' : 'text-error'
                  }`}>
                    ${property.calculated.profit?.toLocaleString()}
                  </div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title">ROI</div>
                  <div className={`stat-value text-2xl ${
                    property.calculated.roi >= 0 ? 'text-success' : 'text-error'
                  }`}>
                    {property.calculated.roi?.toFixed(2)}%
                  </div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-4">
                  <div className="stat-title">Break-Even ARV</div>
                  <div className="stat-value text-2xl">
                    ${property.calculated.breakEvenARV?.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <Button variant="ghost" onClick={handleDelete}>
          Delete Property
        </Button>
        <Button onClick={() => navigate(`/property/${property.id}/edit`)}>
          Edit Property
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: create PropertyDetail component for read-only view"
```

---

### Task 20: Create View/Edit Property Page

**Files:**
- Create: `src/pages/ViewProperty.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create ViewProperty page with read-only view**

Create `src/pages/ViewProperty.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useProperties } from '../hooks/useProperties';
import PropertyDetail from '../components/property/PropertyDetail';
import PropertyForm from '../components/property/PropertyForm';
import PrivateLayout from '../components/layout/PrivateLayout';

export default function ViewProperty() {
  const { id, mode } = useParams(); // mode can be undefined (view) or 'edit'
  const navigate = useNavigate();
  const { user } = useAuth();
  const { deleteProperty } = useProperties();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isEditMode = mode === 'edit';

  useEffect(() => {
    const fetchProperty = async () => {
      if (!user || !id) return;

      try {
        const propertyRef = doc(db, 'users', user.uid, 'properties', id);
        const propertyDoc = await getDoc(propertyRef);

        if (propertyDoc.exists()) {
          setProperty({ id: propertyDoc.id, ...propertyDoc.data() });
        } else {
          setError('Property not found');
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [user, id]);

  if (loading) {
    return (
      <PrivateLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </PrivateLayout>
    );
  }

  if (error || !property) {
    return (
      <PrivateLayout>
        <div className="text-center">
          <p className="text-lg text-error mb-4">{error || 'Property not found'}</p>
          <button className="btn" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <div className="max-w-4xl mx-auto">
        {isEditMode ? (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Edit Property</h1>
              <p className="text-base-content/70">{property.address}</p>
            </div>
            <PropertyForm initialData={property} propertyId={id} />
          </>
        ) : (
          <PropertyDetail property={property} onDelete={deleteProperty} />
        )}
      </div>
    </PrivateLayout>
  );
}
```

- [ ] **Step 2: Add routes to App.jsx**

Add view and edit routes to `src/App.jsx`:

```jsx
<Route
  path="/property/:id"
  element={
    <ProtectedRoute>
      <ViewProperty />
    </ProtectedRoute>
  }
/>
<Route
  path="/property/:id/:mode"
  element={
    <ProtectedRoute>
      <ViewProperty />
    </ProtectedRoute>
  }
/>
```

Full updated App.jsx:

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AddProperty from './pages/AddProperty';
import ViewProperty from './pages/ViewProperty';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/property/new"
              element={
                <ProtectedRoute>
                  <AddProperty />
                </ProtectedRoute>
              }
            />
            <Route
              path="/property/:id"
              element={
                <ProtectedRoute>
                  <ViewProperty />
                </ProtectedRoute>
              }
            />
            <Route
              path="/property/:id/:mode"
              element={
                <ProtectedRoute>
                  <ViewProperty />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
```

- [ ] **Step 3: Test view/edit property flow**

```bash
npm run dev
```

Verify:
1. Click on property card from dashboard → See read-only PropertyDetail view
2. Property details display correctly with all sections
3. Click "Edit Property" button → Navigate to edit mode
4. Can edit property values in edit mode
5. Calculations update in real-time
6. Saving updates the property and returns to dashboard
7. Delete button works from detail view

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add view and edit property pages with read-only detail view"
```

---

## Chunk 7: Firestore Security & Deployment

### Task 20: Setup Firestore Security Rules

**Files:**
- Create: `firestore.rules`

- [ ] **Step 1: Create Firestore security rules file**

Create `firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }

    // Helper function to check if user owns the resource
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      // Users can only read/write their own document
      allow read, write: if isOwner(userId);

      // Properties subcollection
      match /properties/{propertyId} {
        // Users can only read/write their own properties
        allow read, write: if isOwner(userId);
      }
    }

    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

- [ ] **Step 2: Deploy security rules to Firebase**

Manual step: In Firebase Console
1. Go to Firestore Database → Rules
2. Copy the content of `firestore.rules`
3. Paste into the rules editor
4. Click "Publish"

Alternatively, use Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

- [ ] **Step 3: Test security rules**

Manual testing:
1. Try to access another user's properties (should fail)
2. Try to access properties while logged out (should fail)
3. Access your own properties (should succeed)

- [ ] **Step 4: Commit**

```bash
git add firestore.rules
git commit -m "feat: add Firestore security rules"
```

---

### Task 21: Setup Firebase Hosting

**Files:**
- Create: `firebase.json`
- Create: `.firebaserc`
- Create: `public/_redirects`

- [ ] **Step 1: Initialize Firebase hosting**

```bash
firebase login
firebase init hosting
```

When prompted:
- Use existing project: select your real-estate-investor-tools project
- Public directory: `dist`
- Single-page app: `Yes`
- Automatic builds with GitHub: `No` (for now)
- Overwrites index.html: `No`

- [ ] **Step 2: Create firebase.json config**

Replace `firebase.json` with:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 3: Verify .firebaserc file**

Ensure `.firebaserc` contains your project ID:

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add firebase.json .firebaserc
git commit -m "chore: configure Firebase hosting"
```

---

### Task 22: Build and Deploy

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add deployment scripts to package.json**

Add to `scripts` section:

```json
"build": "vite build",
"preview": "vite preview",
"deploy": "npm run build && firebase deploy --only hosting"
```

- [ ] **Step 2: Build the production app**

```bash
npm run build
```

Expected: Creates `dist/` folder with optimized production build

- [ ] **Step 3: Test production build locally**

```bash
npm run preview
```

Expected: Serves production build at http://localhost:4173

- [ ] **Step 4: Deploy to Firebase Hosting**

```bash
firebase deploy --only hosting
```

Expected:
- Upload completes successfully
- Console shows deployment URL (e.g., https://your-project-id.web.app)

- [ ] **Step 5: Test deployed app**

Visit the deployment URL and verify:
1. Landing page loads
2. Can sign in with Google/GitHub
3. Can add properties
4. Can view and edit properties
5. Calculations work correctly
6. Can delete properties
7. Can sign out

- [ ] **Step 6: Commit and push deployment configuration**

```bash
git add package.json
git commit -m "chore: add deployment scripts and configure production build"
git push origin main
```

---

### Task 23: Create Documentation

**Files:**
- Create: `README.md`
- Create: `.env.example` (if not already created)

- [ ] **Step 1: Create comprehensive README**

Create `README.md`:

```markdown
# Real Estate Investor Tools - Phase 1

A web application for real estate investors to analyze deals, calculate investment metrics, and track their property portfolio.

## Features

- 🔐 Authentication with Google and GitHub
- 📊 Deal Analyzer for rental and flip properties
- 💰 Real-time calculation of key metrics:
  - Monthly cash flow
  - Cap rate
  - Cash-on-cash return
  - ROI and profit projections
- 📁 Property portfolio management
- 💾 Cloud storage with Firebase Firestore

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, DaisyUI
- **Backend:** Firebase (Auth & Firestore)
- **Hosting:** Firebase Hosting
- **Testing:** Vitest, React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase account
- GitHub account (for GitHub auth)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/saharfish42/real-estate-investor-tools.git
cd real-estate-investor-tools
```

2. Install dependencies:
```bash
npm install
```

3. Create a Firebase project at https://console.firebase.google.com

4. Enable Authentication (Google and GitHub providers)

5. Create a Firestore database

6. Copy `.env.example` to `.env.local` and fill in your Firebase config:
```bash
cp .env.example .env.local
```

7. Start the development server:
```bash
npm run dev
```

Visit http://localhost:5173

### Running Tests

```bash
npm test
```

### Deployment

1. Build for production:
```bash
npm run build
```

2. Deploy to Firebase:
```bash
npm run deploy
```

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── auth/          # Authentication components
│   ├── common/        # Common UI elements
│   ├── layout/        # Layout components
│   └── property/      # Property-specific components
├── config/            # Configuration files
├── contexts/          # React contexts (Auth, Toast)
├── hooks/             # Custom React hooks
├── pages/             # Page components
├── utils/             # Utility functions
└── styles/            # Global styles
```

## Key Metrics

### Rental Properties
- **Monthly Cash Flow:** Monthly rent minus all expenses
- **Cap Rate:** Net Operating Income / Purchase Price
- **Cash-on-Cash Return:** Annual cash flow / Total cash invested
- **1% Rule:** Monthly rent should be at least 1% of purchase price

### Flip Properties
- **Profit:** ARV minus total costs
- **ROI:** Profit / Total investment
- **Break-Even ARV:** Minimum ARV needed to avoid loss

## Security

- Properties are isolated per user
- Firestore security rules prevent unauthorized access
- Authentication required for all property operations

## Future Phases

- Phase 2: ARV checker and rent estimator with API integrations
- Phase 3: Project timeline planner and expense tracking
- Phase 4: Portfolio analytics and mobile app

## License

MIT

## Contributing

Contributions welcome! Please open an issue first to discuss proposed changes.
```

- [ ] **Step 2: Verify .env.example exists**

Ensure `.env.example` has all required variables (created in Task 3).

- [ ] **Step 3: Commit**

```bash
git add README.md .env.example
git commit -m "docs: add comprehensive README and environment template"
git push origin main
```

---

## Final Checklist

Before considering Phase 1 complete, verify:

### Functionality
- [ ] Users can sign in with Google
- [ ] Users can sign in with GitHub
- [ ] Users can add rental properties with accurate calculations
- [ ] Users can add flip properties with accurate calculations
- [ ] Properties save to Firestore correctly
- [ ] Properties load from Firestore on dashboard
- [ ] Users can edit existing properties
- [ ] Users can delete properties
- [ ] Deal quality indicators show correct colors
- [ ] Form validation prevents invalid submissions
- [ ] Toast notifications appear for success/error
- [ ] Users can sign out

### Calculations (Verify Against Spreadsheet)
- [ ] Monthly payment calculation is accurate
- [ ] Rental cash flow calculation is accurate
- [ ] Cap rate calculation is accurate
- [ ] Cash-on-cash return is accurate
- [ ] 1% rule calculation is accurate
- [ ] Flip profit calculation is accurate
- [ ] ROI calculation is accurate
- [ ] Break-even ARV is accurate

### Security
- [ ] Firestore security rules prevent unauthorized access
- [ ] Users cannot access other users' properties
- [ ] Authentication is required for all protected routes

### Performance
- [ ] App loads in under 2 seconds
- [ ] Real-time calculations update smoothly
- [ ] No console errors in production

### Deployment
- [ ] App is deployed to Firebase Hosting
- [ ] Production build works correctly
- [ ] Environment variables are configured
- [ ] Code is pushed to GitHub

### Documentation
- [ ] README is comprehensive
- [ ] .env.example has all required variables
- [ ] Code is well-commented where needed

---

## Plan Complete!

This implementation plan provides a complete, step-by-step guide to building Phase 1 of the Real Estate Investor Tools app. Each task follows TDD principles and includes:

- Exact file paths
- Complete code
- Test commands with expected output
- Frequent commits
- Manual testing steps

The plan is ready for execution using either:
- **@superpowers:subagent-driven-development** (if subagents available)
- **@superpowers:executing-plans** (current session)
