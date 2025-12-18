'use client';

import { useAuthStore } from '@/lib/stores/authStore';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthLayoutProps {
  children: React.ReactNode;
  isDrawerOpen?: boolean;
}

const AuthLayout = ({ children, isDrawerOpen = false }: AuthLayoutProps) => {
  const { isAuthenticated } = useAuthStore();
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
        // Force navigation to login if user was logged out
        router.push('/auth/login');
      }
    }
  }, [isAuthenticated, mounted, pathname, router]);

  // Calculate dynamic margin based on drawer state and authentication
  const getMainContentStyle = () => {
    if (!isAuthenticated) {
      return "pt-20 min-h-screen";
    }
    
    // For authenticated users, adjust left margin based on drawer state
    // Only apply left margin on desktop (lg and up)
    const leftMargin = isDrawerOpen ? "lg:ml-64" : "lg:ml-16";
    return `pt-20 min-h-screen transition-all duration-300 ease-in-out ${leftMargin}`;
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