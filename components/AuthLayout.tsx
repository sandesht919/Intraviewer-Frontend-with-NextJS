'use client';

import { useAuthStore } from '@/lib/stores/authStore';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthLayoutProps {
  children: React.ReactNode;
  isDrawerOpen?: boolean;
}

const AuthLayout = ({ children, isDrawerOpen = false }: AuthLayoutProps) => {
  const { isAuthenticated, refreshAccessToken } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle authentication state changes after mount
  useEffect(() => {
    if (mounted) {
      // Check if user is on a protected route but not authenticated
      const protectedRoutes = ['/dashboard', '/interview', '/profile', '/settings', '/analytics'];
      const isOnProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
      
      if (isOnProtectedRoute && !isAuthenticated) {
        // Store the current path to redirect back after login
        const loginUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
        router.push(loginUrl);
      }
    }
  }, [isAuthenticated, mounted, pathname, router]);

  // Automatic token refresh - on first load and every 12 minutes
  useEffect(() => {
    // Only set up refresh if user is authenticated
    if (!isAuthenticated) return;

    // Refresh token immediately on first load
    const refreshImmediately = async () => {
      try {
        console.log('🔄 Refreshing access token on first load...');
        await refreshAccessToken();
        console.log('✅ Access token refreshed successfully');
      } catch (error) {
        console.error('❌ Failed to refresh token on first load:', error);
      }
    };

    refreshImmediately();

    // Then refresh every 12 minutes
    const interval = setInterval(async () => {
      try {
        console.log('🔄 Refreshing access token...');
        await refreshAccessToken();
        console.log('✅ Access token refreshed successfully');
      } catch (error) {
        console.error('❌ Failed to refresh token:', error);
        // Token refresh failed - user will be logged out by the store
      }
    }, 12 * 60 * 1000); // 12 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshAccessToken]);

  // Calculate dynamic margin based on drawer state and authentication
  const getMainContentStyle = () => {
    // Landing page should not have top padding - it handles its own layout
    if (pathname === '/') {
      return "min-h-screen";
    }
    
    if (!isAuthenticated) {
      return "";
    }
    
    // For authenticated users, adjust left margin based on drawer state
    // Only apply left margin on desktop (lg and up)
    const leftMargin = isDrawerOpen ? "lg:ml-64" : "lg:ml-16";
    return `transition-all duration-300 ease-in-out ${leftMargin}`;
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className="pt-20">{children}</div>;
  }

  return (
    <div className={getMainContentStyle()}>
      {children}
    </div>
  );
};


export default AuthLayout;