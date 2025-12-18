/**
 * Live Interview Session Page
 * 
 * Main interview practice page where:
 * - User's camera/microphone are accessed via WebRTC
 * - Interview questions are displayed one at a time
 * - User responds to each question
 * - Interview progress is tracked
 * - Real-time data streams to backend for analysis
 * 
 * Features:
 * - Video preview with media controls
 * - Question display with 90-second timer
 * - Response recording (audio/video)
 * - Progress tracking
 * - Connection status indicator
 * - Mute/camera toggle controls
 * - Navigation between questions
 * 
 * TODO: 
 * - Implement actual WebRTC recording
 * - Connect WebSocket for real-time analysis
 * - Handle connection failures
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Loader,
  AlertCircle,
  Volume2,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Clock,
  CheckCircle,
  ChevronRight,
  SkipForward,
  PhoneOff
} from 'lucide-react';
import { useWebRTC } from '@/lib/hooks/useWebRTC';
import { useWebSocket } from '@/lib/hooks/useWebSocket';
import { useInterview } from '@/lib/hooks/useInterview';

/**
 * Interview Session Component
 * 
 * Manages the real-time interview experience
 */
export default function InterviewSessionPage() {
  const router = useRouter();

  // Get interview data
  const { currentSession, addResponse, completeInterview, interviewQuestions } = useInterview();

  // WebRTC hook for media handling
  const {
    localStream,
    isConnected: webrtcConnected,
    error: webrtcError,
    initializeMedia,
    startCall,
    stopCall,
    recordStream
  } = useWebRTC();

  // WebSocket hook for real-time communication
  // TODO: Replace with actual backend WebSocket URL
  const { isConnected: wsConnected, send: wsSend, error: wsError } = useWebSocket(
    'ws://localhost:8080/interview', // TODO: Update to actual backend URL
    {
      reconnectInterval: 3000,
      maxReconnectAttempts: 5
    }
  );

  // Local state for interview control
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(90); // 90 seconds per question
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [showConnectionStatus, setShowConnectionStatus] = useState(true);

  // Refs for video, recording, and timing
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingRef = useRef<any>(null);
  const responseStartTimeRef = useRef<number>(0);

  // Check if interview session exists
  useEffect(() => {
    if (!currentSession) {
      setSessionError('No active interview session. Please start from preparation page.');
      setTimeout(() => router.push('/interview/prepare'), 3000);
    }
  }, [currentSession, router]);

  /**
   * Initialize media devices on component mount
   * Start WebRTC connection setup
   */
  useEffect(() => {
    const setupMedia = async () => {
      try {
        // Request camera and microphone access
        const stream = await initializeMedia();

        // Display local video preview
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
        }

        // Start WebRTC connection
        // TODO: This will connect to signaling server via WebSocket
        await startCall(true);

        // Send interview session start event
        // TODO: Backend will initialize interview with AI
        wsSend('interview-start', {
          sessionId: currentSession?.id,
          questions: currentSession?.questions
        });

        // Start recording the interview
        startRecording(stream);
        responseStartTimeRef.current = Date.now();

      } catch (err: any) {
        setSessionError(err.message || 'Failed to initialize media devices');
      }
    };

    if (currentSession && !localStream) {
      setupMedia();
    }

    return () => {
      // Cleanup on unmount
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [currentSession, localStream]);

  /**
   * Question timer countdown
   */
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto-advance to next question when time runs out
          handleNextQuestion();
          return 90;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [currentQuestionIndex]);

  /**
   * Start recording user's response
   * Records video and audio for backend analysis
   */
  const startRecording = (stream: MediaStream) => {
    try {
      // TODO: Use proper recording implementation from useWebRTC hook
      console.log('Recording started for question:', currentQuestionIndex + 1);
      setIsRecording(true);

      // Send recording start event to backend
      wsSend('response-start', {
        questionId: currentSession?.questions[currentQuestionIndex].id,
        timestamp: Date.now()
      });
    } catch (err: any) {
      console.error('Recording error:', err);
    }
  };

  /**
   * Stop recording and save response
   */
  const stopRecording = async () => {
    try {
      setIsRecording(false);
      const duration = (Date.now() - responseStartTimeRef.current) / 1000;

      // TODO: Get actual recording blob from useWebRTC
      // const audioBlob = recordingRef.current?.stop();

      // Save response to interview session
      addResponse({
        questionId: currentSession?.questions[currentQuestionIndex].id || '',
        answer: 'Response recorded', // TODO: Get actual transcription from backend
        duration: Math.round(duration),
        // audioBlob // TODO: Include recorded audio
      });

      // Send response data to backend for analysis
      wsSend('response-end', {
        questionId: currentSession?.questions[currentQuestionIndex].id,
        duration: duration,
        timestamp: Date.now()
      });

      console.log('Response saved for question:', currentQuestionIndex + 1);
    } catch (err: any) {
      console.error('Error saving response:', err);
    }
  };

  /**
   * Handle next question navigation
   */
  const handleNextQuestion = async () => {
    // Stop recording current response
    await stopRecording();

    // Check if there are more questions
    if (currentQuestionIndex < currentSession!.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeRemaining(90); // Reset timer for next question

      // Start recording next question response
      if (localStream) {
        startRecording(localStream);
      }
    } else {
      // All questions completed
      handleCompleteInterview();
    }
  };

  /**
   * Handle interview completion
   * Send all responses to backend for analysis
   */
  const handleCompleteInterview = async () => {
    try {
      // Complete interview in state
      await completeInterview();

      // Send completion event to backend
      // TODO: Backend will trigger facial expression analysis and performance evaluation
      wsSend('interview-complete', {
        sessionId: currentSession?.id,
        timestamp: Date.now()
      });

      // Wait briefly then redirect to results
      setTimeout(() => {
        router.push(`/interview/results/${currentSession?.id}`);
      }, 2000);
    } catch (err: any) {
      setSessionError(err.message || 'Failed to complete interview');
    }
  };

  /**
   * Handle end interview (exit early)
   */
  const handleEndInterview = () => {
    if (confirm('Are you sure you want to end the interview? Your progress will be saved.')) {
      stopCall();
      handleCompleteInterview();
    }
  };

  /**
   * Toggle microphone
   */
  const toggleMicrophone = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  /**
   * Toggle camera
   */
  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(!isCameraOff);
    }
  };

  // Show loading state if session not ready
  if (!currentSession) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-900 text-lg">Loading interview session...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = currentSession.questions[currentQuestionIndex];
  const questionProgress = currentQuestionIndex + 1;
  const totalQuestions = currentSession.questions.length;

  // Connection status indicators
  const allConnected = webrtcConnected && wsConnected;
  const connectionStatusColor = allConnected
    ? 'text-green-500'
    : webrtcConnected || wsConnected
    ? 'text-yellow-500'
    : 'text-red-500';

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="relative max-w-5xl mx-auto">
        {/* Header with Connection Status */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Interview Session</h1>
            <p className="text-slate-400">
              Question {questionProgress} of {totalQuestions}
            </p>
          </div>

          {/* Connection Status Indicator */}
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg">
            <div className={`w-2 h-2 rounded-full animate-pulse ${connectionStatusColor}`}></div>
            <span className="text-sm text-slate-300">
              {allConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {(sessionError || webrtcError || wsError) && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">
              {sessionError || webrtcError || wsError}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Video and Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Feed Container */}
            <div className="backdrop-blur-md bg-slate-900/30 border border-slate-700 rounded-2xl p-6 overflow-hidden">
              {/* Video Preview */}
              <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-6">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Recording Indicator */}
                {isRecording && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-red-500 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-semibold">Recording</span>
                  </div>
                )}

                {/* Camera Off Indicator */}
                {isCameraOff && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                    <div className="text-center">
                      <VideoOff className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                      <p className="text-slate-400">Camera is off</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Media Controls */}
              <div className="flex gap-4 justify-center">
                {/* Microphone Toggle */}
                <Button
                  onClick={toggleMicrophone}
                  variant={isMuted ? 'outline' : 'default'}
                  size="lg"
                  className={`
                    flex items-center gap-2
                    ${isMuted ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-blue-600'}
                  `}
                >
                  {isMuted ? (
                    <>
                      <MicOff className="w-5 h-5" />
                      Unmute
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" />
                      Mute
                    </>
                  )}
                </Button>

                {/* Camera Toggle */}
                <Button
                  onClick={toggleCamera}
                  variant={isCameraOff ? 'outline' : 'default'}
                  size="lg"
                  className={`
                    flex items-center gap-2
                    ${isCameraOff ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-blue-600'}
                  `}
                >
                  {isCameraOff ? (
                    <>
                      <VideoOff className="w-5 h-5" />
                      Turn on
                    </>
                  ) : (
                    <>
                      <Video className="w-5 h-5" />
                      Turn off
                    </>
                  )}
                </Button>

                {/* End Interview Button */}
                <Button
                  onClick={handleEndInterview}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-500/50"
                >
                  <PhoneOff className="w-5 h-5" />
                  End
                </Button>
              </div>
            </div>

            {/* Question Display */}
            <div className="backdrop-blur-md bg-slate-900/30 border border-slate-700 rounded-2xl p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-300 mb-2">Question {questionProgress}</h2>
                <p className="text-3xl font-bold text-white leading-tight">
                  {currentQuestion?.question}
                </p>
              </div>

              {/* Question Metadata */}
              <div className="flex gap-3 flex-wrap">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full">
                  {currentQuestion?.category}
                </span>
                <span className={`
                  px-3 py-1 text-sm rounded-full
                  ${currentQuestion?.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' : ''}
                  ${currentQuestion?.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' : ''}
                  ${currentQuestion?.difficulty === 'hard' ? 'bg-red-500/20 text-red-300' : ''}
                `}>
                  {currentQuestion?.difficulty} difficulty
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Timer and Navigation */}
          <div className="space-y-6">
            {/* Timer */}
            <div className="backdrop-blur-md bg-slate-900/30 border border-slate-700 rounded-2xl p-6">
              <div className="text-center">
                <Clock className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-300 text-sm mb-3">Time Remaining</p>
                <div className="text-5xl font-bold text-white font-mono mb-4">
                  {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                </div>

                {/* Timer Progress Bar */}
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`
                      h-full transition-all duration-300
                      ${timeRemaining > 30 ? 'bg-blue-500' : 'bg-yellow-500'}
                      ${timeRemaining < 10 ? 'bg-red-500' : ''}
                    `}
                    style={{ width: `${(timeRemaining / 90) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="backdrop-blur-md bg-slate-900/30 border border-slate-700 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4">Progress</h3>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${(questionProgress / totalQuestions) * 100}%` }}
                ></div>
              </div>

              <p className="text-slate-400 text-sm mb-4">
                {questionProgress} / {totalQuestions} questions completed
              </p>

              {/* Questions List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {currentSession.questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className={`
                      p-2 rounded text-sm flex items-center gap-2 transition
                      ${idx === currentQuestionIndex ? 'bg-blue-500/20 text-blue-300' : ''}
                      ${idx < currentQuestionIndex ? 'text-green-400' : 'text-slate-400'}
                      ${idx > currentQuestionIndex ? 'text-slate-600' : ''}
                    `}
                  >
                    {idx < currentQuestionIndex ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-current"></div>
                    )}
                    <span className="text-xs">Q{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="space-y-3">
              {/* Skip Question Button */}
              {questionProgress < totalQuestions && (
                <Button
                  onClick={handleNextQuestion}
                  variant="outline"
                  className="w-full"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip
                </Button>
              )}

              {/* Next/Complete Button */}
              <Button
                onClick={questionProgress < totalQuestions ? handleNextQuestion : handleCompleteInterview}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {questionProgress < totalQuestions ? (
                  <>
                    Next Question <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Complete Interview <CheckCircle className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Debug Info - For testing WebSocket and WebRTC */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-slate-400 font-mono">
            <p>WebRTC: {webrtcConnected ? '✓ Connected' : '✗ Not Connected'}</p>
            <p>WebSocket: {wsConnected ? '✓ Connected' : '✗ Not Connected'}</p>
            <p>Recording: {isRecording ? '✓ Active' : '✗ Inactive'}</p>
            <p>Session ID: {currentSession.id}</p>
          </div>
        )}
      </div>
    </div>
  );
}
