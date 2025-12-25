/**
 * Dashboard Quick Actions Component
 */

import Link from 'next/link';
import { PlayCircle, BarChart3 } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

export function DashboardQuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Link href={ROUTES.INTERVIEW_PREPARE} className="group">
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

      <Link href={ROUTES.INTERVIEW_RESULTS} className="group">
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
  );
}
