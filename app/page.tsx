/**
 * IntraViewer - Landing Page
 * 
 * Simple, clean landing page for the interview practice platform.
 * Shows key information and directs users to login or signup.
 */

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

/**
 * Landing Page Component
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">
            IntraViewer
          </div>
          <div className="flex gap-3">
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <h1 className="text-5xl font-bold mb-6 text-gray-900">
            Practice Interviews with AI
          </h1>
          <p className="text-lg text-gray-600 mb-10">
            Describe a job role, get AI-generated questions, and practice with real-time feedback.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-blue-600 border-blue-500 hover:bg-blue-500/10">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 px-4 text-center text-gray-500 text-xs">
        <p>&copy; 2025 IntraViewer</p>
      </footer>
    </div>
  );
}
