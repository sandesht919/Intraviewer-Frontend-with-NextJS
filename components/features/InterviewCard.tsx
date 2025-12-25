/**
 * Interview Card Component
 * Display interview summary in a card
 */

import { CheckCircle } from 'lucide-react';

interface Interview {
  title: string;
  date: string;
  score: number;
  status: string;
}

interface InterviewCardProps {
  interview: Interview;
}

export function InterviewCard({ interview }: InterviewCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{interview.title}</h4>
          <p className="text-sm text-gray-500 mb-2">{interview.date}</p>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-600">
              Score: {interview.score}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
