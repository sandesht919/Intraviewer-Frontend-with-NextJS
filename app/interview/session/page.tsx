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
import { useInterviewStore } from '@/lib/stores/interviewStore';
import { useMediaStream } from '@/lib/hooks/useMediaStream';
import PreviousSessionsModal from '@/components/PreviousSessionsModal';

/**
 * Interview Session Component
 * 
 * Manages the real-time interview experience
 */
export default function InterviewSessionPage() {
  const router = useRouter();

  // Get interview data from Zustand store
  const { 
    currentSession, 
    backendSessionId,
    previousSessions,
    addResponse, 
    completeInterview,
    fetchPreviousSessions,
    clearCurrentSession
  } = useInterviewStore();

  // State to control when to show previous sessions modal
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Media streaming hook (handles audio chunks + frame capture)
  // Only initialize with sessionId when we have a valid backend session
  const { sessionId, status: streamStatus, startRecording: startMediaStream, stopRecording: stopMediaStream } = useMediaStream({
    interviewSessionId: backendSessionId || undefined,
    audioChunkDuration: 10000, // 10 seconds
    frameInterval: 2000 // 2 seconds
  });

  // Local media stream state (for display and controls)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Local state for interview control
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(90); // 90 seconds per question
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Refs for video, canvas (for frame extraction), and timing
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const responseStartTimeRef = useRef<number>(0);

  // Check if interview session exists and has backend session ID
  useEffect(() => {
    const validateSession = async () => {
      // If no current session or no backend session ID, show previous sessions modal
      if (!currentSession || !backendSessionId) {
        setIsLoadingSessions(true);
        setShowSessionsModal(true);
        await fetchPreviousSessions();
        setIsLoadingSessions(false);
      }
    };

    validateSession();
  }, [currentSession, backendSessionId, fetchPreviousSessions]);

  /**
   * Initialize media devices and start streaming
   * Integrates with useMediaStream hook for chunked recording
   * ONLY starts when there's a valid backend session
   */
  useEffect(() => {
    // Don't start media if no current session or no backend session ID
    if (!currentSession || !backendSessionId || localStream) return;

    const setupMedia = async () => {
      try {
        // Request camera and microphone access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        setLocalStream(stream);

        // Display local video preview
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Start media streaming (audio chunks + frames)
        if (videoRef.current && canvasRef.current) {
          await startMediaStream(videoRef.current, canvasRef.current);
          responseStartTimeRef.current = Date.now();
          console.log('📹 Media streaming started - Backend Session ID:', backendSessionId);
        }

      } catch (err: any) {
        setMediaError(err.message || 'Failed to access camera/microphone');
        setSessionError('Please allow camera and microphone access to continue');
        console.error('Media setup error:', err);
      }
    };

    setupMedia();

    return () => {
      // Cleanup on unmount
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      
      // Stop media streaming
      stopMediaStream();
    };
  }, [currentSession, backendSessionId]); // Re-run if session changes

  /**
   * Question timer countdown
   */
  useEffect(() => {
    if (!currentSession) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          return 90; // Reset timer
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [currentQuestionIndex, currentSession]); // Reset timer when question changes

  /**
   * Save response metadata
   * Actual audio/video already streaming to backend via WebSocket
   */
  const saveResponseMetadata = async () => {
    try {
      const duration = (Date.now() - responseStartTimeRef.current) / 1000;

      // Save response metadata to interview session
      await addResponse({
        questionId: currentSession?.questions[currentQuestionIndex].id || '',
        answer: 'Response recorded (streaming session: ' + sessionId + ')',
        duration: Math.round(duration),
        timestamp: new Date(),
        audioBlob: undefined // Streaming handled by WebSocket
      });

      console.log('✅ Response metadata saved for question:', currentQuestionIndex + 1);
      console.log('📊 Chunks:', streamStatus.chunksRecorded, 'Frames:', streamStatus.framesRecorded);
    } catch (err: any) {
      console.error('Error saving response:', err);
    }
  };

  /**
   * Handle next question navigation
   */
  const handleNextQuestion = async () => {
    // Save current response metadata (streaming continues)
    await saveResponseMetadata();

    // Check if there are more questions
    if (currentQuestionIndex < currentSession!.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeRemaining(90); // Reset timer for next question
      responseStartTimeRef.current = Date.now();

      console.log('📝 Moving to question', currentQuestionIndex + 2);
    } else {
      // All questions completed
      handleCompleteInterview();
    }
  };

  /**
   * Handle interview completion
   * Stop streaming and finalize interview
   */
  const handleCompleteInterview = async () => {
    try {
      // Store session ID before clearing
      const sessionIdForRedirect = backendSessionId;

      if (!sessionIdForRedirect) {
        setSessionError('No active session to complete');
        return;
      }

      // Save final response metadata
      await saveResponseMetadata();
      
      // Stop media streaming (sends session_complete to backend)
      stopMediaStream();
      
      // Stop all media tracks
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      // Complete interview in state (sends to backend and clears state)
      await completeInterview();

      console.log('🎬 Interview completed - Total chunks:', streamStatus.chunksRecorded, 'frames:', streamStatus.framesRecorded);
      console.log('📊 Session cleared. Redirecting to results:', sessionIdForRedirect);

      // Redirect to results page
      router.push(`/interview/results/${sessionIdForRedirect}`);
    } catch (err: any) {
      console.error('❌ Failed to complete interview:', err);
      setSessionError(err.message || 'Failed to complete interview');
    }
  };

  /**
   * Handle end interview (exit early)
   */
  const handleEndInterview = () => {
    if (confirm('Are you sure you want to end the interview? Your progress will be saved.')) {
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

  /**
   * Handle create new session from modal
   */
  const handleCreateNewSession = () => {
    clearCurrentSession();
    router.push('/interview/prepare');
  };

  /**
   * Handle close modal (go back to dashboard)
   */
  const handleCloseModal = () => {
    router.push('/dashboard');
  };

  // Show sessions modal if no valid backend session
  if (showSessionsModal || !currentSession || !backendSessionId) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 flex items-center justify-center">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Previous Sessions Modal */}
        <PreviousSessionsModal
          sessions={previousSessions}
          isLoading={isLoadingSessions}
          onCreateNew={handleCreateNewSession}
          onClose={handleCloseModal}
        />
      </>
    );
  }

  const currentQuestion = currentSession.questions[currentQuestionIndex];
  const questionProgress = currentQuestionIndex + 1;
  const totalQuestions = currentSession.questions.length;

  // Media status indicator (includes WebSocket connection)
  const mediaConnected = localStream !== null && streamStatus.isConnected;
  const connectionStatusColor = mediaConnected ? 'text-green-500' : 'text-yellow-500';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 py-8 px-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Header with Media Status */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Interview Session</h1>
            <p className="text-slate-600">
              Question {questionProgress} of {totalQuestions}
            </p>
          </div>

          {/* Media Status Indicator */}
          <div className="flex items-center gap-3 px-4 py-2 bg-white/80 border border-sky-200 rounded-lg shadow-sm">
            <div className={`w-2 h-2 rounded-full ${mediaConnected ? 'animate-pulse' : ''} ${connectionStatusColor}`}></div>
            <span className="text-sm text-slate-700">
              {mediaConnected ? 'Streaming' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {(sessionError || mediaError) && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">
              {sessionError || mediaError}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Video and Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Feed Container */}
            <div className="backdrop-blur-sm bg-white/80 border border-sky-200 rounded-2xl p-6 overflow-hidden shadow-xl">
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
                {streamStatus.isRecording && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-red-500 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-semibold">Streaming</span>
                  </div>
                )}

                {/* Hidden canvas for frame extraction */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />

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
                    ${isMuted ? 'bg-red-50 border-red-300 text-red-600' : 'bg-sky-600 hover:bg-sky-700'}
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
                    ${isCameraOff ? 'bg-red-50 border-red-300 text-red-600' : 'bg-sky-600 hover:bg-sky-700'}
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
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400 hover:bg-red-50"
                >
                  <PhoneOff className="w-5 h-5" />
                  End
                </Button>
              </div>
            </div>

            {/* Question Display */}
            <div className="backdrop-blur-sm bg-white/80 border border-sky-200 rounded-2xl p-6 shadow-xl">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-600 mb-2">Question {questionProgress}</h2>
                <p className="text-3xl font-bold text-slate-800 leading-tight">
                  {currentQuestion?.question}
                </p>
              </div>

              {/* Question Metadata */}
              <div className="flex gap-3 flex-wrap">
                <span className="px-3 py-1 bg-sky-100 text-sky-700 text-sm rounded-full">
                  {currentQuestion?.category}
                </span>
                <span className={`
                  px-3 py-1 text-sm rounded-full
                  ${currentQuestion?.difficulty === 'easy' ? 'bg-green-100 text-green-700' : ''}
                  ${currentQuestion?.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : ''}
                  ${currentQuestion?.difficulty === 'hard' ? 'bg-red-100 text-red-700' : ''}
                `}>
                  {currentQuestion?.difficulty} difficulty
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Timer and Navigation */}
          <div className="space-y-6">
            {/* Timer */}
            <div className="backdrop-blur-sm bg-white/80 border border-sky-200 rounded-2xl p-6 shadow-xl">
              <div className="text-center">
                <Clock className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-600 text-sm mb-3">Time Remaining</p>
                <div className="text-5xl font-bold text-slate-800 font-mono mb-4">
                  {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                </div>

                {/* Timer Progress Bar */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`
                      h-full transition-all duration-300
                      ${timeRemaining > 30 ? 'bg-sky-500' : 'bg-yellow-500'}
                      ${timeRemaining < 10 ? 'bg-red-500' : ''}
                    `}
                    style={{ width: `${(timeRemaining / 90) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="backdrop-blur-sm bg-white/80 border border-sky-200 rounded-2xl p-6 shadow-xl">
              <h3 className="font-semibold text-slate-800 mb-4">Progress</h3>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-sky-500 transition-all"
                  style={{ width: `${(questionProgress / totalQuestions) * 100}%` }}
                ></div>
              </div>

              <p className="text-slate-600 text-sm mb-4">
                {questionProgress} / {totalQuestions} questions completed
              </p>

              {/* Questions List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {currentSession.questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className={`
                      p-2 rounded text-sm flex items-center gap-2 transition
                      ${idx === currentQuestionIndex ? 'bg-sky-100 text-sky-700' : ''}
                      ${idx < currentQuestionIndex ? 'text-green-600' : 'text-slate-500'}
                      ${idx > currentQuestionIndex ? 'text-slate-400' : ''}
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
                className="w-full bg-gradient-to-r from-green-600 to-sky-600 hover:from-green-700 hover:to-sky-700 shadow-md"
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

        {/* Debug Info - For testing Media and Streaming */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-slate-400 font-mono space-y-1">
            <p>Media Stream: {localStream ? '✓ Active' : '✗ Not Active'}</p>
            <p>WebSocket: {streamStatus.isConnected ? '✓ Connected' : '✗ Disconnected'}</p>
            <p>Streaming: {streamStatus.isRecording ? '✓ Active' : '✗ Inactive'}</p>
            <p>Session ID (Interview): {currentSession.id}</p>
            <p>Session ID (Media): {sessionId}</p>
            <p>Audio Chunks: {streamStatus.chunksRecorded}</p>
            <p>Video Frames: {streamStatus.framesRecorded}</p>
            <p>Question: {currentQuestionIndex + 1} / {totalQuestions}</p>
            {streamStatus.error && <p className="text-red-400">Error: {streamStatus.error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}