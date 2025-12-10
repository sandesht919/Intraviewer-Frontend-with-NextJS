/**
 * Authentication Store using Zustand
 * 
 * This store manages the global authentication state including:
 * - User data
 * - Access and refresh tokens
 * - Authentication operations (login, signup, logout, refresh)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { API_CONFIG, handleAPIResponse } from '../config/api';
import { setAuthCookie, clearAuthCookie } from '../utils/cookies';

const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * User interface matching backend response
 */
interface User {
  id: number;
  firstname: string;
  lastname: string;
  is_active: boolean;
  role: string;
  created_at: string;
  // Computed properties for compatibility
  name?: string;
  email?: string;
}

/**
 * Auth response from backend
 */
interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

/**
 * Login credentials
 */
interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Signup data
 */
interface SignupData {
  email: string;
  password: string;
  name?: string;
}

/**
 * Auth store state
 */
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

/**
 * Auth store actions
 */
interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  fetchUserData: () => Promise<void>;
}

/**
 * Combined auth store type
 */
type AuthStore = AuthState & AuthActions;

/**
 * Zustand auth store with persistence
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      /**
       * Login user with email and password
       */
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });

        try {
          // FastAPI OAuth2 expects form data, not JSON
          const formData = new URLSearchParams();
          formData.append('username', credentials.email); // OAuth2 uses 'username' field
          formData.append('password', credentials.password);

          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Login failed' }));
            throw new Error(errorData.detail || 'Login failed');
          }

          const data: AuthResponse = await response.json();

          set({
            user: data.user,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Sync auth state with cookies for middleware
          setAuthCookie(true, data.access_token);
          
          // Fetch complete user data
          try {
            await get().fetchUserData();
          } catch (fetchError) {
            console.warn('Failed to fetch user data after login:', fetchError);
          }
        } catch (error: any) {
          set({
            error: error.message || 'Login failed. Please try again.',
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      /**
       * Signup new user
       */
      signup: async (data: SignupData) => {
        set({ isLoading: true, error: null });

        try {
          // Split name into firstname and lastname for backend
          const nameParts = (data.name || '').trim().split(' ');
          const firstname = nameParts[0] || '';
          const lastname = nameParts.slice(1).join(' ') || nameParts[0] || ''; // Use firstname as lastname if no lastname provided

          const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              firstname,
              lastname,
              email: data.email,
              password: data.password,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Signup failed' }));
            throw new Error(errorData.detail || 'Signup failed');
          }

          const responseData: AuthResponse = await response.json();

          set({
            user: responseData.user,
            accessToken: responseData.access_token,
            refreshToken: responseData.refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Sync auth state with cookies for middleware
          setAuthCookie(true, responseData.access_token);
          
          // Fetch complete user data
          try {
            await get().fetchUserData();
          } catch (fetchError) {
            console.warn('Failed to fetch user data after signup:', fetchError);
          }
        } catch (error: any) {
          set({
            error: error.message || 'Signup failed. Please try again.',
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      /**
       * Logout user and clear all auth data
       */
      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });

        // Clear auth cookie
        clearAuthCookie();
        
        // Force clear localStorage to ensure no stale state
        try {
          localStorage.removeItem('auth-storage');
        } catch (error) {
          console.warn('Failed to clear auth storage:', error);
        }
      },

      /**
       * Refresh access token using refresh token
       */
      refreshAccessToken: async () => {
        const { refreshToken } = get();

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${refreshToken}`,
            },
          });

          if (!response.ok) {
            // If refresh fails, logout user
            get().logout();
            throw new Error('Session expired. Please login again.');
          }

          const data = await response.json();

          set({
            accessToken: data.access_token,
            // Some implementations also return a new refresh token
            refreshToken: data.refresh_token || refreshToken,
          });
        } catch (error: any) {
          get().logout();
          throw error;
        }
      },

      /**
       * Clear error message
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Set user data manually (useful for updates)
       */
      setUser: (user: User | null) => {
        set({ user });
      },

      /**
       * Fetch current user data from backend
       */
      fetchUserData: async () => {
        const { accessToken } = get();
        
        if (!accessToken) {
          throw new Error('No access token available');
        }

        try {
          const response = await fetch(`${API_BASE_URL}/users/me`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
          });

          if (!response.ok) {
            if (response.status === 401) {
              // Token expired, try to refresh
              await get().refreshAccessToken();
              return get().fetchUserData(); // Retry with new token
            }
            throw new Error('Failed to fetch user data');
          }

          const userData = await response.json();
          
          // Add computed properties for compatibility
          const userWithComputed = {
            ...userData,
            name: `${userData.firstname} ${userData.lastname}`.trim(),
            email: '', // Will be filled from login/signup
          };

          set({ user: userWithComputed });
        } catch (error: any) {
          console.error('Failed to fetch user data:', error);
          // Don't logout on fetch failure, just log the error
        }
      },
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist these fields
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * Helper hook to get authenticated fetch function
 * Automatically adds Authorization header and handles token refresh
 */
export const useAuthenticatedFetch = () => {
  const { accessToken, refreshAccessToken } = useAuthStore();

  return async (url: string, options: RequestInit = {}) => {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    };

    let response = await fetch(url, { ...options, headers });

    // If unauthorized, try to refresh token and retry
    if (response.status === 401) {
      try {
        await refreshAccessToken();
        const newAccessToken = useAuthStore.getState().accessToken;
        
        headers['Authorization'] = `Bearer ${newAccessToken}`;
        response = await fetch(url, { ...options, headers });
      } catch (error) {
        // Refresh failed, user will be logged out
        throw new Error('Session expired. Please login again.');
      }
    }

    return response;
  };
};
