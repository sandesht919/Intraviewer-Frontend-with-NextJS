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
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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

  // Refs for GSAP animations
  const heroRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLDivElement>(null);
  const titleLeftRef = useRef<HTMLSpanElement>(null);
  const titleIconRef = useRef<HTMLSpanElement>(null);
  const titleRightRef = useRef<HTMLSpanElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const heroSearchRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const carouselContainerRef = useRef<HTMLDivElement>(null);
  const featuredSectionRef = useRef<HTMLElement>(null);
  const featuredCardsRef = useRef<HTMLDivElement>(null);
  const resumeSectionRef = useRef<HTMLElement>(null);
  const aceSectionRef = useRef<HTMLElement>(null);
  const talkSectionRef = useRef<HTMLElement>(null);
  const ctaSectionRef = useRef<HTMLDivElement>(null);

  // Carousel images
  const carouselImages = [
    { src: '/interview-1.png', title: 'Voice Practice' },
    { src: '/interview-2.png', title: 'Resume Review' },
    { src: '/interview-3.png', title: 'AI Feedback' },
    { src: '/login.png', title: 'Get Started' },
    { src: '/signup.png', title: 'Join Today' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero section entrance animation - split title
      const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
      
      heroTimeline
        // Left title slides in from left
        .fromTo(
          titleLeftRef.current,
          { opacity: 0, x: -80 },
          { opacity: 1, x: 0, duration: 0.8 }
        )
        // Right title slides in from right
        .fromTo(
          titleRightRef.current,
          { opacity: 0, x: 80 },
          { opacity: 1, x: 0, duration: 0.8 },
          '-=0.7'
        )
        // Icon spins and scales in
        .fromTo(
          titleIconRef.current,
          { opacity: 0, scale: 0, rotation: -180 },
          { opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.7)' },
          '-=0.4'
        )
        // Subtitle fades up
        .fromTo(
          heroSubtitleRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.3'
        )
        // Search bar scales in
        .fromTo(
          heroSearchRef.current,
          { opacity: 0, y: 30, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.7 },
          '-=0.4'
        );
      
      // Continuous icon rotation animation
      gsap.to(titleIconRef.current, {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: 'none',
      });

      // Carousel fade in and continuous rotation
      if (carouselContainerRef.current) {
        gsap.fromTo(
          carouselContainerRef.current,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 0.8,
            ease: 'power3.out',
          }
        );

        // Continuous slow rotation of the entire carousel
        gsap.to(carouselRef.current, {
          rotation: 10,
          duration: 8,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
        });
      }

      // Hero image parallax and fade in
      if (heroImageRef.current) {
        gsap.fromTo(
          heroImageRef.current,
          { opacity: 0, y: 80 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            scrollTrigger: {
              trigger: heroImageRef.current,
              start: 'top 85%',
              end: 'top 50%',
              scrub: 1,
            },
          }
        );
      }

      // Featured section header
      if (featuredSectionRef.current) {
        gsap.fromTo(
          featuredSectionRef.current.querySelector('h2'),
          { opacity: 0, x: -50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            scrollTrigger: {
              trigger: featuredSectionRef.current,
              start: 'top 80%',
            },
          }
        );
      }

      // Featured cards stagger animation
      if (featuredCardsRef.current) {
        gsap.fromTo(
          featuredCardsRef.current.children,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            scrollTrigger: {
              trigger: featuredCardsRef.current,
              start: 'top 80%',
            },
          }
        );
      }

      // Resume section animation
      if (resumeSectionRef.current) {
        const resumeContent = resumeSectionRef.current.querySelectorAll('.grid > div');
        gsap.fromTo(
          resumeContent,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            scrollTrigger: {
              trigger: resumeSectionRef.current,
              start: 'top 75%',
            },
          }
        );
      }

      // Ace section animation
      if (aceSectionRef.current) {
        const aceContent = aceSectionRef.current.querySelectorAll('.grid > div');
        gsap.fromTo(
          aceContent,
          { opacity: 0, x: (i) => (i === 0 ? -60 : 60) },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            stagger: 0.2,
            scrollTrigger: {
              trigger: aceSectionRef.current,
              start: 'top 75%',
            },
          }
        );
      }

      // Talk section animation
      if (talkSectionRef.current) {
        const talkContent = talkSectionRef.current.querySelectorAll('.grid > div');
        gsap.fromTo(
          talkContent,
          { opacity: 0, x: (i) => (i === 0 ? -60 : 60) },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            stagger: 0.2,
            scrollTrigger: {
              trigger: talkSectionRef.current,
              start: 'top 75%',
            },
          }
        );
      }

      // CTA section animation
      if (ctaSectionRef.current) {
        gsap.fromTo(
          ctaSectionRef.current.children,
          { opacity: 0, y: 40, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            scrollTrigger: {
              trigger: ctaSectionRef.current,
              start: 'top 80%',
            },
          }
        );
      }
    });

    return () => ctx.revert(); // Cleanup
  }, []);

  return (
    <div  className=" px-0 py-0  min-h-screen bg-[#e1e1db] text-black overflow-hidden">
      
      

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-0 pt-0">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-100/30 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-200/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
          {/* Split Title */}
          <div ref={heroTitleRef} className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 mb-8">
            <span 
              ref={titleLeftRef}
              className="text-5xl md:text-8xl font-bold tracking-tight opacity-0"
            >
              Intra
            </span>
            <span 
              ref={titleIconRef}
              className="text-4xl md:text-6xl text-amber-600 opacity-0 rotate-0"
            >
              ✦
            </span>
            <span 
              ref={titleRightRef}
              className="text-5xl md:text-8xl font-bold tracking-tight opacity-0"
            >
              Viewer
            </span>
          </div>
          
          <p ref={heroSubtitleRef} className="text-lg md:text-xl text-black/80 mb-12 max-w-2xl mx-auto leading-relaxed opacity-0">
            Platform packed with{' '}
            <span className="inline-block px-3 py-1 bg-black/5 rounded-md font-medium">AI-powered</span>
            {' '}&{' '}
            <span className="inline-block px-3 py-1 bg-black/5 rounded-md font-medium">personalized</span>
            {' '}practice,
            <br className="hidden md:block" />
            <span className="inline-block px-3 py-1 bg-black/5 rounded-md font-medium mt-2">feedback</span>
            ,{' '}
            <span className="inline-block px-3 py-1 bg-black/5 rounded-md font-medium mt-2">analytics</span>
            {' '}and interview{' '}
            <span className="inline-block px-3 py-1 bg-black/5 rounded-md font-medium mt-2">mastery</span>
          </p>

          {/* Search Bar */}
         
        </div>

        {/* Rotating Carousel */}
        <div ref={carouselContainerRef} className="relative w-full mt-8 mb-20 opacity-0">
          <div 
            ref={carouselRef}
            className="relative h-[400px] md:h-[500px] w-full flex items-center justify-center"
            style={{ perspective: '1200px' }}
          >
            {carouselImages.map((image, index) => {
              const totalCards = carouselImages.length;
              const angleStep = 30; // degrees between cards
              const angle = (index - Math.floor(totalCards / 2)) * angleStep;
              const radius = 320; // distance from center
              const xOffset = Math.sin((angle * Math.PI) / 180) * radius;
              const zOffset = Math.cos((angle * Math.PI) / 180) * radius - radius;
              const rotation = angle * 0.6;
              const yOffset = Math.abs(angle) * 1.5; // cards on edges go lower
              
              return (
                <div
                  key={index}
                  className="absolute w-48 md:w-64 transition-all duration-500 hover:scale-110 hover:z-50"
                  style={{
                    transform: `translateX(${xOffset}px) translateZ(${zOffset}px) translateY(${yOffset}px) rotateY(${rotation}deg) rotateZ(${rotation * 0.3}deg)`,
                    zIndex: 10 - Math.abs(index - Math.floor(totalCards / 2)),
                  }}
                >
                  <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
                    <Image
                      src={image.src}
                      alt={image.title}
                      width={320}
                      height={200}
                      className="w-full h-32 md:h-40 object-cover"
                    />
                    <div className="p-3 bg-gray-900">
                      <p className="text-white/80 text-sm font-medium">{image.title}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-amber-700/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-amber-700 rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Hero Illustration Section */}
      <section className="relative py-20 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-100/30 to-transparent pointer-events-none"></div>
        <div ref={heroImageRef} className="relative opacity-0">
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
      <section ref={featuredSectionRef} className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-12">Featured Interview Types</h2>
          
          <div ref={featuredCardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredInterviews.map((interview, idx) => (
              <Link 
                key={idx} 
                href="/auth/signup"
                className="group relative bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl p-6 hover:bg-white/60 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-black group-hover:text-amber-700 transition">
                    {interview.name}
                  </h3>
                  <div className="p-2 bg-amber-100/70 rounded-lg">
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
      <section ref={resumeSectionRef} className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-2">
                Try it with your own
                <br />
                resume
              </h2>
              <span className="inline-block px-4 py-1 bg-amber-100/70 rounded-full text-sm text-amber-700 mb-6">
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
      <section ref={aceSectionRef} className="py-20 px-4">
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
                  <div className="p-3 bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl w-fit mb-4">
                    <Grid3X3 className="w-6 h-6 text-amber-700" />
                  </div>
                  <h3 className="font-semibold text-black mb-2">Practice question by question</h3>
                  <p className="text-black text-sm">Focus on questions you need most. Pick a category and dive deeper.</p>
                </div>
                
                <div>
                  <div className="p-3 bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl w-fit mb-4">
                    <Zap className="w-6 h-6 text-amber-700" />
                  </div>
                  <h3 className="font-semibold text-black mb-2">AI-powered feedback</h3>
                  <p className="text-black text-sm">Get instant, actionable insights to improve your responses.</p>
                </div>
                
                <div>
                  <div className="p-3 bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl w-fit mb-4">
                    <RefreshCw className="w-6 h-6 text-amber-700" />
                  </div>
                  <h3 className="font-semibold text-black mb-2">Unlimited retries</h3>
                  <p className="text-black text-sm">Practice as many times as you need until you&apos;re confident.</p>
                </div>
                
                <div>
                  <div className="p-3 bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl w-fit mb-4">
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
                <div className="absolute inset-0 bg-amber-200/20 blur-[80px] rounded-full"></div>
                <div className="relative w-80 h-80 border border-amber-700/20 rounded-xl bg-white/40 backdrop-blur-sm p-6">
                  <div className="space-y-3">
                    <div className="h-3 bg-amber-700/30 rounded w-3/4"></div>
                    <div className="h-3 bg-amber-700/20 rounded w-full"></div>
                    <div className="h-3 bg-amber-700/20 rounded w-5/6"></div>
                    <div className="h-8 mt-6"></div>
                    <div className="h-3 bg-amber-700/25 rounded w-2/3"></div>
                    <div className="h-3 bg-amber-700/20 rounded w-full"></div>
                    <div className="h-3 bg-amber-700/20 rounded w-4/5"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Talk to Your Practice Section */}
      <section ref={talkSectionRef} className="py-20 px-4">
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
                  <div className="p-3 bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl">
                    <MessageSquare className="w-5 h-5 text-amber-700" />
                  </div>
                  <span className="text-black">Practice with voice recording</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl">
                    <Search className="w-5 h-5 text-amber-700" />
                  </div>
                  <span className="text-black">Get instant feedback analysis</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl">
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
        <div ref={ctaSectionRef} className="container mx-auto max-w-4xl text-center">
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
              <Button size="lg" variant="outline" className="border-amber-700/30 text-black hover:bg-white/60 text-lg px-8 py-6">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-amber-700/20 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-amber-700 rounded"></div>
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
          
          <div className="border-t border-amber-700/20 pt-8 flex flex-col md:flex-row justify-between items-center">
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
