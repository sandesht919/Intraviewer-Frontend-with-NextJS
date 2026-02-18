/**
 * IntraViewer - Landing Page
 * 
 * Modern dark theme landing page inspired by Code Wiki
 * Features hero section, 3D cube, featured sections, and glassmorphism effects.
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Search,
  Brain,
  MessageSquare,
  Zap,
  BarChart3,
  Star,
  Sparkles,
  Grid3X3,
  RefreshCw,
  Code,
} from 'lucide-react';
import { useState, useEffect } from 'react';

// Featured interview types data
const featuredInterviews = [
  {
    name: 'Technical Interview',
    icon: Code,
    description: 'Practice coding questions and system design with AI feedback.',
    stars: '12.5k',
  },
  {
    name: 'Behavioral Interview',
    icon: MessageSquare,
    description: 'Master STAR method responses for common behavioral questions.',
    stars: '8.3k',
  },
  {
    name: 'Case Study',
    icon: Brain,
    description: 'Sharpen your analytical skills with business case simulations.',
    stars: '6.7k',
  },
  {
    name: 'Product Management',
    icon: Grid3X3,
    description: 'Practice product sense, strategy, and execution questions.',
    stars: '5.2k',
  },
  {
    name: 'Data Science',
    icon: BarChart3,
    description: 'SQL, ML concepts, and statistical analysis practice.',
    stars: '9.1k',
  },
  {
    name: 'Leadership',
    icon: Zap,
    description: 'Executive presence and strategic thinking assessments.',
    stars: '4.8k',
  },
];

/**
 * Landing Page Component
 */
export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#e1e1db] text-black overflow-hidden">
      
      {/* Navbar */}
      

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-100/50 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-200/40 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
            IntraViewer
          </h1>
          
          <p className="text-lg md:text-xl text-black mb-12 max-w-2xl mx-auto leading-relaxed">
            A new perspective on interview preparation for the AI era.
            <br />
            AI-powered practice sessions, always personalized.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Find your interview type..."
              className="w-full px-6 py-4 bg-stone-200/80 border border-amber-700 rounded-full text-black placeholder-black/50 focus:outline-none focus:border-amber-600 text-lg pr-14"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-orange-100 hover:bg-orange-200 rounded-full transition">
              <Search className="w-5 h-5 text-amber-700" />
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-amber-700 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-amber-700 rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Hero Illustration Section */}
      <section className="relative py-20 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-100/50 to-transparent pointer-events-none"></div>
        <div className="relative">
          <Image
            src="/interview-3.png"
            alt="AI Interview Practice"
            width={800}
            height={500}
            className="rounded-2xl shadow-xl"
            priority
          />
        </div>
      </section>

      {/* Featured Interview Types */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-12">Featured Interview Types</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredInterviews.map((interview, idx) => (
              <Link 
                key={idx} 
                href="/auth/signup"
                className="group relative bg-stone-100 border border-amber-700 rounded-2xl p-6 hover:bg-orange-50 hover:border-amber-600 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-black group-hover:text-amber-700 transition">
                    {interview.name}
                  </h3>
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <interview.icon className="w-5 h-5 text-amber-700" />
                  </div>
                </div>
                
                <p className="text-black text-sm mb-6 leading-relaxed">
                  {interview.description}
                </p>
                
                <div className="flex items-center gap-2 text-black text-sm">
                  <Star className="w-4 h-4" />
                  <span>{interview.stars}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Try with Your Profile Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-2">
                Try it with your own
                <br />
                resume
              </h2>
              <span className="inline-block px-4 py-1 bg-orange-100 rounded-full text-sm text-amber-700 mb-6">
                Coming Soon
              </span>
              
              <p className="text-black text-lg mb-8 leading-relaxed">
                Stop guessing. Start practicing. Upload your resume and get a fully personalized interview experience that adapts to your background. No more generic questions. Ever.
              </p>
              
              <button className="group flex items-center gap-4 bg-amber-700 text-white px-6 py-4 rounded-xl hover:bg-amber-800 transition font-medium">
                <Sparkles className="w-5 h-5 text-white" />
                Notify me when available
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
            </div>
            
            <div className="relative flex items-center justify-center">
              <Image
                src="/interview-2.png"
                alt="Resume Interview Practice"
                width={400}
                height={400}
                className="rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Read Your Interview Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ace your interview
                <br />
                on the first try
              </h2>
              
              <p className="text-black text-lg mb-10">
                Interview preparation that works for you, not the other way around.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="p-3 bg-orange-100 border border-amber-700 rounded-xl w-fit mb-4">
                    <Grid3X3 className="w-6 h-6 text-amber-700" />
                  </div>
                  <h3 className="font-semibold text-black mb-2">Practice question by question</h3>
                  <p className="text-black text-sm">Focus on questions you need most. Pick a category and dive deeper.</p>
                </div>
                
                <div>
                  <div className="p-3 bg-orange-100 border border-amber-700 rounded-xl w-fit mb-4">
                    <Zap className="w-6 h-6 text-amber-700" />
                  </div>
                  <h3 className="font-semibold text-black mb-2">AI-powered feedback</h3>
                  <p className="text-black text-sm">Get instant, actionable insights to improve your responses.</p>
                </div>
                
                <div>
                  <div className="p-3 bg-orange-100 border border-amber-700 rounded-xl w-fit mb-4">
                    <RefreshCw className="w-6 h-6 text-amber-700" />
                  </div>
                  <h3 className="font-semibold text-black mb-2">Unlimited retries</h3>
                  <p className="text-black text-sm">Practice as many times as you need until you&apos;re confident.</p>
                </div>
                
                <div>
                  <div className="p-3 bg-orange-100 border border-amber-700 rounded-xl w-fit mb-4">
                    <Code className="w-6 h-6 text-amber-700" />
                  </div>
                  <h3 className="font-semibold text-black mb-2">Role-specific questions</h3>
                  <p className="text-black text-sm">Questions tailored to your target role and experience level.</p>
                </div>
              </div>
            </div>
            
            <div className="relative flex items-center justify-center">
              {/* Document-style illustration */}
              <div className="relative">
                <div className="absolute inset-0 bg-orange-300/30 blur-[80px] rounded-full"></div>
                <div className="relative w-80 h-80 border border-amber-700 rounded-2xl bg-gradient-to-br from-orange-100 to-transparent backdrop-blur-sm p-6">
                  <div className="space-y-3">
                    <div className="h-3 bg-orange-400/40 rounded w-3/4"></div>
                    <div className="h-3 bg-orange-300/30 rounded w-full"></div>
                    <div className="h-3 bg-orange-300/30 rounded w-5/6"></div>
                    <div className="h-8 mt-6"></div>
                    <div className="h-3 bg-orange-400/35 rounded w-2/3"></div>
                    <div className="h-3 bg-orange-300/30 rounded w-full"></div>
                    <div className="h-3 bg-orange-300/30 rounded w-4/5"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Talk to Your Practice Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Talk through your answers
              </h2>
              
              <p className="text-black text-lg mb-10">
                Practice answering out loud, get real-time transcription, and receive detailed feedback on your communication. It&apos;s like having an interview coach on call, 24/7.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 border border-amber-700 rounded-xl">
                    <MessageSquare className="w-5 h-5 text-amber-700" />
                  </div>
                  <span className="text-black">Practice with voice recording</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 border border-amber-700 rounded-xl">
                    <Search className="w-5 h-5 text-amber-700" />
                  </div>
                  <span className="text-black">Get instant feedback analysis</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 border border-amber-700 rounded-xl">
                    <Zap className="w-5 h-5 text-amber-700" />
                  </div>
                  <span className="text-black">Low latency, high-quality</span>
                </div>
              </div>
            </div>
            
            <div className="relative flex items-center justify-center">
              <Image
                src="/interview-1.png"
                alt="Voice Interview Practice"
                width={400}
                height={400}
                className="rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to ace your next interview?
          </h2>
          <p className="text-xl text-black mb-12">
            Join thousands of job seekers who landed their dream jobs with IntraViewer.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-amber-700 text-white hover:bg-amber-800 text-lg px-8 py-6">
                Start Practicing Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="border-amber-700 text-black hover:bg-amber-100 text-lg px-8 py-6">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-amber-700 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800 rounded"></div>
                <span className="text-lg font-semibold text-black">IntraViewer</span>
              </div>
              <p className="text-black text-sm">
                AI-powered interview preparation for the modern job seeker.
              </p>
            </div>
            
            <div>
              <h3 className="text-black font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-black text-sm">
                <li><Link href="/auth/signup" className="hover:text-amber-700 transition">Interview Practice</Link></li>
                <li><Link href="#" className="hover:text-amber-700 transition">AI Feedback</Link></li>
                <li><Link href="#" className="hover:text-amber-700 transition">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-black font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-black text-sm">
                <li><Link href="#" className="hover:text-amber-700 transition">Blog</Link></li>
                <li><Link href="#" className="hover:text-amber-700 transition">Guides</Link></li>
                <li><Link href="#" className="hover:text-amber-700 transition">Help Center</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-black font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-black text-sm">
                <li><Link href="#" className="hover:text-amber-700 transition">About</Link></li>
                <li><Link href="#" className="hover:text-amber-700 transition">Careers</Link></li>
                <li><Link href="#" className="hover:text-amber-700 transition">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-amber-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-black text-sm">
              © 2026 IntraViewer. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="text-black hover:text-amber-700 transition text-sm">Privacy</Link>
              <Link href="#" className="text-black hover:text-amber-700 transition text-sm">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
