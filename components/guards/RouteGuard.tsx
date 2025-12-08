/**
 * Route Guard Component
 * 
 * This component provides client-side route protection.
 * It checks authentication state and redirects unauthenticated users.
 * Use this to wrap protected pages for additional security.
 */

'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';

interface RouteGuardProps {
  children: ReactNode;
  /**
   * If true, only authenticated users can access
   * If false, only unauthenticated users can access (e.g., login page)
   */
  requireAuth?: boolean;
  /**
   * Path to redirect to if access is denied
   */
  redirectTo?: string;
  /**
   * Show loading state while checking authentication
   */
  loadingComponent?: ReactNode;
}

/**
 * RouteGuard Component
 * 
 * Usage:
 * ```tsx
 * // Protect a page that requires authentication
 * <RouteGuard requireAuth={true}>
 *   <YourProtectedPage />
 * </RouteGuard>
 * 
 * // Protect auth pages (redirect if already logged in)
 * <RouteGuard requireAuth={false} redirectTo="/">
 *   <LoginPage />
 * </RouteGuard>
 * ```
 */
export function RouteGuard({
  children,
  requireAuth = true,
  redirectTo,
  loadingComponent,
}: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Don't redirect while still loading auth state
    if (isLoading) return;

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      const loginUrl = redirectTo || `/auth/login?redirect=${encodeURIComponent(pathname)}`;
      router.push(loginUrl);
      return;
    }

    // If authentication is NOT required (e.g., login page) but user IS authenticated
    if (!requireAuth && isAuthenticated) {
      const homeUrl = redirectTo || '/';
      router.push(homeUrl);
      return;
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, pathname, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return loadingComponent || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If auth requirement doesn't match, don't render children
  // (they will be redirected by useEffect)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (!requireAuth && isAuthenticated) {
    return null;
  }

  // Render children if auth state matches requirement
  return <>{children}</>;
}

/**
 * Higher-order component version of RouteGuard
 * 
 * Usage:
 * ```tsx
 * const ProtectedPage = withRouteGuard(YourPage, { requireAuth: true });
 * ```
 */
export function withRouteGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<RouteGuardProps, 'children'> = {}
) {
  return function GuardedComponent(props: P) {
    return (
      <RouteGuard {...options}>
        <Component {...props} />
      </RouteGuard>
    );
  };
}
