import { useState, useEffect, useCallback } from 'react';

type UseCameraReturn = {
  stream: MediaStream | null;
  error: string | null;
  isLoading: boolean;
  initialize: () => Promise<void>;
  stop: () => void;
};

export function useCamera(initialLoad = true): UseCameraReturn {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(initialLoad);
  const [isInitialized, setIsInitialized] = useState(false);

  const initialize = useCallback(async () => {
    if (isInitialized) return;
    
    try {
      setIsLoading(true);
      setError(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });

      setStream(mediaStream);
      setIsInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to access camera');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const stop = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsInitialized(false);
    }
  }, [stream]);

  // Auto-initialize if initialLoad is true (default behavior)
  useEffect(() => {
    if (initialLoad && !isInitialized) {
      initialize().catch(console.error);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [initialLoad, isInitialized, initialize, stream]);

  return {
    stream,
    error,
    isLoading,
    initialize,
    stop
  };
}
