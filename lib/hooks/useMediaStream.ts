/**
 * useMediaStream Hook
 *
 * Manages real-time media streaming for interview sessions:
 * - Captures audio in 10-second chunks
 * - Captures video frames every 2 seconds
 * - Streams data via WebSocket to backend
 * - Maintains synchronization between audio and video
 * - Handles reconnection gracefully
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuthStore } from '@/lib/stores/authStore';

interface MediaStreamConfig {
  audioChunkDuration?: number; // milliseconds (default: 10000)
  frameInterval?: number; // milliseconds (default: 2000)
  apiBaseUrl?: string; // API base URL (default: http://localhost:8000)
  interviewSessionId?: number;
}

interface MediaStreamStatus {
  isConnected: boolean;
  isRecording: boolean;
  chunksRecorded: number;
  framesRecorded: number;
  error: string | null;
  sessionId: number | null; // Backend session ID
}

export const useMediaStream = (config: MediaStreamConfig = {}) => {
  const {
    audioChunkDuration = 10000,
    frameInterval = 2000,
    apiBaseUrl = 'http://localhost:8000',
    interviewSessionId,
  } = config;

  // Get auth token from store
  const accessToken = useAuthStore((state) => state.accessToken);

  // State
  const [status, setStatus] = useState<MediaStreamStatus>({
    isConnected: false,
    isRecording: false,
    chunksRecorded: 0,
    framesRecorded: 0,
    error: null,
    sessionId: null,
  });

  // Refs
  const sessionIdRef = useRef<string>(uuidv4());
  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const chunkIndexRef = useRef<number>(0);
  const frameIndexRef = useRef<number>(0);
  const recordingStartTimeRef = useRef<number>(0);
  const currentChunkStartTimeRef = useRef<number>(0);

  const frameIntervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const backendSessionIdRef = useRef<number | null>(null);

  /**
   * Create backend session via API
   */
  const createBackendSession = useCallback(async () => {
    if (!accessToken) {
      throw new Error('No access token available');
    }

    try {
      const response = await fetch(`${apiBaseUrl}/sessions/start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create session');
      }

      const data = await response.json();
      backendSessionIdRef.current = data.session_id;
      setStatus((prev) => ({ ...prev, sessionId: data.session_id }));

      console.log('✅ Backend session created:', data.session_id);
      return data.session_id;
    } catch (err: any) {
      console.error('❌ Failed to create session:', err);
      throw err;
    }
  }, [accessToken, apiBaseUrl]);

  /**
   * Initialize WebSocket connection
   */
  const connectWebSocket = useCallback(
    async (sessionId: number) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;

      // WebSocket URL matching backend: /ws/sessions/{session_id}
      const wsProtocol = apiBaseUrl.startsWith('https') ? 'wss' : 'ws';
      const wsHost = apiBaseUrl.replace(/^https?:\/\//, '');
      const wsUrl = `${wsProtocol}://${wsHost}/sessions/ws/sessions/${sessionId}`;

      console.log('🔌 Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('🔌 WebSocket connected to session:', sessionId);
        setStatus((prev) => ({ ...prev, isConnected: true, error: null }));
      };

      ws.onmessage = (event) => {
        console.log('📨 Received from backend:', event.data);
        // Backend sends transcriptions as text
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setStatus((prev) => ({ ...prev, error: 'WebSocket connection error' }));
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setStatus((prev) => ({ ...prev, isConnected: false }));

        // Attempt reconnect after 3 seconds if we have a session
        if (sessionId) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Attempting to reconnect...');
            connectWebSocket(sessionId);
          }, 3000);
        }
      };

      wsRef.current = ws;
    },
    [apiBaseUrl]
  );

  /**
   * Send audio/video blob via WebSocket in backend-expected format
   * Backend expects: { type: "audio" | "video", data: base64_string }
   */
  const sendBlob = useCallback((type: 'audio' | 'video', blob: Blob) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ WebSocket not ready, skipping blob');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      console.log('the audio chunks', base64);

      // Send in backend-expected format
      wsRef.current?.send(
        JSON.stringify({
          type,
          data: base64,
        })
      );
    };

    reader.readAsArrayBuffer(blob);
  }, []);

  /**
   * Start audio recording
   */
  const startAudioRecording = useCallback(() => {
    if (!mediaStreamRef.current) return;

    try {
      const audioStream = new MediaStream(mediaStreamRef.current.getAudioTracks());

      const mediaRecorder = new MediaRecorder(audioStream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      let chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const chunkIndex = chunkIndexRef.current;

        console.log(`🎤 Sending audio chunk ${chunkIndex}, size: ${blob.size} bytes`);

        // Send audio blob in backend format
        sendBlob('audio', blob);
        console.log('the audion formate ', blob);

        setStatus((prev) => ({
          ...prev,
          chunksRecorded: prev.chunksRecorded + 1,
        }));

        // Clear chunks to free memory
        chunks = [];
        chunkIndexRef.current++;
        currentChunkStartTimeRef.current = Date.now();

        // Start next chunk if media recorder still exists (not stopped by user)
        if (mediaRecorderRef.current === mediaRecorder) {
          mediaRecorder.start();
          setTimeout(() => {
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
          }, audioChunkDuration);
        }
      };

      // Start first chunk
      currentChunkStartTimeRef.current = Date.now();
      mediaRecorder.start();

      // Stop after chunk duration
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, audioChunkDuration);

      mediaRecorderRef.current = mediaRecorder;
    } catch (err: any) {
      console.error('Failed to start audio recording:', err);
      setStatus((prev) => ({ ...prev, error: err.message }));
    }
  }, [status.isRecording, audioChunkDuration, sendBlob]);

  /**
   * Capture video frame
   */
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (!ctx || !video || video.readyState < 2) return;

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob and send
      canvas.toBlob(
        (blob) => {
          if (!blob) return;

          const frameIndex = frameIndexRef.current;
          console.log(`📸 Sending video frame ${frameIndex}, size: ${blob.size} bytes`);

          // Send frame in backend format
          sendBlob('video', blob);

          setStatus((prev) => ({
            ...prev,
            framesRecorded: prev.framesRecorded + 1,
          }));
          frameIndexRef.current++;
        },
        'image/jpeg',
        0.85
      );
    } catch (err: any) {
      console.error('Failed to capture frame:', err);
    }
  }, [sendBlob]);

  /**
   * Start frame capture interval
   */
  const startFrameCapture = useCallback(() => {
    if (frameIntervalIdRef.current) return;

    // Capture first frame immediately
    captureFrame();

    // Then capture every N seconds
    frameIntervalIdRef.current = setInterval(() => {
      captureFrame();
    }, frameInterval);
  }, [captureFrame, frameInterval]);

  /**
   * Stop frame capture
   */
  const stopFrameCapture = useCallback(() => {
    if (frameIntervalIdRef.current) {
      clearInterval(frameIntervalIdRef.current);
      frameIntervalIdRef.current = null;
    }
  }, []);

  /**
   * Start recording
   */
  const startRecording = useCallback(
    async (videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement) => {
      try {
        console.log('🎬 Starting recording...');

        // Validate we have a session ID from props
        if (!interviewSessionId) {
          throw new Error(
            'No interview session ID provided. Please start interview from prepare page.'
          );
        }

        console.log('📝 Using interview session ID:', interviewSessionId);

        // Step 1: Store video and canvas refs
        videoRef.current = videoElement;
        canvasRef.current = canvasElement;

        // Step 1.5: Extract media stream from video element
        const stream = videoElement.srcObject as MediaStream;
        if (!stream) {
          throw new Error(
            'No media stream found on video element. Ensure camera/microphone access is granted.'
          );
        }
        mediaStreamRef.current = stream;
        console.log(
          '📹 Media stream captured:',
          stream.getTracks().map((t) => `${t.kind}: ${t.label}`)
        );

        // Step 2: Connect WebSocket with session ID
        await connectWebSocket(interviewSessionId);
        backendSessionIdRef.current = interviewSessionId;
        setStatus((prev) => ({ ...prev, sessionId: interviewSessionId }));

        // Step 3: Wait for WebSocket to be ready
        await new Promise((resolve, reject) => {
          const checkConnection = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              clearInterval(checkConnection);
              resolve(true);
            }
          }, 100);

          // Timeout after 10 seconds
          setTimeout(() => {
            clearInterval(checkConnection);
            reject(new Error('WebSocket connection timeout'));
          }, 10000);
        });

        // Step 4: Start recording
        recordingStartTimeRef.current = Date.now();
        currentChunkStartTimeRef.current = Date.now();

        startAudioRecording();
        startFrameCapture();

        setStatus((prev) => ({ ...prev, isRecording: true, error: null }));
        console.log('✅ Recording started successfully with session:', interviewSessionId);
      } catch (err: any) {
        console.error('❌ Failed to start recording:', err);
        setStatus((prev) => ({ ...prev, error: err.message }));
        throw err;
      }
    },
    [interviewSessionId, connectWebSocket, startAudioRecording, startFrameCapture]
  );

  /**
   * Stop recording
   */
  const stopRecording = useCallback(() => {
    // Stop audio recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    // Stop frame capture
    stopFrameCapture();

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Send session complete
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'session_complete',
          session_id: sessionIdRef.current,
          timestamp: new Date().toISOString(),
          total_chunks: chunkIndexRef.current,
          total_frames: frameIndexRef.current,
        })
      );
    }

    setStatus((prev) => ({ ...prev, isRecording: false }));
    console.log('🛑 Recording stopped');
  }, [stopFrameCapture]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopRecording();
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [stopRecording]);

  return {
    sessionId: status.sessionId, // Return backend session ID
    status,
    startRecording,
    stopRecording,
  };
};
