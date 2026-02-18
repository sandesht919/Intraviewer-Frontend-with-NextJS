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
import { useInterviewStore } from '@/lib/stores/interviewStore';

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

  const { currentSession } = useInterviewStore();

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
        return 'bg-red-100/70 text-red-700 border-red-200/50';
      case 'medium':
        return 'bg-yellow-100/70 text-yellow-700 border-yellow-200/50';
      case 'low':
        return 'bg-blue-100/70 text-blue-700 border-blue-200/50';
      default:
        return 'bg-stone-100/70 text-stone-700 border-stone-200/50';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#e1e1db] flex items-center justify-center pt-24">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-amber-700 mx-auto mb-4" />
          <p className="text-black text-lg">Analyzing your interview...</p>
          <p className="text-stone-600 text-sm mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className="min-h-screen bg-[#e1e1db] flex items-center justify-center px-4 pt-24">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-black text-lg mb-2">Failed to load results</p>
          <p className="text-stone-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/interview/prepare')} className="bg-amber-700 hover:bg-amber-800">
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
    <div className="min-h-screen bg-[#e1e1db] py-12 px-4 pt-24">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-amber-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Interview Results
          </h1>
          <p className="text-stone-600 text-lg">
            Here's your detailed performance analysis
          </p>
        </div>

        {/* Overall Score Card */}
        <div className="mb-12 bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl p-8 lg:p-12">
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
                    className="text-stone-200"
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
                  <p className="text-stone-600">Overall Score</p>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="space-y-6">
              {/* Technical Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-black font-semibold">Technical Score</span>
                  <span className={`text-lg font-bold ${getScoreColor(analysisData.technicalScore)}`}>
                    {analysisData.technicalScore}
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-600 transition-all"
                    style={{ width: `${analysisData.technicalScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Communication Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-black font-semibold">Communication</span>
                  <span className={`text-lg font-bold ${getScoreColor(analysisData.communicationScore)}`}>
                    {analysisData.communicationScore}
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-600 transition-all"
                    style={{ width: `${analysisData.communicationScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Confidence Level */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-black font-semibold">Confidence</span>
                  <span className={`text-lg font-bold ${getScoreColor(analysisData.confidenceLevel)}`}>
                    {analysisData.confidenceLevel}%
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
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
          <div className="bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
              <Smile className="w-6 h-6 text-amber-700" />
              Facial Expressions
            </h2>

            <div className="space-y-4">
              {Object.entries(analysisData.facialExpressions).map(([emotion, percentage]) => (
                <div key={emotion}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-stone-600 capitalize">{emotion}</span>
                    <span className="text-black font-semibold">{percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        emotion === 'confident'
                          ? 'bg-green-500'
                          : emotion === 'happy'
                          ? 'bg-amber-600'
                          : emotion === 'nervous'
                          ? 'bg-yellow-500'
                          : emotion === 'confused'
                          ? 'bg-red-500'
                          : 'bg-stone-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Speech Metrics */}
          <div className="bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
              <Volume2 className="w-6 h-6 text-amber-700" />
              Speech Metrics
            </h2>

            <div className="space-y-4">
              {/* Pace */}
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-stone-600">Speaking Pace</span>
                <span className="text-black font-semibold">
                  {analysisData.speechMetrics.averagePace} WPM
                </span>
              </div>

              {/* Clarity */}
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-stone-600">Clarity</span>
                <span className="text-black font-semibold">
                  {analysisData.speechMetrics.clarity}%
                </span>
              </div>

              {/* Filler Words */}
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-stone-600">Filler Words (um, uh, etc.)</span>
                <span className="text-black font-semibold">
                  {analysisData.speechMetrics.fillerWords}
                </span>
              </div>

              {/* Pause Duration */}
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-stone-600">Avg Pause Duration</span>
                <span className="text-black font-semibold">
                  {analysisData.speechMetrics.pauseDuration}s
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Question Analysis */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">Question-by-Question Analysis</h2>

          <div className="space-y-4">
            {analysisData.questionAnalysis.map((qa) => (
              <div
                key={qa.questionId}
                className={`
                  bg-white/40 backdrop-blur-sm border rounded-xl overflow-hidden transition-all cursor-pointer
                  ${
                    expandedQuestion === qa.questionId
                      ? 'border-amber-700 bg-white/60'
                      : 'border-amber-700/20 hover:bg-white/60'
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
                      <span className="text-sm font-semibold text-amber-700">
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
                    <p className="text-black font-semibold">{qa.question}</p>
                  </div>
                  <ArrowRight
                    className={`w-6 h-6 text-stone-400 transition-transform ${
                      expandedQuestion === qa.questionId ? 'rotate-90' : ''
                    }`}
                  />
                </div>

                {/* Question Details - Expanded */}
                {expandedQuestion === qa.questionId && (
                  <div className="px-6 pb-6 border-t border-amber-700/20 space-y-6">
                    {/* Feedback */}
                    <div>
                      <h4 className="text-stone-700 font-semibold mb-2">Feedback</h4>
                      <p className="text-stone-600">{qa.feedback}</p>
                    </div>

                    {/* Strengths */}
                    <div>
                      <h4 className="text-green-700 font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Strengths
                      </h4>
                      <ul className="space-y-1">
                        {qa.strengths.map((strength, idx) => (
                          <li key={idx} className="text-stone-600 text-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Areas for Improvement */}
                    <div>
                      <h4 className="text-amber-700 font-semibold mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Areas for Improvement
                      </h4>
                      <ul className="space-y-1">
                        {qa.improvements.map((improvement, idx) => (
                          <li key={idx} className="text-stone-600 text-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
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
          <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-amber-700" />
            Suggestions for Improvement
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysisData.suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className={`
                  bg-white/40 backdrop-blur-sm border rounded-xl p-6
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
            className="bg-amber-700 hover:bg-amber-800 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Retake Interview
          </Button>

          <Button
            variant="outline"
            onClick={() => console.log('TODO: Implement PDF download')}
            className="border-amber-700/30 text-amber-700 hover:bg-white/60 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Report
          </Button>

          <Button
            variant="outline"
            onClick={() => console.log('TODO: Implement share functionality')}
            className="border-amber-700/30 text-amber-700 hover:bg-white/60 flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share Results
          </Button>
        </div>

        {/* Footer Link */}
        <div className="text-center text-stone-500">
          <p className="mb-4">Want to practice more?</p>
          <Link href="/interview/prepare" className="text-amber-700 hover:text-amber-800 font-semibold">
            Start a new interview session →
          </Link>
        </div>
      </div>
    </div>
  );
}
