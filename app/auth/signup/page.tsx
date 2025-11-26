/**
 * Signup Page
 * 
 * User registration page for creating a new account.
 * 
 * Features:
 * - Full name, email, password input
 * - Password strength indicator
 * - Password confirmation check
 * - Terms acceptance checkbox
 * - Form validation with error messages
 * - Link to login page for existing users
 * 
 * TODO: Connect to backend registration API
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail, Lock, User, AlertCircle, Loader, Check } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

/**
 * Signup component
 * 
 * TODO: After successful signup, redirect to email verification or interview preparation
 */
export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading, error: authError } = useAuth();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [signupError, setSignupError] = useState<string | null>(null);

  /**
   * Check password strength
   * Returns strength level: weak, medium, strong
   */
  const getPasswordStrength = (pwd: string) => {
    if (pwd.length < 6) return 'weak';
    if (pwd.length < 10) return 'medium';
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[!@#$%]/.test(pwd)) {
      return 'strong';
    }
    return 'medium';
  };

  /**
   * Validate form inputs
   * Returns true if all validations pass
   */
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

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

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms acceptance validation
    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   * Validates input and calls signup function
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (!validateForm()) {
      return;
    }

    try {
      // Call signup function from useAuth hook
      await signup({
        name,
        email,
        password,
        confirmPassword
      });

      // TODO: Replace with actual redirect
      // After signup, user might need email verification or direct to interview setup
      router.push('/interview/prepare');
    } catch (err: any) {
      setSignupError(err.message || 'Signup failed. Please try again.');
    }
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColors = {
    weak: 'bg-red-500',
    medium: 'bg-yellow-500',
    strong: 'bg-green-500'
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-12">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Signup Card */}
      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Get Started
          </h1>
          <p className="text-slate-400">
            Create your IntraViewer account and master your interview skills
          </p>
        </div>

        {/* Form Container */}
        <div className="backdrop-blur-md bg-slate-900/30 border border-slate-700 rounded-2xl p-8 shadow-2xl">
          {/* Error Alert */}
          {(signupError || authError) && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">
                {signupError || authError}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) {
                      setErrors({ ...errors, name: '' });
                    }
                  }}
                  placeholder="John Doe"
                  className={`
                    w-full pl-10 pr-4 py-2.5 bg-slate-800 border rounded-lg
                    text-white placeholder-slate-500 transition-all
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                    ${errors.name ? 'border-red-500' : 'border-slate-600 hover:border-slate-500'}
                  `}
                />
              </div>
              {errors.name && (
                <p className="text-red-400 text-xs mt-1.5">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors({ ...errors, email: '' });
                    }
                  }}
                  placeholder="your@email.com"
                  className={`
                    w-full pl-10 pr-4 py-2.5 bg-slate-800 border rounded-lg
                    text-white placeholder-slate-500 transition-all
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                    ${errors.email ? 'border-red-500' : 'border-slate-600 hover:border-slate-500'}
                  `}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors({ ...errors, password: '' });
                    }
                  }}
                  placeholder="••••••••"
                  className={`
                    w-full pl-10 pr-4 py-2.5 bg-slate-800 border rounded-lg
                    text-white placeholder-slate-500 transition-all
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                    ${errors.password ? 'border-red-500' : 'border-slate-600 hover:border-slate-500'}
                  `}
                />
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`
                          flex-1 h-1.5 rounded-full transition-colors
                          ${
                            (passwordStrength === 'weak' && i === 1) ||
                            (passwordStrength === 'medium' && i <= 2) ||
                            (passwordStrength === 'strong' && i <= 3)
                              ? strengthColors[passwordStrength]
                              : 'bg-slate-700'
                          }
                        `}
                      ></div>
                    ))}
                  </div>
                  <p className={`
                    text-xs font-medium
                    ${passwordStrength === 'weak' ? 'text-red-400' : ''}
                    ${passwordStrength === 'medium' ? 'text-yellow-400' : ''}
                    ${passwordStrength === 'strong' ? 'text-green-400' : ''}
                  `}>
                    Password Strength: {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                  </p>
                </div>
              )}

              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) {
                        setErrors({ ...errors, confirmPassword: '' });
                      }
                    }}
                    placeholder="••••••••"
                    className={`
                      w-full pl-10 pr-10 py-2.5 bg-slate-800 border rounded-lg
                      text-white placeholder-slate-500 transition-all
                      focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                      ${errors.confirmPassword ? 'border-red-500' : 'border-slate-600 hover:border-slate-500'}
                    `}
                  />
                  {/* Match indicator */}
                  {confirmPassword && password === confirmPassword && (
                    <Check className="absolute right-3 top-3.5 w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1.5">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms Acceptance */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => {
                    setAgreeToTerms(e.target.checked);
                    if (errors.terms) {
                      setErrors({ ...errors, terms: '' });
                    }
                  }}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-blue-500 mt-1 flex-shrink-0"
                />
                <span className="text-slate-400 text-sm">
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue-400 hover:text-blue-300">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.terms && (
                <p className="text-red-400 text-xs mt-1.5">{errors.terms}</p>
              )}
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
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </div>

        {/* Login Link */}
        <p className="text-center mt-6 text-slate-300">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="text-blue-400 hover:text-blue-300 font-semibold transition"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
