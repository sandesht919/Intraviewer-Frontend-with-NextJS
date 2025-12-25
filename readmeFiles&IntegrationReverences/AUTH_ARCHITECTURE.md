# Authentication Architecture Documentation

> **Comprehensive guide to understanding authentication flow, Zustand state management, and the service layer pattern in IntraViewer**

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Core Concepts](#core-concepts)
4. [Zustand State Management](#zustand-state-management)
5. [Authentication Flow](#authentication-flow)
6. [Service Layer Pattern](#service-layer-pattern)
7. [Code Walkthrough](#code-walkthrough)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### What is Zustand?

**Zustand** (German for "state") is a small, fast, and scalable state management library for React. Unlike Redux, it:

- ✅ Has minimal boilerplate
- ✅ Doesn't require providers
- ✅ Works with hooks naturally
- ✅ Supports middleware easily
- ✅ TypeScript-friendly

Think of it as a **global variables container** that React components can read from and write to, with automatic re-renders when data changes.

### Our Authentication Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   React     │  ──────> │   Zustand    │  ──────> │   Service   │
│ Components  │          │    Store     │          │    Layer    │
└─────────────┘          └──────────────┘          └─────────────┘
      ↑                         ↑                          ↓
      │                         │                          ↓
      │                         │                   ┌─────────────┐
      │                         └─────────────────  │   Backend   │
      │                                             │     API     │
      └─────────────────────────────────────────── └─────────────┘
```

**Key Components:**

1. **React Components** - UI that users interact with
2. **Zustand Store** - Central state management (auth data)
3. **Service Layer** - API communication logic
4. **Backend API** - Authentication server

---

## Architecture Diagram

### Complete Authentication Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                          │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ↓
┌───────────────────────────────────────────────────────────────────┐
│  COMPONENT (Login.tsx)                                            │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  const { login, isLoading, error } = useAuth();             │ │
│  │  await login({ email, password });                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────┬───────────────────────────────────────┘
                            │
                            ↓
┌───────────────────────────────────────────────────────────────────┐
│  HOOK (useAuth.ts)                                                │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  // Thin wrapper around Zustand store                       │ │
│  │  const storeLogin = useAuthStore(state => state.login);     │ │
│  │  return storeLogin(credentials);                            │ │
│  └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────┬───────────────────────────────────────┘
                            │
                            ↓
┌───────────────────────────────────────────────────────────────────┐
│  ZUSTAND STORE (authStore.ts)                                     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  login: async (credentials) => {                            │ │
│  │    set({ isLoading: true });                                │ │
│  │    const data = await AuthService.login(credentials);       │ │
│  │    set({ user: data.user, accessToken: data.access_token });│ │
│  │    setAuthCookie(true, data.access_token);                  │ │
│  │  }                                                           │ │
│  └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────┬───────────────────────────────────────┘
                            │
                            ↓
┌───────────────────────────────────────────────────────────────────┐
│  SERVICE LAYER (auth.service.ts)                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  static async login(credentials) {                          │ │
│  │    const response = await fetch('/auth/login', {            │ │
│  │      method: 'POST',                                        │ │
│  │      body: JSON.stringify(credentials)                      │ │
│  │    });                                                      │ │
│  │    return handleAPIResponse(response);                      │ │
│  │  }                                                           │ │
│  └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────┬───────────────────────────────────────┘
                            │
                            ↓
┌───────────────────────────────────────────────────────────────────┐
│  BACKEND API                                                       │
│  POST /auth/login                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  {                                                           │ │
│  │    access_token: "jwt_token_here",                          │ │
│  │    refresh_token: "refresh_token_here",                     │ │
│  │    user: { id, email, name, ... }                           │ │
│  │  }                                                           │ │
│  └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

---

## Core Concepts

### 1. State Management with Zustand

#### Traditional React State Problem

```typescript
// ❌ Problem: Props drilling
function App() {
  const [user, setUser] = useState(null);
  return <Dashboard user={user} />;
}

function Dashboard({ user }) {
  return <Navbar user={user} />;
}

function Navbar({ user }) {
  return <UserMenu user={user} />;
}
```

#### Zustand Solution

```typescript
// ✅ Solution: Global state accessible anywhere
// authStore.ts
export const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

// Any component, anywhere
function UserMenu() {
  const user = useAuthStore((state) => state.user);
  return <div>{user?.name}</div>;
}
```

### 2. Zustand Store Anatomy

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // ═══════════════════════════════════
      // STATE: What data we're storing
      // ═══════════════════════════════════
      user: null,
      accessToken: null,
      isLoading: false,

      // ═══════════════════════════════════
      // ACTIONS: Functions to update state
      // ═══════════════════════════════════
      login: async (credentials) => {
        // 1. Update loading state
        set({ isLoading: true });

        // 2. Call API
        const data = await AuthService.login(credentials);

        // 3. Update state with response
        set({
          user: data.user,
          accessToken: data.access_token,
          isLoading: false,
        });
      },

      logout: () => {
        // Reset state
        set({ user: null, accessToken: null });
      },
    }),
    {
      // ═══════════════════════════════════
      // MIDDLEWARE: Persist to localStorage
      // ═══════════════════════════════════
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);
```

### 3. Key Zustand Functions

| Function      | Purpose              | Example                            |
| ------------- | -------------------- | ---------------------------------- |
| `set()`       | Update state         | `set({ user: newUser })`           |
| `get()`       | Read current state   | `const token = get().accessToken`  |
| `persist()`   | Save to localStorage | Automatic on state changes         |
| `subscribe()` | Watch for changes    | `useAuthStore.subscribe(callback)` |

---

## Zustand State Management

### How Zustand Works Under the Hood

#### 1. Store Creation

```typescript
// What you write
const useAuthStore = create((set, get) => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 }))
}));

// What Zustand creates internally
{
  // State container
  state: { count: 0 },

  // Subscribers (React components using this state)
  listeners: [Component1, Component2, Component3],

  // setState function
  setState: (partial) => {
    // Merge new state
    this.state = { ...this.state, ...partial };

    // Notify all subscribers
    this.listeners.forEach(listener => listener());
  }
}
```

#### 2. Component Subscription

```typescript
function Counter() {
  // This hook does 3 things:
  const count = useAuthStore((state) => state.count);

  // 1. Subscribe this component to the store
  // 2. Extract only the 'count' value
  // 3. Re-render only when 'count' changes

  return <div>{count}</div>;
}
```

#### 3. State Updates Flow

```
User clicks button
       ↓
Component calls increment()
       ↓
increment() calls set()
       ↓
Zustand merges new state
       ↓
Zustand notifies subscribers
       ↓
React re-renders components
       ↓
UI updates with new count
```

### Persist Middleware Explained

```typescript
persist(storeCreator, {
  name: 'auth-storage', // localStorage key
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({
    // What to save
    user: state.user,
    accessToken: state.accessToken,
    // ❌ Don't save: isLoading, error (temporary states)
  }),
});
```

**How it works:**

1. **On mount**: Reads from `localStorage['auth-storage']` and hydrates state
2. **On state change**: Automatically saves to localStorage
3. **On unmount**: Nothing (data persists)

**Why it's useful:**

- ✅ User stays logged in after page refresh
- ✅ Tokens available immediately on app start
- ✅ No manual localStorage.setItem() calls

---

## Authentication Flow

### Complete User Journey

#### 1. **User Signup Flow**

```typescript
// Step 1: User fills signup form
<SignupForm>
  <input name="email" />
  <input name="password" />
  <button onClick={handleSignup}>Sign Up</button>
</SignupForm>

// Step 2: Component calls signup
const { signup } = useAuth();
await signup({ email, password, name });

// Step 3: useAuth forwards to Zustand
const signup = useCallback(async (data) => {
  return storeSignup(data);
}, [storeSignup]);

// Step 4: Zustand calls service
signup: async (data) => {
  set({ isLoading: true });
  const response = await AuthService.signup(data);
  set({
    user: response.user,
    accessToken: response.access_token,
    isAuthenticated: true
  });
}

// Step 5: Service makes API call
static async signup(data) {
  const response = await fetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return handleAPIResponse(response);
}

// Step 6: Backend validates & creates user
// Step 7: Returns JWT token & user data
// Step 8: Zustand saves to state & localStorage
// Step 9: Component redirects to dashboard
```

#### 2. **User Login Flow**

```typescript
┌─────────────────────────────────────────────────────────────┐
│ 1. USER ENTERS CREDENTIALS                                  │
│    email: user@example.com                                  │
│    password: ********                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. COMPONENT VALIDATION                                     │
│    ✓ Email format check                                     │
│    ✓ Password length check                                  │
│    ✓ Call useAuth().login()                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. ZUSTAND STORE                                            │
│    • Set isLoading = true                                   │
│    • Call AuthService.login()                               │
│    • Wait for response...                                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. SERVICE LAYER                                            │
│    • Prepare request                                        │
│    • Add headers                                            │
│    • Send POST to /auth/login                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. BACKEND API                                              │
│    • Validate credentials                                   │
│    • Check user in database                                 │
│    • Generate JWT tokens                                    │
│    • Return response                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. SERVICE LAYER HANDLES RESPONSE                           │
│    • Check response.ok                                      │
│    • Parse JSON                                             │
│    • Handle errors                                          │
│    • Return data to store                                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. ZUSTAND STORE UPDATES                                    │
│    • Set user data                                          │
│    • Set accessToken                                        │
│    • Set refreshToken                                       │
│    • Set isAuthenticated = true                             │
│    • Set isLoading = false                                  │
│    • Save to cookie                                         │
│    • Persist to localStorage                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. REACT COMPONENTS RE-RENDER                               │
│    • All components using useAuthStore update               │
│    • Navbar shows user name                                 │
│    • Protected routes become accessible                     │
│    • Redirect to dashboard                                  │
└─────────────────────────────────────────────────────────────┘
```

#### 3. **Token Refresh Flow**

```typescript
// Scenario: Access token expired after 15 minutes

// 1. User makes API request
const data = await fetch('/api/interviews');

// 2. Backend returns 401 Unauthorized
// Response: { status: 401, message: "Token expired" }

// 3. Service detects 401 in handleAPIResponse()
if (response.status === 401) {
  // 4. Trigger token refresh
  await useAuthStore.getState().refreshAccessToken();

  // 5. Zustand refreshAccessToken function
  refreshAccessToken: async () => {
    const { refreshToken } = get();
    const data = await AuthService.refreshToken(refreshToken);

    // 6. Update with new tokens
    set({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    });
  };

  // 7. Retry original request with new token
  // 8. Return data to component
}
```

#### 4. **Logout Flow**

```typescript
// Simple and clean
logout: () => {
  // 1. Clear Zustand state
  set({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  });

  // 2. Clear cookie
  clearAuthCookie();

  // 3. Zustand persist middleware automatically clears localStorage
  // 4. Redirect to login page
};
```

---

## Service Layer Pattern

### Why Separate Services?

#### ❌ Without Service Layer

```typescript
// authStore.ts - BAD: Mixed concerns
login: async (credentials) => {
  const response = await fetch('http://localhost:8000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Login failed');
  }

  const data = await response.json();
  set({ user: data.user, accessToken: data.access_token });
};
```

**Problems:**

- 🚫 Hard to test
- 🚫 Duplicate API logic
- 🚫 Can't reuse outside Zustand
- 🚫 Hard to mock for testing

#### ✅ With Service Layer

```typescript
// auth.service.ts - GOOD: Single responsibility
export class AuthService {
  static async login(credentials) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleAPIResponse(response);
  }
}

// authStore.ts - GOOD: Clean separation
login: async (credentials) => {
  set({ isLoading: true });
  const data = await AuthService.login(credentials);
  set({ user: data.user, accessToken: data.access_token });
};
```

**Benefits:**

- ✅ Easy to test services independently
- ✅ Reusable in any context (stores, components, server actions)
- ✅ Single place to update API endpoints
- ✅ Easy to mock for testing

### Service Layer Structure

```typescript
// lib/services/auth.service.ts
export class AuthService {
  // Static methods = No need to instantiate
  // Just call: AuthService.login()

  static async login(credentials: LoginCredentials) {
    // 1. Prepare request
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Send cookies
      body: JSON.stringify(credentials),
    });

    // 2. Handle response (errors, parsing)
    return handleAPIResponse<AuthResponse>(response);
  }

  static async signup(data: SignupData) {
    /* ... */
  }
  static async refreshToken(token: string) {
    /* ... */
  }
  static async logout(token: string) {
    /* ... */
  }
}
```

### Error Handling Pattern

```typescript
// config/api.ts
export async function handleAPIResponse<T>(response: Response): Promise<T> {
  // Handle different status codes
  if (response.status === 401) {
    throw new Error('Unauthorized - Please login again');
  }

  if (response.status === 403) {
    throw new Error('Forbidden - You dont have permission');
  }

  if (response.status >= 400) {
    const error = await response.json();
    throw new Error(error.detail || error.message || 'Request failed');
  }

  // Success: parse and return JSON
  return response.json();
}
```

---

## Code Walkthrough

### File-by-File Explanation

#### 1. `lib/types/auth.types.ts` - Type Definitions

```typescript
/**
 * WHY: TypeScript types for type safety
 * WHEN: Import these whenever you work with auth data
 */

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email?: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string; // JWT for API requests
  refresh_token: string; // JWT for getting new access tokens
  token_type: string; // Usually "Bearer"
  user: User; // User data
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
}
```

#### 2. `lib/services/auth.service.ts` - API Communication

```typescript
/**
 * WHY: Centralize all authentication API calls
 * RESPONSIBILITIES:
 * - Make HTTP requests
 * - Handle responses
 * - Return typed data
 *
 * DOES NOT:
 * - Manage state (that's Zustand's job)
 * - Update UI (that's React's job)
 */

export class AuthService {
  /**
   * Login user with email/password
   *
   * @param credentials - Email and password
   * @returns Promise with auth tokens and user data
   * @throws Error if login fails
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Important: Send cookies
      body: JSON.stringify(credentials),
    });

    return handleAPIResponse<AuthResponse>(response);
  }

  // Other methods follow same pattern...
}
```

#### 3. `lib/stores/authStore.ts` - State Management

```typescript
/**
 * WHY: Central state container for authentication
 * RESPONSIBILITIES:
 * - Store user data
 * - Store tokens
 * - Provide actions to update state
 * - Persist state to localStorage
 *
 * PATTERN: State + Actions together
 */

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // ============================================
      // STATE: What data we're tracking
      // ============================================
      user: null, // Current user or null
      accessToken: null, // JWT for API requests
      refreshToken: null, // JWT for refresh
      isLoading: false, // Loading state
      error: null, // Error messages
      isAuthenticated: false, // Quick check if logged in

      // ============================================
      // ACTIONS: Functions to modify state
      // ============================================

      /**
       * Login user
       *
       * FLOW:
       * 1. Set loading state
       * 2. Call API via service
       * 3. Update state with response
       * 4. Save to cookie
       * 5. Fetch additional user data
       */
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });

        try {
          // Call service layer
          const data = await AuthService.login(credentials);

          // Update state with response
          set({
            user: data.user,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Side effects
          setAuthCookie(true, data.access_token);

          // Optional: Fetch more user data
          try {
            await get().fetchUserData();
          } catch (fetchError) {
            console.warn('Failed to fetch user data:', fetchError);
          }
        } catch (error: any) {
          // Handle errors
          set({
            error: error.message || MESSAGES.AUTH.INVALID_CREDENTIALS,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error; // Re-throw for component to handle
        }
      },

      /**
       * Logout user
       *
       * FLOW:
       * 1. Clear state
       * 2. Clear cookies
       * 3. Persist middleware clears localStorage
       */
      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
        clearAuthCookie();
      },

      // ... other actions
    }),
    {
      // ============================================
      // PERSISTENCE: Save state to localStorage
      // ============================================
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only save these fields
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        // Don't save: isLoading, error (temporary)
      }),
    }
  )
);
```

#### 4. `lib/hooks/useAuth.ts` - Convenient Hook

```typescript
/**
 * WHY: Provide a cleaner API for components
 * RESPONSIBILITIES:
 * - Wrap Zustand store for convenience
 * - Add validation logic
 * - Return only what components need
 *
 * PATTERN: Facade pattern
 */

export const useAuth = () => {
  // Get store actions and state
  const {
    user,
    isLoading,
    error,
    isAuthenticated,
    login: storeLogin,
    signup: storeSignup,
    logout: storeLogout,
    refreshAccessToken,
    clearError,
  } = useAuthStore();

  /**
   * Login with validation
   */
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      // Add client-side validation
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      return storeLogin(credentials);
    },
    [storeLogin]
  );

  /**
   * Signup with validation
   */
  const signup = useCallback(
    async (data: SignupData) => {
      if (!data.email || !data.password) {
        throw new Error('Email and password are required');
      }

      if (data.confirmPassword && data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const { confirmPassword, ...signupData } = data;
      return storeSignup(signupData);
    },
    [storeSignup]
  );

  // Return clean API
  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    signup,
    logout: storeLogout,
    refreshToken: refreshAccessToken,
    clearError,
  };
};
```

#### 5. Component Usage Example

```typescript
/**
 * app/auth/login/page.tsx
 *
 * HOW TO USE: Import and call hooks
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Get auth functions from hook
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Call login - this triggers the entire flow
      await login({ email, password });

      // Success: redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      // Error is already in state, just log
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
      />

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

---

## Best Practices

### 1. State Management Best Practices

#### ✅ DO: Use Selectors

```typescript
// Good: Only subscribe to what you need
function UserName() {
  const userName = useAuthStore((state) => state.user?.name);
  // Only re-renders when user.name changes
  return <div>{userName}</div>;
}

// Bad: Subscribe to entire state
function UserName() {
  const { user } = useAuthStore();
  // Re-renders on ANY auth state change
  return <div>{user?.name}</div>;
}
```

#### ✅ DO: Keep Actions Pure

```typescript
// Good: Action focuses on state updates
login: async (credentials) => {
  set({ isLoading: true });
  const data = await AuthService.login(credentials);
  set({ user: data.user, isLoading: false });
};

// Bad: Action has side effects
login: async (credentials) => {
  set({ isLoading: true });
  const data = await AuthService.login(credentials);
  set({ user: data.user, isLoading: false });
  router.push('/dashboard'); // ❌ Side effect
  toast.success('Welcome!'); // ❌ Side effect
};
```

#### ✅ DO: Handle Errors Gracefully

```typescript
login: async (credentials) => {
  set({ isLoading: true, error: null });

  try {
    const data = await AuthService.login(credentials);
    set({ user: data.user, isAuthenticated: true });
  } catch (error: any) {
    set({
      error: error.message || 'Login failed',
      isAuthenticated: false,
    });
    throw error; // Let component handle UI feedback
  } finally {
    set({ isLoading: false });
  }
};
```

### 2. Service Layer Best Practices

#### ✅ DO: Use Static Methods

```typescript
// Good: No need to instantiate
export class AuthService {
  static async login(credentials) {
    /* ... */
  }
}

// Usage
await AuthService.login(credentials);

// Bad: Requires instantiation
export class AuthService {
  async login(credentials) {
    /* ... */
  }
}

// Usage
const authService = new AuthService();
await authService.login(credentials);
```

#### ✅ DO: Return Typed Data

```typescript
// Good: Type-safe
static async login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  const response = await fetch(/* ... */);
  return handleAPIResponse<AuthResponse>(response);
}

// Bad: No types
static async login(credentials) {
  const response = await fetch(/* ... */);
  return response.json();
}
```

### 3. Security Best Practices

#### ✅ DO: Use httpOnly Cookies for Refresh Tokens

```typescript
// Backend should set cookies
Set-Cookie: refreshToken=xyz; HttpOnly; Secure; SameSite=Strict

// Frontend: Don't store refresh tokens in localStorage
// They're automatically sent with requests
```

#### ✅ DO: Implement Token Refresh

```typescript
// Auto-refresh before expiry
useEffect(() => {
  if (!isAuthenticated) return;

  const interval = setInterval(() => {
    refreshAccessToken();
  }, AUTH_CONSTANTS.TOKEN_REFRESH_INTERVAL); // 14 minutes

  return () => clearInterval(interval);
}, [isAuthenticated]);
```

#### ✅ DO: Clear Sensitive Data on Logout

```typescript
logout: () => {
  // Clear everything
  set({
    user: null,
    accessToken: null,
    refreshToken: null,
  });

  // Clear cookies
  clearAuthCookie();

  // Persist middleware automatically clears localStorage
};
```

### 4. Performance Best Practices

#### ✅ DO: Memoize Selectors

```typescript
const selectUserName = (state: AuthState) => state.user?.name;

function UserName() {
  const userName = useAuthStore(selectUserName);
  return <div>{userName}</div>;
}
```

#### ✅ DO: Avoid Unnecessary Re-renders

```typescript
// Good: Specific selector
const isLoading = useAuthStore((state) => state.isLoading);

// Bad: Getting entire state
const auth = useAuthStore();
const isLoading = auth.isLoading;
```

---

## Troubleshooting

### Common Issues

#### 1. "User logged out after refresh"

**Cause**: Persist middleware not configured

```typescript
// Fix: Add persist middleware
persist(storeCreator, { name: 'auth-storage' });
```

#### 2. "Infinite re-renders"

**Cause**: Not using selectors properly

```typescript
// Bad: Creates new object each time
const { user } = useAuthStore();

// Good: Returns primitive
const userName = useAuthStore((state) => state.user?.name);
```

#### 3. "Token expired" errors

**Cause**: No token refresh logic

```typescript
// Fix: Implement refreshAccessToken
refreshAccessToken: async () => {
  const { refreshToken } = get();
  const data = await AuthService.refreshToken(refreshToken);
  set({ accessToken: data.access_token });
};
```

#### 4. "State not updating"

**Cause**: Mutating state directly

```typescript
// Bad: Direct mutation
state.user.name = 'New Name';

// Good: Use set()
set({ user: { ...state.user, name: 'New Name' } });
```

### Debugging Tips

```typescript
// 1. Log state changes
useAuthStore.subscribe((state) => {
  console.log('Auth state changed:', state);
});

// 2. Check localStorage
console.log(localStorage.getItem('auth-storage'));

// 3. Monitor network requests
// Open DevTools > Network > Filter: /auth/

// 4. Use Zustand DevTools
import { devtools } from 'zustand/middleware';

export const useAuthStore = create(devtools(persist(/* ... */), { name: 'AuthStore' }));
```

---

## Summary

### Key Takeaways

1. **Zustand** = Simple global state management
2. **Service Layer** = Separate API logic from state logic
3. **Types** = TypeScript for safety
4. **Persist Middleware** = Automatic localStorage sync
5. **Hooks** = Clean component API

### Data Flow

```
Component → Hook → Zustand Store → Service → API → Backend
    ↑         ↓         ↓             ↓       ↓       ↓
    └─────────┴─────────┴─────────────┴───────┴───────┘
              State updates flow back
```

### Project Structure

```
lib/
├── types/           # TypeScript definitions
├── services/        # API communication
├── stores/          # Zustand state management
├── hooks/           # React hooks (convenience)
└── constants/       # Configuration values
```

---

## Further Reading

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [JWT Authentication Best Practices](https://jwt.io/introduction)
- [React State Management Patterns](https://react.dev/learn/managing-state)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

**Questions?** Check the inline code comments or ask your team lead!
