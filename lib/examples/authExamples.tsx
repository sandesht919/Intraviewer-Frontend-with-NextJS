/**
 * Authentication Usage Examples
 * 
 * This file demonstrates how to use the Zustand auth store in your components.
 * You can reference these patterns when implementing authentication in your app.
 */

import { useAuth } from '../hooks/useAuth';
import { useAuthStore, useAuthenticatedFetch } from '../stores/authStore';

/**
 * Example 1: Using the useAuth hook in a login component
 */
export function LoginExample() {
  const { login, isLoading, error, clearError } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      clearError(); // Clear any previous errors
      await login({ email, password });
      // Login successful - user will be redirected or UI will update
      console.log('Login successful!');
    } catch (err) {
      // Error is already set in the store
      console.error('Login failed:', err);
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <button onClick={() => handleLogin('user@example.com', 'password')} disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </div>
  );
}

/**
 * Example 2: Using the useAuth hook in a signup component
 */
export function SignupExample() {
  const { signup, isLoading, error } = useAuth();

  const handleSignup = async (email: string, password: string, confirmPassword: string, name?: string) => {
    try {
      await signup({ email, password, confirmPassword, name });
      console.log('Signup successful!');
    } catch (err) {
      console.error('Signup failed:', err);
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <button onClick={() => handleSignup('new@example.com', 'pass123', 'pass123', 'John Doe')} disabled={isLoading}>
        {isLoading ? 'Signing up...' : 'Sign Up'}
      </button>
    </div>
  );
}

/**
 * Example 3: Checking authentication status
 */
export function AuthStatusExample() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.name || user?.email}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

/**
 * Example 4: Making authenticated API calls
 */
export function ProtectedDataExample() {
  const authenticatedFetch = useAuthenticatedFetch();
  const [data, setData] = React.useState(null);

  const fetchProtectedData = async () => {
    try {
      const response = await authenticatedFetch('http://localhost:8000/api/protected-endpoint');
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Failed to fetch protected data:', err);
    }
  };

  return (
    <div>
      <button onClick={fetchProtectedData}>Fetch Protected Data</button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}

/**
 * Example 5: Direct store access (for advanced use cases)
 */
export function DirectStoreAccessExample() {
  // You can access the store directly without the hook
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const refreshToken = useAuthStore((state) => state.refreshAccessToken);

  const handleManualRefresh = async () => {
    try {
      await refreshToken();
      console.log('Token refreshed successfully');
    } catch (err) {
      console.error('Token refresh failed:', err);
    }
  };

  return (
    <div>
      <p>Access Token: {accessToken ? 'Present' : 'None'}</p>
      <p>User: {user?.email}</p>
      <button onClick={handleManualRefresh}>Refresh Token</button>
    </div>
  );
}

/**
 * Example 6: Protected Route Component
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login page
    // In Next.js, you might use: router.push('/login')
    return <div>Please log in to access this page</div>;
  }

  return <>{children}</>;
}

/**
 * Example 7: Auto-refresh token on app load
 */
export function AppInitializer() {
  const { refreshToken, isAuthenticated, logout } = useAuth();

  React.useEffect(() => {
    // Check if user is authenticated and refresh token on app load
    if (isAuthenticated) {
      refreshToken().catch((err) => {
        console.error('Failed to refresh token on app load:', err);
        // Token refresh failed, logout user
        logout();
      });
    }
  }, []);

  return null;
}

/**
 * Example 8: Using with React Query (if you're using it)
 */
export function ReactQueryExample() {
  const authenticatedFetch = useAuthenticatedFetch();

  // Example with React Query
  // const { data, isLoading } = useQuery({
  //   queryKey: ['user-profile'],
  //   queryFn: async () => {
  //     const response = await authenticatedFetch('http://localhost:8000/api/profile');
  //     return response.json();
  //   },
  //   enabled: isAuthenticated,
  // });

  return null;
}

// Import React for the examples
import React from 'react';
