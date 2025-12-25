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

import { useEffect, useRef, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAuthStore } from "@/lib/stores/authStore";

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
    apiBaseUrl = "http://localhost:8000",
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
      throw new Error("No access token available");
    }

    try {
      const response = await fetch(`${apiBaseUrl}/sessions/start`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to create session");
      }

      const data = await response.json();
      backendSessionIdRef.current = data.session_id;
      setStatus((prev) => ({ ...prev, sessionId: data.session_id }));

      console.log("✅ Backend session created:", data.session_id);
      return data.session_id;
    } catch (err: any) {
      console.error("❌ Failed to create session:", err);
      throw err;
    }
  }, [accessToken, apiBaseUrl]);

  /**
   * Initialize WebSocket connection
   */
  const connectWebSocket = useCallback(
    async (sessionId: number) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;

      if (!accessToken) {
        console.error("❌ No access token available");
        setStatus((prev) => ({ ...prev, error: "Authentication required" }));
        return;
      }

      // WebSocket URL with session_id in path and token in query
      const wsProtocol = apiBaseUrl.startsWith("https") ? "wss" : "ws";
      const wsHost = apiBaseUrl.replace(/^https?:\/\//, "");
      const wsUrl = `${wsProtocol}://${wsHost}/ws/sessions/${sessionId}
      )}`;

      console.log("🔌 Connecting to WebSocket:", wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("🔌 WebSocket connected to session:", sessionId);

        // Send initial metadata
        ws.send(
          JSON.stringify({
            type: "session_init",
            client_session_id: sessionIdRef.current,
            backend_session_id: sessionId,
            interview_session_id: interviewSessionId,
            timestamp: new Date().toISOString(),
          })
        );

        setStatus((prev) => ({ ...prev, isConnected: true, error: null }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📨 Received message type:", data.type);
          console.log("📦 Full data:", data);

          if (data.type === "session_init_ack") {
            console.log("✅ Session initialized:", data.session_id);
          } else if (data.type === "transcription") {
            console.log(
              "🎤 Transcription received:",
              data.text || data.transcription
            );
          } else if (data.type === "audio_received") {
            console.log("🔊 Audio chunk received:", data);
          } else if (data.type === "frame_received") {
            console.log("📸 Frame received:", data);
          }
        } catch (err) {
          console.error("❌ Failed to parse message:", err);
          console.log("📄 Raw message:", event.data);
        }
      };

      ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        setStatus((prev) => ({ ...prev, error: "WebSocket connection error" }));
      };

      ws.onclose = () => {
        console.log("🔌 WebSocket disconnected");
        setStatus((prev) => ({ ...prev, isConnected: false }));

        // Attempt reconnect after 3 seconds if we have a token and session
        if (accessToken && sessionId) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("🔄 Attempting to reconnect...");
            connectWebSocket(sessionId);
          }, 3000);
        }
      };

      wsRef.current = ws;
    },
    [apiBaseUrl, interviewSessionId, accessToken]
  );

  /**
   * Send binary blob via WebSocket
   */
  const sendBlob = useCallback((type: "a" | "f", index: number, blob: Blob) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("⚠️ WebSocket not ready, skipping blob");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;

      // Create header: [session_id(36)][type(1)][index(4)]
      const sessionIdBytes = new TextEncoder().encode(
        sessionIdRef.current.padEnd(36)
      );
      const typeBytes = new Uint8Array([type.charCodeAt(0)]);
      const indexBytes = new Uint8Array(4);
      new DataView(indexBytes.buffer).setUint32(0, index, false);

      // Combine header + data
      const combined = new Uint8Array(
        sessionIdBytes.length +
          typeBytes.length +
          indexBytes.length +
          arrayBuffer.byteLength
      );

      combined.set(sessionIdBytes, 0);
      combined.set(typeBytes, 36);
      combined.set(indexBytes, 37);
      combined.set(new Uint8Array(arrayBuffer), 41);

      wsRef.current?.send(combined);
    };

    reader.readAsArrayBuffer(blob);
  }, []);

  /**
   * Start audio recording
   */
  const startAudioRecording = useCallback(() => {
    if (!mediaStreamRef.current) return;

    try {
      const audioStream = new MediaStream(
        mediaStreamRef.current.getAudioTracks()
      );

      const mediaRecorder = new MediaRecorder(audioStream, {
        mimeType: "audio/webm;codecs=opus",
      });

      let chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const chunkIndex = chunkIndexRef.current;
        const endTime = Date.now();

        // Send metadata first
        wsRef.current?.send(
          JSON.stringify({
            type: "audio_metadata",
            session_id: sessionIdRef.current,
            chunk_index: chunkIndex,
            start_timestamp: new Date(
              currentChunkStartTimeRef.current
            ).toISOString(),
            end_timestamp: new Date(endTime).toISOString(),
            duration_ms: endTime - currentChunkStartTimeRef.current,
            size: blob.size,
          })
        );

        // Then send blob
        sendBlob("a", chunkIndex, blob);

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
            if (mediaRecorder.state === "recording") {
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
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
      }, audioChunkDuration);

      mediaRecorderRef.current = mediaRecorder;
    } catch (err: any) {
      console.error("Failed to start audio recording:", err);
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
      const ctx = canvas.getContext("2d");

      if (!ctx || video.readyState < 2) return;

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) return;

          const frameIndex = frameIndexRef.current;
          const timestamp = Date.now();
          const offset = timestamp - currentChunkStartTimeRef.current;

          // Send metadata first
          wsRef.current?.send(
            JSON.stringify({
              type: "frame_metadata",
              session_id: sessionIdRef.current,
              frame_index: frameIndex,
              chunk_index: chunkIndexRef.current,
              timestamp: new Date(timestamp).toISOString(),
              offset_ms: offset,
              size: blob.size,
            })
          );

          // Then send blob
          sendBlob("f", frameIndex, blob);

          setStatus((prev) => ({
            ...prev,
            framesRecorded: prev.framesRecorded + 1,
          }));
          frameIndexRef.current++;
        },
        "image/jpeg",
        0.85
      );
    } catch (err: any) {
      console.error("Failed to capture frame:", err);
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
    async (
      videoElement: HTMLVideoElement,
      canvasElement: HTMLCanvasElement
    ) => {
      try {
        console.log("🎬 Starting recording...");

        // Step 1: Create backend session first
        const sessionId = await createBackendSession();

        // Step 2: Get media stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        mediaStreamRef.current = stream;
        videoRef.current = videoElement;
        canvasRef.current = canvasElement;

        // Set video source
        videoElement.srcObject = stream;
        await videoElement.play();

        // Step 3: Connect WebSocket with session ID
        await connectWebSocket(sessionId);

        // Step 4: Wait for WebSocket to be ready
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
            reject(new Error("WebSocket connection timeout"));
          }, 10000);
        });

        // Step 5: Start recording
        recordingStartTimeRef.current = Date.now();
        currentChunkStartTimeRef.current = Date.now();

        startAudioRecording();
        startFrameCapture();

        setStatus((prev) => ({ ...prev, isRecording: true, error: null }));
        console.log("✅ Recording started successfully");
      } catch (err: any) {
        console.error("❌ Failed to start recording:", err);
        setStatus((prev) => ({ ...prev, error: err.message }));

        // Cleanup on error
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        }
      }
    },
    [
      createBackendSession,
      connectWebSocket,
      startAudioRecording,
      startFrameCapture,
    ]
  );

  /**
   * Stop recording
   */
  const stopRecording = useCallback(() => {
    // Stop audio recording
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
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
          type: "session_complete",
          session_id: sessionIdRef.current,
          timestamp: new Date().toISOString(),
          total_chunks: chunkIndexRef.current,
          total_frames: frameIndexRef.current,
        })
      );
    }

    setStatus((prev) => ({ ...prev, isRecording: false }));
    console.log("🛑 Recording stopped");
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
    sessionId: sessionIdRef.current,
    status,
    startRecording,
    stopRecording,
  };
};
