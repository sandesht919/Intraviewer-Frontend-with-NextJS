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
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Mail, Lock, User, AlertCircle, Loader, Check } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { RouteGuard } from '@/components/guards/RouteGuard';

/**
 * Signup component
 * 
 * TODO: After successful signup, redirect to email verification or interview preparation
 */
export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading, error: authError } = useAuth();

  // Form state
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
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

    // Firstname validation
    if (!firstname.trim()) {
      newErrors.firstname = 'First name is required';
    } else if (firstname.trim().length < 2) {
      newErrors.firstname = 'First name must be at least 2 characters';
    }

    // Lastname validation
    if (!lastname.trim()) {
      newErrors.lastname = 'Last name is required';
    } else if (lastname.trim().length < 2) {
      newErrors.lastname = 'Last name must be at least 2 characters';
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
        name: `${firstname} ${lastname}`.trim(),
        email,
        password,
        confirmPassword
      });

      // Redirect after successful signup (same as login)
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
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
    <RouteGuard requireAuth={false} redirectTo="/dashboard">
      <div className="min-h-screen bg-[#e1e1db] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Image and Text */}
          <div className="hidden lg:flex flex-col items-center justify-center">
            <Image
              src="/signup.png"
              alt="Interview Practice Illustration"
              width={450}
              height={450}
              className="mb-8"
              priority
            />
            <div className="text-center max-w-md">
              <h2 className="text-2xl font-bold text-black mb-4">
                Master Your Interview Skills
              </h2>
              <p className="text-stone-600 mb-6">
                Practice with AI-powered mock interviews tailored to your target role. Get instant feedback, improve your responses, and land your dream job.
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-stone-500">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-700" />
                  <span>AI Feedback</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-700" />
                  <span>Unlimited Practice</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-700" />
                  <span>Free to Start</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className="relative w-full max-w-md mx-auto lg:ml-auto lg:mr-0">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-black mb-1">
              Create Your Account
            </h1>
            <p className="text-stone-500 text-sm">
              Join Intraviewer and start practicing today
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl p-6">
            {/* Error Alert */}
            {(signupError || authError) && (
              <div className="mb-4 p-3 bg-red-50/60 border border-red-200/50 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">
                  {signupError || authError}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* First Name Field */}
              <div>
                <label htmlFor="firstname" className="block text-sm font-medium text-black mb-1">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
                  <input
                    id="firstname"
                    type="text"
                    value={firstname}
                    onChange={(e) => {
                      setFirstname(e.target.value);
                      if (errors.firstname) {
                        setErrors({ ...errors, firstname: '' });
                      }
                    }}
                    placeholder="John"
                    className={`
                      w-full pl-9 pr-3 py-2 bg-white/50 border rounded-lg text-sm
                      text-black placeholder-stone-500 transition-all
                      focus:outline-none focus:ring-1 focus:ring-amber-600/50 focus:border-amber-600/50 focus:bg-white/70
                      ${errors.firstname ? 'border-red-400' : 'border-amber-700/30 hover:border-amber-700/50'}
                    `}
                  />
                </div>
                {errors.firstname && (
                  <p className="text-red-600 text-xs mt-1">{errors.firstname}</p>
                )}
              </div>

              {/* Last Name Field */}
              <div>
                <label htmlFor="lastname" className="block text-sm font-medium text-black mb-1">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
                  <input
                    id="lastname"
                    type="text"
                    value={lastname}
                    onChange={(e) => {
                      setLastname(e.target.value);
                      if (errors.lastname) {
                        setErrors({ ...errors, lastname: '' });
                      }
                    }}
                    placeholder="Doe"
                    className={`
                      w-full pl-9 pr-3 py-2 bg-white/50 border rounded-lg text-sm
                      text-black placeholder-stone-500 transition-all
                      focus:outline-none focus:ring-1 focus:ring-amber-600/50 focus:border-amber-600/50 focus:bg-white/70
                      ${errors.lastname ? 'border-red-400' : 'border-amber-700/30 hover:border-amber-700/50'}
                    `}
                  />
                </div>
                {errors.lastname && (
                  <p className="text-red-600 text-xs mt-1">{errors.lastname}</p>
                )}
              </div>

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

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`
                            flex-1 h-1 rounded-full transition-colors
                            ${
                              (passwordStrength === 'weak' && i === 1) ||
                              (passwordStrength === 'medium' && i <= 2) ||
                              (passwordStrength === 'strong' && i <= 3)
                                ? strengthColors[passwordStrength]
                                : 'bg-stone-300'
                            }
                          `}
                        ></div>
                      ))}
                    </div>
                    <p className={`
                      text-xs
                      ${passwordStrength === 'weak' ? 'text-red-600' : ''}
                      ${passwordStrength === 'medium' ? 'text-yellow-600' : ''}
                      ${passwordStrength === 'strong' ? 'text-green-600' : ''}
                    `}>
                      {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                    </p>
                  </div>
                )}

                {errors.password && (
                  <p className="text-red-600 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
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
                        w-full pl-9 pr-8 py-2 bg-white/50 border rounded-lg text-sm
                        text-black placeholder-stone-500 transition-all
                        focus:outline-none focus:ring-1 focus:ring-amber-600/50 focus:border-amber-600/50 focus:bg-white/70
                        ${errors.confirmPassword ? 'border-red-400' : 'border-amber-700/30 hover:border-amber-700/50'}
                      `}
                    />
                    {/* Match indicator */}
                    {confirmPassword && password === confirmPassword && (
                      <Check className="absolute right-3 top-2.5 w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms Acceptance */}
              <div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => {
                      setAgreeToTerms(e.target.checked);
                      if (errors.terms) {
                        setErrors({ ...errors, terms: '' });
                      }
                    }}
                    className="w-3.5 h-3.5 rounded bg-white/50 border-amber-700/30 text-amber-700 mt-0.5 shrink-0"
                  />
                  <span className="text-stone-600 text-xs">
                    I agree to the{' '}
                    <Link href="/terms" className="text-amber-700 hover:text-amber-800">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-amber-700 hover:text-amber-800">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-red-600 text-xs mt-1">{errors.terms}</p>
                )}
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
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </div>

          {/* Login Link */}
          <p className="text-center mt-4 text-stone-600 text-sm">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-amber-700 hover:text-amber-800 font-medium transition"
            >
              Sign in here
            </Link>
          </p>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
