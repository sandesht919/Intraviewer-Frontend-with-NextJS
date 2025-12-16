/**
 * Next.js Middleware for Route Protection
 *
 * This middleware runs before every request and protects routes
 * that require authentication. It checks for auth tokens in cookies/localStorage
 * and redirects unauthenticated users to the login page.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  "/", // Home page
  "/about", // About page
  "/auth/login", // Login page
  "/auth/signup", // Signup page
];

/**
 * Routes that should redirect to dashboard if already authenticated
 */
const AUTH_ROUTES = ["/auth/login", "/auth/signup"];

/**
 * Check if a path matches any of the allowed routes
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => {
    // Exact match or starts with the route (for nested paths)
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

/**
 * Check if user is authenticated by looking for auth token in cookies
 */
function isAuthenticated(request: NextRequest): boolean {
  // Check for auth token in cookies
  const authCookie = request.cookies.get("auth-token");

  // Also check localStorage via custom header (set by client)
  const authHeader = request.headers.get("x-auth-token");

  return !!(authCookie || authHeader);
}

/**
 * Get authentication state from localStorage (stored by Zustand persist)
 */
function getAuthFromStorage(request: NextRequest): boolean {
  // Since middleware runs on server, we need to check cookies
  // The client will set a cookie when auth state changes
  const authStorage = request.cookies.get("auth-storage");

  if (!authStorage) {
    return false;
  }

  try {
    const authData = JSON.parse(authStorage.value);
    return (
      authData?.state?.isAuthenticated === true &&
      !!authData?.state?.accessToken
    );
  } catch {
    return false;
  }
}

/**
 * Middleware function
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user is authenticated
  const userIsAuthenticated = getAuthFromStorage(request);

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (userIsAuthenticated && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If route is public, allow access
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // If user is not authenticated and trying to access protected route
  if (!userIsAuthenticated) {
    // Store the attempted URL to redirect back after login
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated and accessing a protected route
  return NextResponse.next();
}

/**
 * Configure which routes this middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
