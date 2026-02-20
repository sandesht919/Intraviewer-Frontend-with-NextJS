/**
 * Live Interview Session Page
 *
 * Main interview practice page where:
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
  PhoneOff,
  Play,
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
    clearCurrentSession,
    interviewQuestions,
  } = useInterviewStore();

  // State to control when to show previous sessions modal
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Media streaming hook (handles audio chunks + frame capture)
  // Only initialize with sessionId when we have a valid backend session
  const {
    sessionId,
    status: streamStatus,
    startRecording: startMediaStream,
    stopRecording: stopMediaStream,
    flushAndSwitchQuestion,
    transcriptions,
    liveEmotions,
  } = useMediaStream({
    interviewSessionId: backendSessionId || undefined,
    audioChunkDuration: 10000, // 10 seconds
    frameInterval: 2000, // 2 seconds
  });

  // Local media stream state (for display and controls)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Local state for interview control
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0); // Counts up from 0
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [hoveredQuestion, setHoveredQuestion] = useState<{ idx: number; text: string; x: number; y: number } | null>(null);

  // Refs for video, canvas (for frame extraction), and timing
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const responseStartTimeRef = useRef<number>(0);

  console.log('🚀 ~ InterviewSessionPage ~ currentSession:', currentSession, backendSessionId);

  // Check if interview session exists and has backend session ID
  useEffect(() => {
    const validateSession = async () => {
      // Validate session: exists, has backend ID, not completed, and has questions
      const isValidSession =
        currentSession &&
        backendSessionId &&
        currentSession.status !== 'completed' &&
        currentSession.questions &&
        currentSession.questions.length > 0;

      if (isValidSession) {
        // Valid session exists - hide modal and proceed
        setShowSessionsModal(false);
      } else {
        // If session is invalid (e.g. completed or empty), clear it and show modal
        if (currentSession || backendSessionId) {
          clearCurrentSession();
        }

        setIsLoadingSessions(true);
        setShowSessionsModal(true);
        await fetchPreviousSessions();
        setIsLoadingSessions(false);
      }
    };

    validateSession();
  }, [currentSession, backendSessionId, fetchPreviousSessions, clearCurrentSession]);

  /**
   * Initialize media devices and start streaming
   * Integrates with useMediaStream hook for chunked recording
   * ONLY starts when there's a valid backend session
   */
  useEffect(() => {
    // Don't start media if no backend session ID.
    // We remove currentSession from this check to prevent re-initialization loops.
    if (!backendSessionId || localStream) return;

    let isMounted = true;

    const setupMedia = async () => {
      try {
        // Request camera and microphone access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        // Check if component is still mounted before updating state
        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        setLocalStream(stream);

        // Display local video preview
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (playError: any) {
            // Ignore AbortError - happens when component unmounts during play
            if (playError.name !== 'AbortError') {
              console.error('Video play error:', playError);
            }
          }
        }

        console.log('📹 Media preview started');
      } catch (err: any) {
        if (!isMounted) return;
        setMediaError(err.message || 'Failed to access camera/microphone');
        setSessionError('Please allow camera and microphone access to continue');
        console.error('Media setup error:', err);
      }
    };

    setupMedia();

    return () => {
      isMounted = false;
      // Cleanup on unmount
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      // Stop media streaming
      stopMediaStream();
    };
  }, [backendSessionId]); // Re-run if session changes

  /**
   * Question timer - counts up from 0
   */
  useEffect(() => {
    if (!currentSession || !isInterviewStarted) return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [currentSession, isInterviewStarted]); // Only reset when interview starts

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
        audioBlob: undefined, // Streaming handled by WebSocket
      });

      console.log('✅ Response metadata saved for question:', currentQuestionIndex + 1);
      console.log(
        '📊 Chunks:',
        streamStatus.chunksRecorded,
        'Frames:',
        streamStatus.framesRecorded
      );
    } catch (err: any) {
      console.error('Error saving response:', err);
    }
  };

  /**
   * Handle next question navigation
   */
  const handleNextQuestion = async () => {
    if (currentQuestionIndex < currentSession!.questions.length - 1) {
      const nextQuestionNumber = currentQuestionIndex + 2; // 1-based

      // Flush the in-progress audio chunk (tagged with current question) and
      // immediately restart recording for the next question.
      // Must happen BEFORE advancing the index so the chunk boundary is clean.
      flushAndSwitchQuestion(nextQuestionNumber);

      setCurrentQuestionIndex((prev) => prev + 1);
      responseStartTimeRef.current = Date.now();

      console.log('📝 Moving to question', nextQuestionNumber);
    } else {
      // All questions completed
      handleCompleteInterview();
    }
  };

  /**
   * Handle interview completion
   * Stop streaming and finalize interview
   */
  const [isCompleting, setIsCompleting] = useState(false);

  const handleCompleteInterview = async () => {
    // Prevent double-clicks / re-entrancy
    if (isCompleting) return;
    setIsCompleting(true);

    // Capture session ID FIRST before any state changes
    const sessionIdForRedirect = backendSessionId;

    try {
      if (!sessionIdForRedirect) {
        setSessionError('No active session to complete');
        return;
      }

      // Save final response metadata
      await saveResponseMetadata();

      // Stop media streaming (sends session_complete to backend)
      try {
        stopMediaStream();
      } catch (err) {
        console.warn('stopMediaStream error (non-fatal):', err);
      }

      // Stop all media tracks
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }

      // Complete interview in state (sends to backend and clears state)
      await completeInterview();

      console.log(
        '🎬 Interview completed - Total chunks:',
        streamStatus.chunksRecorded,
        'frames:',
        streamStatus.framesRecorded
      );
      console.log('📊 Session cleared. Redirecting to results:', sessionIdForRedirect);

      // Redirect IMMEDIATELY using the captured ID (state already cleared won't affect this)
      // Use replace to prevent back-navigation to the cleared session page
      router.replace(`/interview/results/${sessionIdForRedirect}`);
    } catch (err: any) {
      console.error('❌ Failed to complete interview:', err);
      setSessionError(err?.message || 'Failed to complete interview');
      setIsCompleting(false);
    }
    // NOTE: Don't reset isCompleting on success - we're navigating away
  };

  /**
   * Start the actual interview session
   */
  const handleStartInterview = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      await startMediaStream(videoRef.current, canvasRef.current);
      responseStartTimeRef.current = Date.now();
      setIsInterviewStarted(true);
      console.log('🚀 Interview session started - Backend Session ID:', backendSessionId);
    } catch (err: any) {
      setSessionError(err.message || 'Failed to start interview session');
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
      localStream.getAudioTracks().forEach((track) => {
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
      localStream.getVideoTracks().forEach((track) => {
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
        <div className="min-h-screen bg-[#e1e1db] flex items-center justify-center">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-amber-200/10 rounded-full blur-3xl"></div>
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

  // Get current question - handle both backend (question_text) and frontend (question) formats
  const rawQuestion = currentSession.questions[currentQuestionIndex] as any;
  const currentQuestion = {
    id: rawQuestion?.id,
    question: rawQuestion?.question || rawQuestion?.question_text || '',
    category: rawQuestion?.category || 'technical',
    difficulty: rawQuestion?.difficulty || rawQuestion?.difficulty_level?.toLowerCase() || 'medium',
  };
  const questionProgress = currentQuestionIndex + 1;
  const totalQuestions = currentSession.questions.length;
  console.log('🚀 ~ InterviewSessionPage ~ currentQuestion:', currentQuestion);

  // Media status indicator (includes WebSocket connection)
  const mediaConnected = localStream !== null && streamStatus.isConnected;
  const connectionStatusColor = mediaConnected ? 'text-green-500' : 'text-yellow-500';

  return (
    <div className="min-h-screen bg-[#e1e1db] py-8 px-4 pt-24">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-amber-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Header with Media Status */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Interview Session</h1>
            <p className="text-stone-600">
              Question {questionProgress} of {totalQuestions}
            </p>
          </div>

          {/* Media Status Indicator */}
          <div className="flex items-center gap-3 px-4 py-2 bg-white/60 backdrop-blur-sm border border-amber-700/20 rounded-lg">
            <div
              className={`w-2 h-2 rounded-full ${mediaConnected ? 'animate-pulse' : ''} ${connectionStatusColor}`}
            ></div>
            <span className="text-sm text-stone-700">
              {streamStatus.isRecording
                ? 'Live & Recording'
                : localStream
                  ? 'Ready to Start'
                  : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {(sessionError || mediaError) && (
          <div className="mb-6 p-4 bg-red-50/60 border border-red-200/50 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{sessionError || mediaError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Video and Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Feed Container */}
            <div className="bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl p-6 overflow-hidden">
              {/* Video Preview */}
              <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-6">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Start Interview overlay */}
                {!isInterviewStarted && !showSessionsModal && localStream && (
                  <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center">
                    <div className="bg-white/10 p-6 rounded-xl backdrop-blur-md border border-white/20 text-center max-w-sm mx-4">
                      <div className="w-16 h-16 bg-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Ready to specific start?
                      </h3>
                      <p className="text-slate-200 mb-6 text-sm">
                        Your camera and microphone are ready. Click below to begin the interview
                        session.
                      </p>
                      <Button
                        onClick={handleStartInterview}
                        size="lg"
                        className="w-full bg-amber-700 text-white hover:bg-amber-800 font-medium"
                      >
                        Start Interview Session
                      </Button>
                    </div>
                  </div>
                )}

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
                    ${isMuted ? 'bg-red-50 border-red-300 text-red-600' : 'bg-amber-700 hover:bg-amber-800'}
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
                    ${isCameraOff ? 'bg-red-50 border-red-300 text-red-600' : 'bg-amber-700 hover:bg-amber-800'}
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
            <div className="bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-stone-600 mb-2">
                  Question {questionProgress}
                </h2>
                <p className="text-3xl font-bold text-black leading-tight">
                  {currentQuestion?.question}
                </p>
              </div>

              {/* Question Metadata */}
              <div className="flex gap-3 flex-wrap">
                <span className="px-3 py-1 bg-amber-100/70 text-amber-700 text-sm rounded-full">
                  {currentQuestion?.category}
                </span>
                <span
                  className={`
                  px-3 py-1 text-sm rounded-full
                  ${currentQuestion?.difficulty === 'easy' ? 'bg-green-100 text-green-700' : ''}
                  ${currentQuestion?.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : ''}
                  ${currentQuestion?.difficulty === 'hard' ? 'bg-red-100 text-red-700' : ''}
                `}
                >
                  {currentQuestion?.difficulty} difficulty
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Timer and Navigation */}
          <div className="space-y-6">
            {/* Timer */}
            <div className="bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl p-6">
              <div className="text-center">
                <Clock className="w-6 h-6 text-stone-500 mx-auto mb-2" />
                <p className="text-stone-600 text-sm mb-3">Time Elapsed</p>
                <div className="text-5xl font-bold text-black font-mono mb-4">
                  {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}
                </div>

                {/* Timer Progress Bar - shows progress based on elapsed time */}
                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-600 transition-all duration-300"
                    style={{ width: `${Math.min((elapsedTime / 300) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl p-6">
              <h3 className="font-semibold text-black mb-4">Progress</h3>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-amber-600 transition-all"
                  style={{ width: `${(questionProgress / totalQuestions) * 100}%` }}
                ></div>
              </div>

              <p className="text-stone-600 text-sm mb-4">
                {questionProgress} / {totalQuestions} questions completed
              </p>

              {/* Questions List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {currentSession.questions.map((q, idx) => {
                  const questionText = (q as any).question || (q as any).question_text || '';
                  return (
                    <div
                      key={`question-${idx}`}
                      className={`
                        p-2 rounded text-sm flex items-center gap-2 transition-all cursor-pointer
                        ${idx === currentQuestionIndex ? 'bg-amber-100/70 text-amber-700' : ''}
                        ${idx < currentQuestionIndex ? 'text-green-600 hover:bg-amber-50/80 hover:text-amber-700' : 'text-stone-500'}
                        ${idx > currentQuestionIndex ? 'text-stone-400' : ''}
                      `}
                      onMouseEnter={(e) => {
                        if (idx < currentQuestionIndex) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredQuestion({ 
                            idx, 
                            text: questionText,
                            x: rect.left,
                            y: rect.top
                          });
                        }
                      }}
                      onMouseLeave={() => setHoveredQuestion(null)}
                    >
                      {idx < currentQuestionIndex ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-current"></div>
                      )}
                      <span className="text-xs">Q{idx + 1}</span>
                    </div>
                  );
                })}
              </div>

              {/* Fixed Tooltip for hovered questions */}
            </div>

            {/* Navigation Buttons */}
            <div className="space-y-3">
              {/* Skip Question Button */}
              {questionProgress < totalQuestions && (
                <Button onClick={handleNextQuestion} variant="outline" className="w-full">
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip
                </Button>
              )}

              {/* Next/Complete Button */}
              <Button
                onClick={
                  questionProgress < totalQuestions ? handleNextQuestion : handleCompleteInterview
                }
                disabled={isCompleting}
                className="w-full bg-amber-700 hover:bg-amber-800 disabled:opacity-70"
              >
                {isCompleting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" /> Completing...
                  </>
                ) : questionProgress < totalQuestions ? (
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

        {/* Live Session Feed - Transcripts & Emotions */}
        <div className="mt-8 bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl overflow-hidden">
          {/* Panel header */}
          <div className="px-6 py-4 border-b border-amber-700/20 flex items-center justify-between">
            <h3 className="font-semibold text-black">Live Session Feed</h3>
            <div className="flex items-center gap-3 text-xs text-stone-500">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full inline-block ${streamStatus.isRecording ? 'bg-red-500 animate-pulse' : 'bg-stone-300'}`}></span>
                {streamStatus.chunksRecorded} audio chunk{streamStatus.chunksRecorded !== 1 ? 's' : ''}
              </span>
              <span className="text-stone-300">·</span>
              <span>{transcriptions.length} transcript{transcriptions.length !== 1 ? 's' : ''}</span>
              <span className="text-stone-300">·</span>
              <span>{liveEmotions.length} emotion read{liveEmotions.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="grid grid-cols-5 divide-x divide-amber-700/10">
            {/* Q&A Transcript Column */}
            <div className="col-span-3 p-5">
              <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Transcripts</h4>
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {Array.from(new Set(transcriptions.map((t) => t.questionNumber)))
                  .sort((a, b) => a - b)
                  .map((qNum) => {
                    const rawQ = currentSession.questions[qNum - 1] as any;
                    const qLabel = rawQ?.question || rawQ?.question_text || '';
                    const qChunks = transcriptions.filter((t) => t.questionNumber === qNum);
                    return (
                      <div key={qNum}>
                        <p className="text-xs font-semibold text-amber-700 mb-1.5">
                          Q{qNum}{qLabel ? `: ${qLabel.slice(0, 70)}${qLabel.length > 70 ? '\u2026' : ''}` : ''}
                        </p>
                        <p className="text-sm text-stone-700 leading-relaxed bg-white/60 rounded-lg px-3 py-2 border border-amber-700/10">
                          {qChunks.map((c) => c.text).join(' ')}
                        </p>
                      </div>
                    );
                  })}
                {transcriptions.length === 0 && (
                  <p className="text-stone-400 text-sm italic">Transcriptions will appear here as you speak\u2026</p>
                )}
              </div>
            </div>

            {/* Live Emotion Column */}
            <div className="col-span-2 p-5">
              <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Live Emotions</h4>
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {[...liveEmotions].reverse().map((e, i) => {
                  const score =
                    typeof e.score === 'number' ? e.score : parseFloat(String(e.score)) || 0;
                  const pct = Math.min(100, Math.round(score * 100));
                  const label = e.label.toLowerCase();
                  const colorClass =
                    label.includes('happy') || label.includes('joy')
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : label.includes('sad') || label.includes('fear')
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : label.includes('angry') || label.includes('disgust')
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : label.includes('surprise')
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : label.includes('neutral')
                              ? 'bg-stone-50 text-stone-600 border-stone-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200';
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${colorClass}`}
                    >
                      <span className="font-semibold capitalize min-w-[72px]">{e.label}</span>
                      <div className="flex-1 h-1.5 bg-black/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-current rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="tabular-nums w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
                {liveEmotions.length === 0 && (
                  <p className="text-stone-400 text-sm italic">Emotion analysis will appear here\u2026</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Question Tooltip - rendered at root level */}
      {hoveredQuestion && (
        <div 
          className="fixed z-[9999] w-72 p-4 bg-white border-2 border-amber-700/40 rounded-xl shadow-2xl pointer-events-none"
          style={{
            left: `${Math.max(16, hoveredQuestion.x - 300)}px`,
            top: `${hoveredQuestion.y}px`,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-amber-700 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{hoveredQuestion.idx + 1}</span>
            </div>
            <span className="text-sm font-semibold text-amber-700">Question {hoveredQuestion.idx + 1}</span>
            <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
          </div>
          <p className="text-stone-700 text-sm leading-relaxed">{hoveredQuestion.text}</p>
        </div>
      )}
    </div>
  );
}
