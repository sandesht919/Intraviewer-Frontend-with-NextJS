/**
 * useAuth Hook
 * 
 * Custom hook that provides a convenient interface to the Zustand auth store.
 * This hook integrates with the backend API endpoints:
 * - POST /auth/login - User login
 * - POST /auth/signup - User registration
 * - POST /auth/refresh - Token refresh
 * 
 * Uses Zustand for global state management with persistence.
 */

import { useAuthStore } from '../stores/authStore';
import { useCallback } from 'react';

/**
 * Interface for login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Interface for signup data
 */
export interface SignupData {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
}

/**
 * Custom hook for authentication management
 * 
 * @returns {Object} Auth state and methods
 * - user: Current logged-in user or null
 * - isLoading: Loading state during auth operations
 * - error: Error message if any
 * - isAuthenticated: Boolean indicating if user is authenticated
 * - login: Function to login user
 * - signup: Function to register new user
 * - logout: Function to logout user
 * - refreshToken: Function to refresh access token
 * - clearError: Function to clear error message
 */
export const useAuth = () => {
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
   * Login function with validation
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }
    
    return storeLogin(credentials);
  }, [storeLogin]);

  /**
   * Signup function with validation
   */
  const signup = useCallback(async (data: SignupData) => {
    // Validate required fields
    if (!data.email || !data.password) {
      throw new Error('Email and password are required');
    }

    // Validate password confirmation if provided
    if (data.confirmPassword && data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Remove confirmPassword before sending to backend
    const { confirmPassword, ...signupData } = data;
    
    return storeSignup(signupData);
  }, [storeSignup]);

  /**
   * Logout function
   */
  const logout = useCallback(() => {
    storeLogout();
  }, [storeLogout]);

  /**
   * Refresh token function
   */
  const refreshToken = useCallback(async () => {
    return refreshAccessToken();
  }, [refreshAccessToken]);

  return {
    // State
    user,
    isLoading,
    error,
    isAuthenticated,
    
    // Actions
    login,
    signup,
    logout,
    refreshToken,
    clearError,
  };
};
