/**
 * Dashboard Page
 * 
 * Main dashboard for authenticated users with YouTube-style layout
 * Shows user stats, recent interviews, and quick actions.
 */

'use client';

import { RouteGuard } from '@/components/guards/RouteGuard';
import { useAuthStore } from '@/lib/stores/authStore';
import { 
  BarChart3, 
  PlayCircle, 
  TrendingUp, 
  Clock,
  Award,
  Target,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AuthService } from '@/lib/services/auth.service';
import React from 'react';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();

  const RefreshToken= useAuthStore((state) => state.refreshToken);

  const {refreshToken}= AuthService

  // Refresh access token every 12 minutes
  // Assumes AuthService has a refreshAccessToken() method
useEffect(() => {
  if (!RefreshToken || typeof refreshToken !== 'function') return;

  const interval = setInterval(() => {
    refreshToken(RefreshToken);
  }, 12 * 60 * 1000);

  return () => clearInterval(interval);
}, [RefreshToken, refreshToken]);


  const stats = [
    { label: 'Interviews Completed', value: '12', icon: PlayCircle, color: 'bg-sky-500' },
    { label: 'Average Score', value: '85%', icon: BarChart3, color: 'bg-emerald-500' },
    { label: 'Time Practiced', value: '8.5h', icon: Clock, color: 'bg-indigo-500' },
    { label: 'Achievements', value: '5', icon: Award, color: 'bg-amber-500' },
  ];

  const recentInterviews = [
    { title: 'Software Engineer Interview', date: '2 days ago', score: 92, status: 'completed' },
    { title: 'Product Manager Role', date: '5 days ago', score: 78, status: 'completed' },
    { title: 'Data Analyst Position', date: '1 week ago', score: 85, status: 'completed' },
  ];

  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-gray-50 transition-all duration-300">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.email?.split('@')[0] || 'User'}! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              Ready to practice your next interview? Let's get you prepared for success.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link href="/interview/prepare" className="group">
              <div className="bg-gradient-to-r from-sky-500 to-sky-600 p-6 rounded-xl text-white hover:from-sky-600 hover:to-sky-700 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Start New Interview</h3>
                    <p className="text-sky-100">Practice with AI-generated questions</p>
                  </div>
                  <PlayCircle className="w-12 h-12 text-sky-200 group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </Link>

            <Link href="/interview/results" className="group">
              <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">View Results</h3>
                    <p className="text-gray-600">Check your performance analytics</p>
                  </div>
                  <BarChart3 className="w-12 h-12 text-indigo-500 group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Interviews */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Interviews</h3>
                <Link href="/interview/results" className="text-sky-600 hover:text-sky-700 text-sm font-medium">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {recentInterviews.map((interview, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-sky-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{interview.title}</p>
                        <p className="text-sm text-gray-600">{interview.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">{interview.score}%</p>
                      <p className="text-xs text-gray-500 capitalize">{interview.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Insights */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Progress Insights</h3>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-emerald-600 mt-1" />
                    <div>
                      <p className="font-medium text-emerald-900">Great Progress!</p>
                      <p className="text-sm text-emerald-700">Your scores have improved by 15% this week</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-sky-50 rounded-lg border border-sky-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-sky-600 mt-1" />
                    <div>
                      <p className="font-medium text-sky-900">Consistency Streak</p>
                      <p className="text-sm text-sky-700">You've practiced 5 days in a row</p>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700">
                  Continue Practice Session
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
