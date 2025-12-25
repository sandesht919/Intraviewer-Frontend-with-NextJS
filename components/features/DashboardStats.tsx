/**
 * Dashboard Stats Component
 * Displays user statistics in a grid
 */

import { BarChart3, PlayCircle, Clock, Award } from 'lucide-react';

interface StatItem {
  label: string;
  value: string;
  icon: any;
  color: string;
}

interface DashboardStatsProps {
  stats?: StatItem[];
}

const defaultStats: StatItem[] = [
  { label: 'Interviews Completed', value: '12', icon: PlayCircle, color: 'bg-sky-500' },
  { label: 'Average Score', value: '85%', icon: BarChart3, color: 'bg-emerald-500' },
  { label: 'Time Practiced', value: '8.5h', icon: Clock, color: 'bg-indigo-500' },
  { label: 'Achievements', value: '5', icon: Award, color: 'bg-amber-500' },
];

export function DashboardStats({ stats = defaultStats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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
  );
}
