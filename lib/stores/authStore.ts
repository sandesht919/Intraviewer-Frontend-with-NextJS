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
import { setAuthCookie, clearAuthCookie } from '../utils/cookies';
import { AuthService } from '../services';
import type { User, LoginCredentials, SignupData, AuthState } from '../types';
import { AUTH_CONSTANTS, MESSAGES } from '../constants';

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
          // Backend login returns only tokens (access_token, refresh_token, token_type, expires_in)
          const tokenData = await AuthService.login(credentials);

          // Set tokens first
          set({
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            isAuthenticated: true,
          });

          // Sync auth state with cookies for middleware
          setAuthCookie(true, tokenData.access_token);

          // Fetch user data using the access token
          try {
            const userData = await AuthService.getCurrentUser(tokenData.access_token);

            const userWithEmail = {
              ...userData,
              email: credentials.email,
              name: `${userData.firstname} ${userData.lastname}`.trim(),
            };

            set({
              user: userWithEmail,
              isLoading: false,
              error: null,
            });
          } catch (fetchError) {
            console.error('Failed to fetch user data after login:', fetchError);
            // Still set loading to false even if user fetch fails
            set({ isLoading: false });
          }
        } catch (error: any) {
          set({
            error: error.message || MESSAGES.AUTH.INVALID_CREDENTIALS,
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
          // Only use remaining parts as lastname, or empty string if no space
          const lastname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

          // Transform to backend format (remove confirmPassword, name; add firstname, lastname)
          const signupPayload = {
            email: data.email,
            password: data.password,
            firstname,
            lastname,
          };

          // Backend signup returns {message, data: UserResponse} without tokens
          const signupResponse = await AuthService.signup(signupPayload);

          // After successful signup, login to get tokens
          const loginResponse = await AuthService.login({
            email: data.email,
            password: data.password,
          });

          // Combine user data from signup with tokens from login
          const userWithEmail = {
            ...signupResponse.data,
            email: data.email,
            name: `${signupResponse.data.firstname} ${signupResponse.data.lastname}`.trim(),
          };

          set({
            user: userWithEmail,
            accessToken: loginResponse.access_token,
            refreshToken: loginResponse.refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Sync auth state with cookies
          setAuthCookie(true, loginResponse.access_token);
        } catch (error: any) {
          set({
            error: error.message || MESSAGES.ERRORS.GENERIC,
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
          const data = await AuthService.refreshToken(refreshToken);

          set({
            accessToken: data.access_token,
            refreshToken: data.refresh_token || refreshToken,
          });

          // Update cookie with new access token
          setAuthCookie(true, data.access_token);
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
        const { accessToken, user: currentUser } = get();

        if (!accessToken) {
          throw new Error('No access token available');
        }

        try {
          const userData = await AuthService.getCurrentUser(accessToken);

          // Preserve email from current user since backend doesn't return it
          const updatedUser = {
            ...userData,
            email: currentUser?.email || userData.email,
            name: `${userData.firstname} ${userData.lastname}`.trim(),
          };

          set({ user: updatedUser });
        } catch (error: any) {
          if (error.message.includes('401')) {
            // Token expired, try to refresh
            await get().refreshAccessToken();
            return get().fetchUserData(); // Retry with new token
          }
          throw error;
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
      // Sync cookie after rehydration
      onRehydrateStorage: () => (state) => {
        if (state?.isAuthenticated && state?.accessToken) {
          setAuthCookie(true, state.accessToken);
        }
      },
    }
  )
);
