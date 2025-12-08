/**
 * Cookie utilities for authentication
 * 
 * These utilities help sync authentication state between localStorage (Zustand)
 * and cookies (for Next.js middleware to read on server-side)
 */

/**
 * Set authentication cookie
 */
export function setAuthCookie(isAuthenticated: boolean, accessToken: string | null) {
  if (typeof window === 'undefined') return;

  const authData = {
    state: {
      isAuthenticated,
      accessToken,
    }
  };

  // Set cookie with auth state
  // This cookie will be read by middleware
  const cookieValue = JSON.stringify(authData);
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds

  document.cookie = `auth-storage=${encodeURIComponent(cookieValue)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * Clear authentication cookie
 */
export function clearAuthCookie() {
  if (typeof window === 'undefined') return;

  // Set cookie with past expiry date to delete it
  document.cookie = 'auth-storage=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

/**
 * Get authentication state from cookie
 */
export function getAuthFromCookie(): { isAuthenticated: boolean; accessToken: string | null } {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, accessToken: null };
  }

  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-storage='));

  if (!authCookie) {
    return { isAuthenticated: false, accessToken: null };
  }

  try {
    const cookieValue = authCookie.split('=')[1];
    const authData = JSON.parse(decodeURIComponent(cookieValue));
    return {
      isAuthenticated: authData?.state?.isAuthenticated || false,
      accessToken: authData?.state?.accessToken || null,
    };
  } catch {
    return { isAuthenticated: false, accessToken: null };
  }
}
