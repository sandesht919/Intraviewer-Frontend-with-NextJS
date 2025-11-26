/**
 * useWebRTC Hook
 * 
 * Custom hook for managing WebRTC connections for audio/video streaming.
 * Handles media stream initialization, peer connections, and data channel communication.
 * 
 * Future Integration:
 * - Connect to STUN/TURN servers for NAT traversal
 * - Implement signaling through WebSocket
 * - Handle ICE candidates exchange
 * - Record video/audio streams for backend analysis
 */

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Interface for WebRTC configuration
 */
interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

/**
 * Interface for media constraints
 */
interface MediaConstraints {
  audio: boolean | MediaTrackConstraints;
  video: boolean | MediaTrackConstraints;
}

/**
 * Custom hook for WebRTC management
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.signalingServer - WebSocket server URL for signaling
 * @returns {Object} WebRTC state and methods
 * - localStream: User's media stream (audio/video)
 * - remoteStream: Remote peer's media stream
 * - isConnected: Connection state
 * - error: Error message if any
 * - initializeMedia: Function to start media capture
 * - startCall: Function to initiate peer connection
 * - stopCall: Function to end connection
 * - sendMessage: Function to send data through data channel
 * - recordStream: Function to record audio/video
 */
export const useWebRTC = (options?: { signalingServer?: string }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs to maintain WebRTC objects across renders
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  /**
   * Initialize media stream (camera and microphone)
   * 
   * TODO: Add error handling for permission denied
   * TODO: Handle device enumeration for multiple cameras/mics
   */
  const initializeMedia = useCallback(async (constraints?: MediaConstraints) => {
    try {
      setError(null);

      // Default constraints: require both audio and video
      const mediaConstraints: MediaConstraints = constraints || {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      };

      // Request media from user
      const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      setLocalStream(stream);

      return stream;
    } catch (err: any) {
      const errorMessage = 
        err.name === 'NotAllowedError' 
          ? 'Camera/Microphone access denied. Please check permissions.'
          : err.name === 'NotFoundError'
          ? 'No camera or microphone found on your device.'
          : err.message || 'Failed to initialize media';

      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Create and configure RTCPeerConnection
   * 
   * TODO: Add STUN/TURN servers for NAT traversal
   * TODO: Implement proper ICE candidate handling
   */
  const createPeerConnection = useCallback((): RTCPeerConnection => {
    // WebRTC configuration with STUN servers
    const config: RTCConfiguration = {
      iceServers: [
        // Public STUN servers (freely available)
        { urls: ['stun:stun.l.google.com:19302'] },
        { urls: ['stun:stun1.l.google.com:19302'] },
        { urls: ['stun:stun2.l.google.com:19302'] },
        { urls: ['stun:stun3.l.google.com:19302'] },
        { urls: ['stun:stun4.l.google.com:19302'] }
      ]
    };

    const peerConnection = new RTCPeerConnection(config);

    // Add local media tracks to peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('Remote track received:', event.track.kind);
      
      // Create new MediaStream from remote tracks
      if (!remoteStream) {
        const newRemoteStream = new MediaStream();
        setRemoteStream(newRemoteStream);
      }

      event.streams[0] && setRemoteStream(event.streams[0]);
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('ICE candidate found:', event.candidate);
        // TODO: Send ICE candidate to remote peer through signaling server
        // socket.emit('ice-candidate', event.candidate);
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
      setIsConnected(peerConnection.connectionState === 'connected');

      if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {
        setError('Connection lost. Attempting to reconnect...');
      }
    };

    // Create data channel for sending text/metadata
    const dataChannel = peerConnection.createDataChannel('metadata', {
      ordered: true
    });
    setupDataChannel(dataChannel);

    // Handle incoming data channel
    peerConnection.ondatachannel = (event) => {
      setupDataChannel(event.channel);
    };

    return peerConnection;
  }, [localStream, remoteStream]);

  /**
   * Setup data channel for bidirectional communication
   * This channel can be used to send interview metadata, current question, etc.
   */
  const setupDataChannel = useCallback((dataChannel: RTCDataChannel) => {
    dataChannelRef.current = dataChannel;

    dataChannel.onopen = () => {
      console.log('Data channel opened');
    };

    dataChannel.onclose = () => {
      console.log('Data channel closed');
    };

    dataChannel.onerror = (error) => {
      console.error('Data channel error:', error);
      setError('Data channel error: ' + error);
    };

    dataChannel.onmessage = (event) => {
      console.log('Message received:', event.data);
      // TODO: Handle incoming messages from backend
      // Could be acknowledgments, next question, or other metadata
    };
  }, []);

  /**
   * Start peer connection and create offer
   * 
   * TODO: Exchange SDP offers/answers through signaling server (WebSocket)
   */
  const startCall = useCallback(async (isInitiator: boolean = true) => {
    try {
      if (!localStream) {
        throw new Error('Local media stream not initialized');
      }

      const peerConnection = createPeerConnection();
      peerConnectionRef.current = peerConnection;

      if (isInitiator) {
        // Create and send offer
        const offer = await peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });

        await peerConnection.setLocalDescription(offer);
        console.log('Offer created');

        // TODO: Send offer to remote peer through signaling server
        // socket.emit('offer', offer);
      }

      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to start call';
      setError(errorMessage);
      throw err;
    }
  }, [localStream, createPeerConnection]);

  /**
   * Handle answer from remote peer
   * 
   * TODO: Call this method after receiving answer from remote peer
   */
  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    try {
      if (!peerConnectionRef.current) {
        throw new Error('No peer connection established');
      }

      const remoteDescription = new RTCSessionDescription(answer);
      await peerConnectionRef.current.setRemoteDescription(remoteDescription);
      console.log('Answer set successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to set answer');
      throw err;
    }
  }, []);

  /**
   * Handle offer from remote peer
   * 
   * TODO: Call this method after receiving offer from remote peer
   */
  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    try {
      const peerConnection = createPeerConnection();
      peerConnectionRef.current = peerConnection;

      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      console.log('Answer created');
      // TODO: Send answer to remote peer through signaling server
      // socket.emit('answer', answer);
    } catch (err: any) {
      setError(err.message || 'Failed to handle offer');
      throw err;
    }
  }, [createPeerConnection]);

  /**
   * Handle ICE candidate from remote peer
   * 
   * TODO: Call this method when receiving ICE candidates from remote peer
   */
  const handleICECandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    try {
      if (!peerConnectionRef.current) {
        throw new Error('No peer connection established');
      }

      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('ICE candidate added');
    } catch (err: any) {
      console.error('Failed to add ICE candidate:', err);
    }
  }, []);

  /**
   * Send message through data channel
   * Used to send metadata like current question, user responses, etc.
   */
  const sendMessage = useCallback((message: any) => {
    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      dataChannelRef.current.send(JSON.stringify(message));
      console.log('Message sent:', message);
    } else {
      setError('Data channel not ready');
    }
  }, []);

  /**
   * Start recording audio/video from local stream
   * This recording will be sent to backend for analysis
   * 
   * TODO: Implement proper stream recording with proper codecs
   * TODO: Send recorded chunks to backend periodically
   */
  const recordStream = useCallback((stream: MediaStream, mimeType: string = 'video/webm'): { stop: () => Blob } => {
    try {
      recordedChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: 2500000
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

      // Return function to stop recording and get blob
      return {
        stop: () => {
          mediaRecorder.stop();
          const blob = new Blob(recordedChunksRef.current, { type: mimeType });
          recordedChunksRef.current = [];
          return blob;
        }
      };
    } catch (err: any) {
      setError(err.message || 'Failed to start recording');
      throw err;
    }
  }, []);

  /**
   * Stop peer connection and clean up resources
   */
  const stopCall = useCallback(() => {
    // Stop media tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Close data channel
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    // Stop recording if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    setIsConnected(false);
    setError(null);
  }, [localStream, remoteStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCall();
    };
  }, [stopCall]);

  return {
    localStream,
    remoteStream,
    isConnected,
    error,
    initializeMedia,
    startCall,
    handleOffer,
    handleAnswer,
    handleICECandidate,
    stopCall,
    sendMessage,
    recordStream
  };
};
