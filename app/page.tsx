/**
 * IntraViewer - Landing Page
 * 
 * Comprehensive landing page inspired by myinterviewpractice.com
 * Features hero section, benefits, testimonials, and call-to-action.
 */

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Play, 
  Users, 
  Brain, 
  Target, 
  Clock, 
  Trophy, 
  Star,
  CheckCircle,
  Mic,
  Video,
  BarChart3,
  Zap
} from 'lucide-react';

/**
 * Landing Page Component
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-gray-50 text-gray-800 overflow-hidden">
      
      {/* Hero Section */}
      <section className="pt-12 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-sky-100 border border-sky-200 rounded-full text-sky-700 text-sm font-medium">
              Trusted by 100,000+ Job Seekers
            </span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-8 text-gray-800 leading-tight">
            Get hired faster with our{' '}
            <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
              AI interview practice tool
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Ace any job interview with unlimited mock interviews, tailored feedback, and an interactive interview simulator.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white text-lg px-8 py-4 shadow-lg">
                Start Practicing Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-sky-600 border-sky-300 hover:bg-sky-50 text-lg px-8 py-4">
                Learn More
                <Play className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Why IntraViewer Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Why IntraViewer is the best interview prep tool
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mb-6">
                <Mic className="w-6 h-6 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Unlimited Mock Interviews</h3>
              <p className="text-gray-600 mb-6">
                Take virtual interview practice sessions for any position with on-demand, real-world simulations.
              </p>
              <Link href="/auth/signup" className="text-sky-600 hover:text-sky-700 font-medium inline-flex items-center">
                Learn More <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                <Video className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Real Interview Pressure</h3>
              <p className="text-gray-600 mb-6">
                Use our job interview simulator to practice interviews using your webcam. Experience the pressure of a real interview and gain confidence.
              </p>
              <Link href="/auth/signup" className="text-sky-600 hover:text-sky-700 font-medium inline-flex items-center">
                Start Practicing Now <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">AI-Powered Feedback</h3>
              <p className="text-gray-600 mb-6">
                Get personalized insights on filler words, tone, confidence, and more through our AI-powered interview practice tool.
              </p>
              <Link href="/auth/signup" className="text-sky-600 hover:text-sky-700 font-medium inline-flex items-center">
                Improve Your Skills <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Level up with online interview prep
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience our transformative interview training that accelerates the hiring process, and propels your career forward.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-sky-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Build Interview Confidence</h3>
              <p className="text-gray-600 text-sm">
                From entry-level to executive roles, practice for any interview type with realistic, tailored questions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Get Hired Faster</h3>
              <p className="text-gray-600 text-sm">
                Cut preparation time in half by rehearsing key interview scenarios, boosting your chances of landing your dream job.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Land the Job You Want</h3>
              <p className="text-gray-600 text-sm">
                Prepare answers that make hiring managers eager to hire you. Build skills that lead to job offers.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Develop Lifelong Skills</h3>
              <p className="text-gray-600 text-sm">
                Perfect your techniques now and open doors to better opportunities and higher earnings throughout your career.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              How job seekers are landing jobs with our tool
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "I've tried other interview prep tools, but this one stands out. The AI generated questions and practice scenarios made me feel ready."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-sky-400 to-indigo-400 rounded-full flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div>
                  <div className="text-gray-800 font-medium">Siena Everly</div>
                  <div className="text-gray-500 text-sm">Content Strategist</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "This platform was a lifesaver for my first big interview. The mock interviews felt real because of the quality of the questions."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-sky-400 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div>
                  <div className="text-gray-800 font-medium">Ashley Moore</div>
                  <div className="text-gray-500 text-sm">Student at Boston University</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "The AI feedback helped me identify my weak points and improve my communication skills. Got the job on my second interview!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div>
                  <div className="text-gray-800 font-medium">Marcus Chen</div>
                  <div className="text-gray-500 text-sm">Software Engineer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Feedback Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Get interview feedback powered by AI
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Gain valuable insight with AI-powered feedback. Get scores for filler words, tone, confidence, and much more.
          </p>
          
          <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-12 shadow-sm">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-sky-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Performance Analytics</h3>
                <p className="text-gray-600 text-sm">Track your progress with detailed performance metrics and insights.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Speech Analysis</h3>
                <p className="text-gray-600 text-sm">Get feedback on filler words, pace, tone, and speaking clarity.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Content Quality</h3>
                <p className="text-gray-600 text-sm">Analyze answer structure, relevance, and professional language usage.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Start practicing today and land your dream job
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Try our mock interview tool for free today. Start practicing and improving your skills immediately.
          </p>
          
          <Link href="/auth/signup">
            <Button size="lg" className="bg-sky-600 hover:bg-sky-700 text-white text-lg px-12 py-4 shadow-lg">
              Sign Up - It's Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold text-sky-600 mb-4">IntraViewer</div>
              <p className="text-gray-600 text-sm">
                The leading AI-powered interview practice platform helping job seekers land their dream jobs.
              </p>
            </div>
            
            <div>
              <h3 className="text-gray-800 font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><Link href="/auth/signup" className="hover:text-sky-600 transition">Job Seekers</Link></li>
                <li><Link href="/auth/login" className="hover:text-sky-600 transition">Enterprise</Link></li>
                <li><Link href="#" className="hover:text-sky-600 transition">Pricing</Link></li>
                <li><Link href="#" className="hover:text-sky-600 transition">Features</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-gray-800 font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><Link href="#" className="hover:text-sky-600 transition">Help Center</Link></li>
                <li><Link href="#" className="hover:text-sky-600 transition">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-sky-600 transition">FAQs</Link></li>
                <li><Link href="#" className="hover:text-sky-600 transition">Tutorials</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-gray-800 font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><Link href="#" className="hover:text-sky-600 transition">About</Link></li>
                <li><Link href="#" className="hover:text-sky-600 transition">Blog</Link></li>
                <li><Link href="#" className="hover:text-sky-600 transition">Careers</Link></li>
                <li><Link href="#" className="hover:text-sky-600 transition">Press</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2025 IntraViewer. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-500 hover:text-sky-600 transition text-sm">Privacy Policy</Link>
              <Link href="#" className="text-gray-500 hover:text-sky-600 transition text-sm">Terms of Service</Link>
              <Link href="#" className="text-gray-500 hover:text-sky-600 transition text-sm">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
