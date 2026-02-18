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
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Mail, Lock, AlertCircle, Loader, CheckCircle, Check } from 'lucide-react';
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
      <div className="min-h-screen bg-[#e1e1db] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-start pt-8">
          
          {/* Left Side - Image and Text */}
          <div className="hidden lg:flex flex-col items-center justify-start pt-12">
            <Image
              src="/login.png"
              alt="Interview Practice Illustration"
              width={400}
              height={400}
              className="mb-6"
              priority
            />
            <div className="text-center max-w-md">
              <h2 className="text-2xl font-bold text-black mb-4">
                Continue Your Journey
              </h2>
              <p className="text-stone-600 mb-6">
                Pick up where you left off. Review your progress, practice more interviews, and keep improving your skills.
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-stone-500">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-700" />
                  <span>Track Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-700" />
                  <span>View History</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-700" />
                  <span>Get Insights</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="relative w-full max-w-sm mx-auto lg:ml-auto lg:mr-4 pt-8">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-black mb-1">
              Welcome Back
            </h1>
            <p className="text-stone-500 text-sm">
              Sign in to continue your interview preparation
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl p-6">
            {/* Success Alert */}
            {isSuccess && (
              <div className="mb-4 p-3 bg-emerald-50/60 border border-emerald-200/50 rounded-lg flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-emerald-700 text-sm font-semibold">Login successful!</p>
                  <p className="text-emerald-600 text-xs mt-1">Redirecting you now...</p>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {!isSuccess && (loginError || authError) && (
              <div className="mb-4 p-3 bg-red-50/60 border border-red-200/50 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">
                  {loginError || authError}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
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
                      w-full pl-9 pr-3 py-2 bg-white/50 border rounded-lg text-sm
                      text-black placeholder-stone-500 transition-all
                      focus:outline-none focus:ring-1 focus:ring-amber-600/50 focus:border-amber-600/50 focus:bg-white/70
                      ${errors.email ? 'border-red-400' : 'border-amber-700/30 hover:border-amber-700/50'}
                    `}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-black mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
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
                      w-full pl-9 pr-3 py-2 bg-white/50 border rounded-lg text-sm
                      text-black placeholder-stone-500 transition-all
                      focus:outline-none focus:ring-1 focus:ring-amber-600/50 focus:border-amber-600/50 focus:bg-white/70
                      ${errors.password ? 'border-red-400' : 'border-amber-700/30 hover:border-amber-700/50'}
                    `}
                  />
                </div>
                {errors.password && (
                  <p className="text-red-600 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-3.5 h-3.5 rounded bg-white/50 border-amber-700/30 text-amber-700"
                  />
                  <span className="text-stone-600">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-stone-600 hover:text-amber-700 transition"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-700 hover:bg-amber-800 text-white font-medium py-2 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
          <p className="text-center mt-4 text-stone-600 text-sm">
            Don't have an account?{' '}
            <Link
              href="/auth/signup"
              className="text-amber-700 hover:text-amber-800 font-medium transition"
            >
              Sign up here
            </Link>
          </p>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
