/**
 * API Configuration
 * 
 * Centralized configuration for API endpoints and utilities
 */

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      SIGNUP: '/auth/signup',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
    },
  },
  TIMEOUT: 10000, // 10 seconds
};

/**
 * API Error class for better error handling
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Helper function to handle API responses
 */
export async function handleAPIResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      detail: `HTTP ${response.status}: ${response.statusText}`,
    }));

    throw new APIError(
      errorData.detail || errorData.message || 'An error occurred',
      response.status,
      errorData
    );
  }

  return response.json();
}
