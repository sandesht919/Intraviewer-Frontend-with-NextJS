/**
 * Interview Results and Analysis Page
 * 
 * Displays comprehensive feedback after interview completion:
 * 1. Overall performance score
 * 2. Question-by-question analysis
 * 3. Facial expression analysis (happy, confident, nervous, etc.)
 * 4. Speech analysis (pace, clarity, filler words)
 * 5. Suggestions for improvement
 * 6. Technical accuracy score
 * 7. Communication effectiveness score
 * 
 * Features:
 * - Beautiful data visualization (charts, progress bars)
 * - Detailed breakdown by question category
 * - Actionable recommendations
 * - Option to retake interview
 * - Download results PDF (TODO)
 * - Share results (TODO)
 * - Responsive design
 * 
 * TODO: 
 * - Integrate with backend to fetch real analysis data
 * - Implement facial expression data visualization
 * - Add speech metrics visualization
 * - PDF export functionality
 * - Share functionality
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Download,
  Share2,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Smile,
  Award,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Loader,
  Lightbulb,
  Volume2,
  Eye,
  Clock
} from 'lucide-react';
import { useInterview } from '@/lib/hooks/useInterview';

/**
 * Mock analysis data structure
 * TODO: Replace with actual backend data
 */
interface AnalysisData {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceLevel: number;
  facialExpressions: {
    happy: number;
    confident: number;
    nervous: number;
    confused: number;
    neutral: number;
  };
  speechMetrics: {
    averagePace: number; // words per minute
    clarity: number; // 0-100
    fillerWords: number;
    pauseDuration: number;
  };
  questionAnalysis: {
    questionId: string;
    question: string;
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  }[];
  suggestions: {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

/**
 * Interview Results Component
 */
export default function InterviewResultsPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const { currentSession } = useInterview();

  // Local state
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  /**
   * Fetch analysis data from backend
   * TODO: Replace with actual API call
   */
  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Replace with actual backend API call
        // const response = await fetch(`/api/interviews/${sessionId}/analysis`);
        // const data = await response.json();

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock analysis data - Remove this when backend is integrated
        const mockAnalysis: AnalysisData = {
          overallScore: 78,
          technicalScore: 82,
          communicationScore: 74,
          confidenceLevel: 76,
          facialExpressions: {
            happy: 15,
            confident: 45,
            nervous: 25,
            confused: 10,
            neutral: 5
          },
          speechMetrics: {
            averagePace: 128,
            clarity: 85,
            fillerWords: 8,
            pauseDuration: 2.3
          },
          questionAnalysis: [
            {
              questionId: '1',
              question: 'Tell me about your most relevant project related to this role.',
              score: 82,
              feedback: 'Good explanation with relevant examples',
              strengths: ['Clear structure', 'Relevant experience', 'Good pacing'],
              improvements: ['Add more technical details', 'Quantify results']
            },
            {
              questionId: '2',
              question: 'What are the key technologies you would use to solve this problem?',
              score: 75,
              feedback: 'Covered main technologies but missed some details',
              strengths: ['Comprehensive list', 'Logical reasoning'],
              improvements: ['Explain trade-offs better', 'Discuss why choices were made']
            },
            {
              questionId: '3',
              question: 'How do you handle tight deadlines in your work?',
              score: 78,
              feedback: 'Behavioral answer was well-structured',
              strengths: ['Specific example', 'Self-aware', 'Action-oriented'],
              improvements: ['Add more metrics', 'Discuss learnings']
            },
            {
              questionId: '4',
              question: 'Describe your approach to debugging complex issues.',
              score: 80,
              feedback: 'Systematic approach demonstrated',
              strengths: ['Methodical thinking', 'Tool knowledge'],
              improvements: ['Mention collaboration', 'Discuss prevention']
            },
            {
              questionId: '5',
              question: 'Tell me about a time you faced conflict with a team member.',
              score: 72,
              feedback: 'Good honesty but could emphasize learning more',
              strengths: ['Authentic response', 'Resolution focus'],
              improvements: ['Better conflict handling approach', 'More professional tone']
            }
          ],
          suggestions: [
            {
              title: 'Reduce filler words',
              description: 'You used "um" and "uh" 8 times. Practice pausing instead of filling silence.',
              priority: 'medium'
            },
            {
              title: 'Improve technical depth',
              description: 'When discussing technologies, provide more architectural context and trade-offs.',
              priority: 'high'
            },
            {
              title: 'Increase confidence',
              description: 'Your confidence dipped on question 5. Practice STAR method for behavioral questions.',
              priority: 'medium'
            },
            {
              title: 'Better eye contact',
              description: 'Try to maintain steady eye contact with the camera for 80% of the time.',
              priority: 'low'
            },
            {
              title: 'Speaking pace',
              description: 'Your average pace of 128 WPM is good. Maintain this throughout to stay clear.',
              priority: 'low'
            }
          ]
        };

        setAnalysisData(mockAnalysis);
      } catch (err: any) {
        setError(err.message || 'Failed to load analysis results');
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchAnalysis();
    }
  }, [sessionId]);

  /**
   * Get score color based on value
   */
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  /**
   * Get score background color
   */
  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30';
    if (score >= 70) return 'bg-yellow-500/20 border-yellow-500/30';
    if (score >= 60) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  /**
   * Get priority badge color
   */
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-900 text-lg">Analyzing your interview...</p>
          <p className="text-gray-600 text-sm mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-white text-lg mb-2">Failed to load results</p>
          <p className="text-slate-400 mb-6">{error}</p>
          <Button onClick={() => router.push('/interview/prepare')}>
            Return to Preparation
          </Button>
        </div>
      </div>
    );
  }

  const avgScore = Math.round(
    (analysisData.overallScore +
      analysisData.technicalScore +
      analysisData.communicationScore) /
    3
  );

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Interview Results
          </h1>
          <p className="text-gray-600 text-lg">
            Here's your detailed performance analysis
          </p>
        </div>

        {/* Overall Score Card */}
        <div className="mb-12 bg-white border border-gray-200 rounded-3xl p-8 lg:p-12 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Score Circle */}
            <div className="flex justify-center">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-slate-700"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${(analysisData.overallScore / 100) * 283} 283`}
                    strokeLinecap="round"
                    className={`transition-all duration-1000 ${getScoreColor(analysisData.overallScore)}`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="text-center">
                  <div className={`text-5xl font-bold ${getScoreColor(analysisData.overallScore)}`}>
                    {analysisData.overallScore}
                  </div>
                  <p className="text-slate-400">Overall Score</p>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="space-y-6">
              {/* Technical Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-semibold">Technical Score</span>
                  <span className={`text-lg font-bold ${getScoreColor(analysisData.technicalScore)}`}>
                    {analysisData.technicalScore}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${analysisData.technicalScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Communication Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-semibold">Communication</span>
                  <span className={`text-lg font-bold ${getScoreColor(analysisData.communicationScore)}`}>
                    {analysisData.communicationScore}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all"
                    style={{ width: `${analysisData.communicationScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Confidence Level */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-semibold">Confidence</span>
                  <span className={`text-lg font-bold ${getScoreColor(analysisData.confidenceLevel)}`}>
                    {analysisData.confidenceLevel}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${analysisData.confidenceLevel}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Facial Expressions Analysis */}
          <div className="backdrop-blur-md bg-slate-900/30 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Smile className="w-6 h-6 text-blue-500" />
              Facial Expressions
            </h2>

            <div className="space-y-4">
              {Object.entries(analysisData.facialExpressions).map(([emotion, percentage]) => (
                <div key={emotion}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-300 capitalize">{emotion}</span>
                    <span className="text-white font-semibold">{percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        emotion === 'confident'
                          ? 'bg-green-500'
                          : emotion === 'happy'
                          ? 'bg-blue-500'
                          : emotion === 'nervous'
                          ? 'bg-yellow-500'
                          : emotion === 'confused'
                          ? 'bg-red-500'
                          : 'bg-slate-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Speech Metrics */}
          <div className="backdrop-blur-md bg-slate-900/30 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Volume2 className="w-6 h-6 text-purple-500" />
              Speech Metrics
            </h2>

            <div className="space-y-4">
              {/* Pace */}
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-300">Speaking Pace</span>
                <span className="text-white font-semibold">
                  {analysisData.speechMetrics.averagePace} WPM
                </span>
              </div>

              {/* Clarity */}
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-300">Clarity</span>
                <span className="text-white font-semibold">
                  {analysisData.speechMetrics.clarity}%
                </span>
              </div>

              {/* Filler Words */}
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-300">Filler Words (um, uh, etc.)</span>
                <span className="text-white font-semibold">
                  {analysisData.speechMetrics.fillerWords}
                </span>
              </div>

              {/* Pause Duration */}
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-300">Avg Pause Duration</span>
                <span className="text-white font-semibold">
                  {analysisData.speechMetrics.pauseDuration}s
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Question Analysis */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Question-by-Question Analysis</h2>

          <div className="space-y-4">
            {analysisData.questionAnalysis.map((qa) => (
              <div
                key={qa.questionId}
                className={`
                  backdrop-blur-md border rounded-2xl overflow-hidden transition-all cursor-pointer
                  ${
                    expandedQuestion === qa.questionId
                      ? 'border-blue-500 bg-slate-900/50'
                      : 'border-slate-700 bg-slate-900/30 hover:border-slate-600'
                  }
                `}
                onClick={() =>
                  setExpandedQuestion(
                    expandedQuestion === qa.questionId ? null : qa.questionId
                  )
                }
              >
                {/* Question Header */}
                <div className="p-6 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-semibold text-blue-400">
                        Question {qa.questionId}
                      </span>
                      <span
                        className={`
                          text-sm font-bold px-2 py-1 rounded
                          ${getScoreBgColor(qa.score)} border
                        `}
                      >
                        {qa.score}
                      </span>
                    </div>
                    <p className="text-white font-semibold">{qa.question}</p>
                  </div>
                  <ArrowRight
                    className={`w-6 h-6 text-slate-400 transition-transform ${
                      expandedQuestion === qa.questionId ? 'rotate-90' : ''
                    }`}
                  />
                </div>

                {/* Question Details - Expanded */}
                {expandedQuestion === qa.questionId && (
                  <div className="px-6 pb-6 border-t border-slate-700 space-y-6">
                    {/* Feedback */}
                    <div>
                      <h4 className="text-slate-300 font-semibold mb-2">Feedback</h4>
                      <p className="text-slate-300">{qa.feedback}</p>
                    </div>

                    {/* Strengths */}
                    <div>
                      <h4 className="text-green-300 font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Strengths
                      </h4>
                      <ul className="space-y-1">
                        {qa.strengths.map((strength, idx) => (
                          <li key={idx} className="text-slate-300 text-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Areas for Improvement */}
                    <div>
                      <h4 className="text-yellow-300 font-semibold mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Areas for Improvement
                      </h4>
                      <ul className="space-y-1">
                        {qa.improvements.map((improvement, idx) => (
                          <li key={idx} className="text-slate-300 text-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions for Improvement */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            Suggestions for Improvement
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysisData.suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className={`
                  backdrop-blur-md border rounded-2xl p-6
                  ${getPriorityColor(suggestion.priority)}
                `}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg">{suggestion.title}</h3>
                  <span className="text-xs font-semibold uppercase">
                    {suggestion.priority} Priority
                  </span>
                </div>
                <p className="text-sm opacity-90">{suggestion.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            onClick={() => router.push('/interview/prepare')}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Retake Interview
          </Button>

          <Button
            variant="outline"
            onClick={() => console.log('TODO: Implement PDF download')}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Report
          </Button>

          <Button
            variant="outline"
            onClick={() => console.log('TODO: Implement share functionality')}
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share Results
          </Button>
        </div>

        {/* Footer Link */}
        <div className="text-center text-slate-400">
          <p className="mb-4">Want to practice more?</p>
          <Link href="/interview/prepare" className="text-blue-400 hover:text-blue-300 font-semibold">
            Start a new interview session →
          </Link>
        </div>
      </div>
    </div>
  );
}
