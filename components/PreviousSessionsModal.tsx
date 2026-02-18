/**
 * Previous Sessions Modal Component
 * 
 * Displays a modal showing previous interview sessions with:
 * - Session details (date, status)
 * - View results button for completed sessions
 * - Continue button for in-progress sessions
 * - Create new session button
 */

'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  Plus, 
  Calendar,
  XCircle,
  Loader
} from 'lucide-react';
import type { InterviewSession } from '@/lib/types';

interface PreviousSessionsModalProps {
  sessions: InterviewSession[];
  isLoading: boolean;
  onCreateNew: () => void;
  onClose?: () => void;
}

export default function PreviousSessionsModal({
  sessions,
  isLoading,
  onCreateNew,
  onClose
}: PreviousSessionsModalProps) {
  const router = useRouter();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <PlayCircle className="w-5 h-5 text-amber-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'in-progress':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/40 backdrop-blur-md rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-amber-700/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Your Interview Sessions</h2>
          <p className="text-amber-100">
            Continue a previous session or start a new interview
          </p>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-amber-700" />
              <span className="ml-3 text-stone-700">Loading sessions...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-stone-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-black mb-2">
                No Previous Sessions
              </h3>
              <p className="text-stone-700 mb-6">
                Start your first interview practice session now
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="border border-amber-700/20 rounded-xl p-5 hover:bg-white/70 transition-all bg-white/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(session.status)}
                      <div>
                        <h3 className="font-semibold text-black">
                          Interview Session #{session.id}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-stone-600 mt-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(session.createdAt)}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        session.status
                      )}`}
                    >
                      {session.status}
                    </span>
                  </div>

                  {session.jobDescription && (
                    <p className="text-sm text-stone-700 mb-3 line-clamp-2">
                      {session.jobDescription}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-600">
                      {session.questions?.length || 0} questions •{' '}
                      {session.responses?.length || 0} answered
                    </span>

                    {session.status === 'completed' && session.completedAt && (
                      <Button
                        size="sm"
                        onClick={() => router.push(`/interview/results/${session.id}`)}
                        className="bg-amber-700 hover:bg-amber-800"
                      >
                        View Results
                      </Button>
                    )}

                    {session.status === 'in-progress' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push('/interview/session')}
                        className="border-amber-700 text-amber-700 hover:bg-amber-50"
                      >
                        Continue
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-amber-700/20 p-6 bg-white/50 backdrop-blur-sm">
          <div className="flex gap-3">
            <Button
              onClick={onCreateNew}
              className="flex-1 bg-amber-700 hover:bg-amber-800 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Interview
            </Button>
            {onClose && (
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6 border-amber-700/30 text-black hover:bg-white/60"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
