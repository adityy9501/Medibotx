import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for Server-Sent Events (SSE)
 * @param {string} url - The SSE endpoint URL
 * @param {Object} options - Configuration options
 * @returns {Object} - { data, error, isConnected, connect, disconnect }
 */
export const useSSE = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef(null);

  const {
    onMessage,
    onError,
    onOpen,
    reconnect = true,
    reconnectInterval = 3000,
    eventName = 'message',
  } = options;

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        setError(null);
        if (onOpen) onOpen();
      };

      eventSource.addEventListener(eventName, (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          setData(parsedData);
          if (onMessage) onMessage(parsedData);
        } catch (err) {
          setData(event.data);
          if (onMessage) onMessage(event.data);
        }
      });

      eventSource.onerror = (err) => {
        setIsConnected(false);
        setError(err);
        if (onError) onError(err);

        if (reconnect) {
          setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };
    } catch (err) {
      setError(err);
      if (onError) onError(err);
    }
  }, [url, eventName, onMessage, onError, onOpen, reconnect, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    data,
    error,
    isConnected,
    connect,
    disconnect,
  };
};

/**
 * Custom hook for streaming chat with SSE using fetch
 * @param {string} url - The API endpoint
 * @param {Object} requestData - The request payload
 * @param {Function} onChunk - Callback for each chunk
 * @param {Function} onComplete - Callback when stream completes
 * @param {Function} onError - Callback for errors
 */
export const useStreamingChat = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef(null);

  const startStream = useCallback(async (url, requestData, onChunk, onComplete, onError) => {
    if (isStreaming) {
      console.warn('Stream already in progress');
      return;
    }

    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(requestData),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          setIsStreaming(false);
          if (onComplete) onComplete();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            try {
              const data = JSON.parse(jsonStr);
              
              if (data.error) {
                setIsStreaming(false);
                if (onError) onError(data.error);
                return;
              }
              
              if (data.done) {
                setIsStreaming(false);
                if (onComplete) onComplete();
                return;
              }
              
              if (data.content && onChunk) {
                onChunk(data.content);
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        setIsStreaming(false);
        if (onError) onError(error.message);
      }
    }
  }, [isStreaming]);

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  return {
    isStreaming,
    startStream,
    stopStream,
  };
};
