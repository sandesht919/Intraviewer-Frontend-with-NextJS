/**
 * useWebSocket Hook
 * 
 * Custom hook for managing WebSocket connections for real-time communication.
 * Handles connection establishment, message sending/receiving, and reconnection logic.
 * 
 * Future Integration:
 * - Connect to your backend WebSocket server
 * - Exchange SDP offers/answers for WebRTC signaling
 * - Send/receive interview questions and responses in real-time
 * - Stream facial expression analysis data
 */

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Interface for WebSocket message
 */
interface WebSocketMessage {
  type: string;
  payload?: any;
  timestamp?: number;
}

/**
 * Custom hook for WebSocket management
 * 
 * @param {string} url - WebSocket server URL
 * @param {Object} options - Configuration options
 * @param {number} options.reconnectInterval - Milliseconds between reconnection attempts
 * @param {number} options.maxReconnectAttempts - Maximum number of reconnection attempts
 * @returns {Object} WebSocket state and methods
 * - isConnected: Connection state
 * - error: Error message if any
 * - send: Function to send message to server
 * - on: Function to register message listener
 * - off: Function to unregister message listener
 * - reconnect: Function to manually reconnect
 */
export const useWebSocket = (
  url: string,
  options?: {
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
  }
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const messageListenersRef = useRef<Map<string, Set<Function>>>(new Map());
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const reconnectInterval = options?.reconnectInterval || 3000;
  const maxReconnectAttempts = options?.maxReconnectAttempts || 5;

  /**
   * Connect to WebSocket server
   * 
   * TODO: Ensure backend WebSocket server is running at the specified URL
   * TODO: Implement proper authentication (send auth token on connection)
   */
  const connect = useCallback(() => {
    try {
      // Prevent multiple concurrent connection attempts
      if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
        return;
      }

      console.log(`Connecting to WebSocket: ${url}`);

      // Create new WebSocket connection
      const ws = new WebSocket(url);

      /**
       * Handle connection open
       * TODO: Send authentication token after connection
       */
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;

        // TODO: Send auth token to server
        // const authMessage = {
        //   type: 'auth',
        //   token: localStorage.getItem('authToken')
        // };
        // ws.send(JSON.stringify(authMessage));
      };

      /**
       * Handle incoming messages
       * Parse and dispatch to registered listeners
       */
      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('Message received:', message);

          // Dispatch message to all listeners for this message type
          const listeners = messageListenersRef.current.get(message.type);
          if (listeners) {
            listeners.forEach(listener => {
              try {
                listener(message.payload);
              } catch (err) {
                console.error('Error in message listener:', err);
              }
            });
          }

          // TODO: Handle specific message types
          // Examples:
          // - 'question': New interview question from AI
          // - 'offer': WebRTC offer from remote peer
          // - 'answer': WebRTC answer from remote peer
          // - 'ice-candidate': ICE candidate for WebRTC
          // - 'analysis': Real-time facial expression analysis
          // - 'session-status': Interview session status update
        } catch (err) {
          console.error('Failed to parse message:', err);
        }
      };

      /**
       * Handle WebSocket errors
       */
      ws.onerror = (event) => {
        const errorMessage = 'WebSocket error occurred';
        console.error(errorMessage, event);
        setError(errorMessage);
      };

      /**
       * Handle connection close
       * Attempt reconnection if appropriate
       */
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;

        // Attempt reconnection
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const waitTime = reconnectInterval * Math.pow(2, reconnectAttemptsRef.current - 1);
          console.log(`Reconnection attempt ${reconnectAttemptsRef.current} in ${waitTime}ms`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, waitTime);
        } else {
          setError('Max reconnection attempts reached');
        }
      };

      wsRef.current = ws;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to connect to WebSocket';
      console.error(errorMessage);
      setError(errorMessage);
    }
  }, [url, reconnectInterval, maxReconnectAttempts]);

  /**
   * Send message to WebSocket server
   * 
   * @param {string} type - Message type identifier
   * @param {any} payload - Message payload/data
   */
  const send = useCallback((type: string, payload?: any) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('WebSocket not connected');
      console.warn('Cannot send message: WebSocket not connected');
      return;
    }

    try {
      const message: WebSocketMessage = {
        type,
        payload,
        timestamp: Date.now()
      };

      wsRef.current.send(JSON.stringify(message));
      console.log('Message sent:', message);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send message';
      setError(errorMessage);
      console.error(errorMessage);
    }
  }, []);

  /**
   * Register listener for specific message type
   * 
   * @param {string} type - Message type to listen for
   * @param {Function} listener - Callback function when message is received
   */
  const on = useCallback((type: string, listener: (payload: any) => void) => {
    if (!messageListenersRef.current.has(type)) {
      messageListenersRef.current.set(type, new Set());
    }
    messageListenersRef.current.get(type)?.add(listener);

    // Return unsubscribe function
    return () => {
      messageListenersRef.current.get(type)?.delete(listener);
    };
  }, []);

  /**
   * Unregister listener for specific message type
   * 
   * @param {string} type - Message type
   * @param {Function} listener - Callback function to remove
   */
  const off = useCallback((type: string, listener: (payload: any) => void) => {
    messageListenersRef.current.get(type)?.delete(listener);
  }, []);

  /**
   * Manually trigger reconnection
   */
  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  /**
   * Initialize connection on mount
   */
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      // Cancel any pending reconnection
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Close WebSocket connection
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      // Clear all listeners
      messageListenersRef.current.clear();
    };
  }, [connect]);

  return {
    isConnected,
    error,
    send,
    on,
    off,
    reconnect
  };
};
