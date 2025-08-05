import { useState, useRef, useCallback } from 'react';

export type RecordingState = 'idle' | 'recording' | 'paused';

export function useMediaRecorder(stream: MediaStream | null) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(() => {
    if (!stream) return;

    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9' // Fallback to vp8 if needed
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      setRecordingState('recording');
    } catch (error) {
      console.error('Failed to start recording:', error);
      // Fallback to basic MediaRecorder
      try {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        mediaRecorder.start(1000);
        setRecordingState('recording');
      } catch (fallbackError) {
        console.error('MediaRecorder not supported:', fallbackError);
      }
    }
  }, [stream]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
    }
  }, [recordingState]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
    }
  }, [recordingState]);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || recordingState === 'idle') {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordingState('idle');
        resolve(blob);
      };

      mediaRecorderRef.current.stop();
    });
  }, [recordingState]);

  return {
    recordingState,
    isRecording: recordingState === 'recording',
    isPaused: recordingState === 'paused',
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  };
}
