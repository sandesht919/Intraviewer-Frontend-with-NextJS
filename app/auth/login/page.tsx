/**
 * Login Page
 * 
 * User authentication page.
 * Allows existing users to sign in with email and password.
 * 
 * Features:
 * - Email validation
 * - Password validation (minimum 6 characters)
 * - Form submission with error handling
 * - Link to signup for new users
 * 
 * TODO: Connect to backend authentication API
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail, Lock, AlertCircle, Loader, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { RouteGuard } from '@/components/guards/RouteGuard';

/**
 * Login component
 * 
 * Handles user authentication and redirects to:
 * 1. The page they were trying to access (via 'redirect' query param)
 * 2. Interview preparation page (default)
 */
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error: authError, clearError } = useAuth();



  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);


    
  

  // Clear auth error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  /**
   * Validate form inputs
   * Returns true if all validations pass
   */
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   * Validates input and calls login function
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      // Call login function from useAuth hook
      await login({
        email,
        password
      });

      // Show success state briefly
      setIsSuccess(true);

      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push('/dashboard');
      }, 800);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please try again.');
      setIsSuccess(false);
    }
  };

  return (
    <RouteGuard requireAuth={false} redirectTo="/">
      <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">

        {/* Login Card */}
        <div className="relative w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Sign in to IntraViewer and continue your interview preparation
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
            {/* Success Alert */}
            {isSuccess && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-300 text-sm font-semibold">Login successful!</p>
                  <p className="text-green-400/80 text-xs mt-1">Redirecting you now...</p>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {!isSuccess && (loginError || authError) && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">
                  {loginError || authError}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      // Clear error when user starts typing
                      if (errors.email) {
                        setErrors({ ...errors, email: '' });
                      }
                    }}
                    placeholder="your@email.com"
                    className={`
                      w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg
                      text-gray-900 placeholder-gray-500 transition-all
                      focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                      ${errors.email ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'}
                    `}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      // Clear error when user starts typing
                      if (errors.password) {
                        setErrors({ ...errors, password: '' });
                      }
                    }}
                    placeholder="••••••••"
                    className={`
                      w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg
                      text-gray-900 placeholder-gray-500 transition-all
                      focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                      ${errors.password ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'}
                    `}
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>
                )}
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded bg-white border-gray-300 text-blue-500"
                  />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-gray-600 hover:text-blue-600 transition"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </div>

          {/* Sign Up Link */}
          <p className="text-center mt-6 text-slate-300">
            Don't have an account?{' '}
            <Link
              href="/auth/signup"
              className="text-blue-400 hover:text-blue-300 font-semibold transition"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </RouteGuard>
  );
}
