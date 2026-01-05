/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { API_CONFIG, handleAPIResponse } from '../config/api';
import type { LoginCredentials, SignupData, AuthResponse } from '../types';

const API_BASE_URL = API_CONFIG.BASE_URL;

export class AuthService {
  /**
   * Login user
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    return handleAPIResponse<AuthResponse>(response);
  }

  /**
   * Register new user
   */
  static async signup(data: {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
  }): Promise<{ message: string; data: any }> {
    console.log('Signup request payload:', data); // Debug log
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    return handleAPIResponse<{ message: string; data: any }>(response);
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        refresh_token: refreshToken,
      },
      credentials: 'include',
    });

    return handleAPIResponse<AuthResponse>(response);
  }

  /**
   * Logout user
   */
  static async logout(accessToken: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        //Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('Logout failed:', response.statusText);
    }
  }

  /**
   * Fetch current user data
   */
  static async getCurrentUser(accessToken: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    return handleAPIResponse(response);
  }
}
