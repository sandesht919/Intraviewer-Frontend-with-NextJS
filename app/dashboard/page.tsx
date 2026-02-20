'use client';

import { RouteGuard } from '@/components/guards/RouteGuard';
import { useAuthStore } from '@/lib/stores/authStore';
import { 
  PlayCircle, 
  Clock,
  FileText,
  ChevronRight,
  Briefcase,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React, { useEffect, useState, useMemo } from 'react';

export default function DashboardPage() {
  const { user, refreshAccessToken } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Get time-based greeting
  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, [currentTime]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Refresh access token every 12 minutes
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      try {
        await refreshAccessToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }, 12 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, refreshAccessToken]);

  // TODO: Replace with actual API data
  const hasInterviews = false; // Set to true when user has completed interviews
  const recentInterviews: Array<{
    id: string;
    role: string;
    company: string;
    date: string;
    duration: string;
  }> = [];

  const userName = user?.firstname || user?.email?.split('@')[0] || 'there';

  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-[#e1e1db]">
        <div className="p-6 pt-24 max-w-5xl mx-auto">

          {/* Subtle background accent */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-32 right-16 w-80 h-80 bg-emerald-300/6 rounded-full blur-3xl"></div>
            <div className="absolute bottom-32 left-16 w-64 h-64 bg-amber-200/8 rounded-full blur-3xl"></div>
          </div>
          
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-2xl font-semibold text-stone-900">
              {greeting}, {userName}
            </h1>
            <p className="text-stone-600 mt-1">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Main Action */}
          <div className="mb-8">
            <Link href="/interview/prepare">
              <div className="bg-amber-700 text-white p-6 rounded-xl hover:bg-amber-800 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                      <Plus className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-medium">New Practice Session</h2>
                      <p className="text-amber-200 text-sm">Start a mock interview</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-amber-200" />
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <Link href="/interview/results">
              <div className="bg-white/40 backdrop-blur-sm p-4 rounded-xl border border-amber-700/20 hover:bg-emerald-50/50 hover:border-emerald-400/30 transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-amber-700 group-hover:text-emerald-600 transition-colors" />
                  <span className="text-stone-700 font-medium">Past Results</span>
                </div>
              </div>
            </Link>
            <Link href="/profile">
              <div className="bg-white/40 backdrop-blur-sm p-4 rounded-xl border border-amber-700/20 hover:bg-emerald-50/50 hover:border-emerald-400/30 transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-amber-700 group-hover:text-emerald-600 transition-colors" />
                  <span className="text-stone-700 font-medium">Your Profile</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Recent Sessions */}
          <div>
            <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-4">
              Recent Sessions
            </h3>
            
            {hasInterviews && recentInterviews.length > 0 ? (
              <div className="space-y-2">
                {recentInterviews.map((interview) => (
                  <Link key={interview.id} href={`/interview/results/${interview.id}`}>
                    <div className="bg-white/40 backdrop-blur-sm p-4 rounded-xl border border-amber-700/20 hover:bg-white/60 transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-amber-100/70 rounded-lg flex items-center justify-center">
                            <PlayCircle className="w-5 h-5 text-amber-700" />
                          </div>
                          <div>
                            <p className="font-medium text-stone-900">{interview.role}</p>
                            <p className="text-sm text-stone-500">{interview.company}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-stone-600">{interview.date}</p>
                          <div className="flex items-center gap-1 text-xs text-stone-400">
                            <Clock className="w-3 h-3" />
                            <span>{interview.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-amber-700/20 p-8 text-center">
                <div className="w-12 h-12 bg-emerald-100/80 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlayCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-stone-600 mb-1">No sessions yet</p>
                <p className="text-sm text-stone-400 mb-4">
                  Complete your first practice interview to see it here
                </p>
                <Link href="/interview/prepare">
                  <Button variant="outline" size="sm" className="border-amber-700/30 text-amber-700 hover:bg-white/60">
                    Start your first session
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
