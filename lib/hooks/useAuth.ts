/**
 * useAuth Hook
 * 
 * Custom hook for managing authentication state and operations.
 * This hook provides functions to handle user login, signup, and token management.
 * 
 * Future Integration:
 * - Replace mock data with actual API calls to backend
 * - Integrate with your authentication backend endpoint
 * - Store JWT tokens in secure storage
 */

import { useState, useCallback } from 'react';

/**
 * Interface for user data structure
 */
interface User {
  id: string;
  email: string;
  name: string;
  token: string;
}

/**
 * Interface for login credentials
 */
interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Interface for signup data
 */
interface SignupData extends LoginCredentials {
  name: string;
  confirmPassword: string;
}

/**
 * Custom hook for authentication management
 * 
 * @returns {Object} Auth state and methods
 * - user: Current logged-in user or null
 * - isLoading: Loading state during auth operations
 * - error: Error message if any
 * - login: Function to login user
 * - signup: Function to register new user
 * - logout: Function to logout user
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Login function
   * TODO: Replace with actual API call to backend
   * Expected backend endpoint: POST /api/auth/login
   * Expected response: { user: User, token: string }
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      // MOCK DATA - Replace with actual API call
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(credentials)
      // });
      // const data = await response.json();

      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock response - Remove this and use real API response
      const mockUser: User = {
        id: '123',
        email: credentials.email,
        name: 'User Name',
        token: 'mock_jwt_token_' + Date.now()
      };

      setUser(mockUser);
      // Store token in localStorage for persistence
      localStorage.setItem('authToken', mockUser.token);
      return mockUser;
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Signup function
   * TODO: Replace with actual API call to backend
   * Expected backend endpoint: POST /api/auth/signup
   * Expected response: { user: User, token: string }
   */
  const signup = useCallback(async (data: SignupData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // MOCK DATA - Replace with actual API call
      // const response = await fetch('/api/auth/signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     email: data.email,
      //     password: data.password,
      //     name: data.name
      //   })
      // });
      // const responseData = await response.json();

      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock response - Remove this and use real API response
      const mockUser: User = {
        id: '123',
        email: data.email,
        name: data.name,
        token: 'mock_jwt_token_' + Date.now()
      };

      setUser(mockUser);
      localStorage.setItem('authToken', mockUser.token);
      return mockUser;
    } catch (err: any) {
      const errorMessage = err.message || 'Signup failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout function
   * TODO: Send logout request to backend to invalidate token
   * Expected backend endpoint: POST /api/auth/logout
   */
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('authToken');
    
    // TODO: Call backend logout endpoint
    // await fetch('/api/auth/logout', { method: 'POST' });
  }, []);

  return {
    user,
    isLoading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!user
  };
};
