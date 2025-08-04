import { useState, useEffect, useRef, useCallback } from 'react';
import { VideoAnalyzer, ROOM_OBJECTS, isRoomObject, type RoomObjectKey } from '@/utils/tf-helpers';
import type { ScoreEvent } from '@/components/ScoringOverlay';

interface UseVideoAnalysisProps {
  videoElement: HTMLVideoElement | null;
  isRecording: boolean;
  challengeId: string;
  referenceImageUrl?: string;
}

export function useVideoAnalysis({ 
  videoElement, 
  isRecording, 
  challengeId,
  referenceImageUrl 
}: UseVideoAnalysisProps) {
  const [analyzer] = useState(() => new VideoAnalyzer());
  const [isInitialized, setIsInitialized] = useState(false);
  const [scoreEvents, setScoreEvents] = useState<ScoreEvent[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [detectedObjects, setDetectedObjects] = useState<Set<string>>(new Set());
  
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMatchCheckRef = useRef<number>(0);

  // Initialize TensorFlow.js models
  useEffect(() => {
    let mounted = true;

    const initializeModels = async () => {
      try {
        await analyzer.initialize();
        if (mounted) {
          setIsInitialized(true);
          console.log('Video analysis ready');
        }
      } catch (error) {
        console.error('Failed to initialize video analysis:', error);
      }
    };

    initializeModels();

    return () => {
      mounted = false;
      analyzer.dispose();
    };
  }, [analyzer]);

  // Add score event
  const addScoreEvent = useCallback((
    points: number, 
    label: string, 
    emoji: string, 
    type: 'object' | 'match'
  ) => {
    const event: ScoreEvent = {
      id: `${Date.now()}-${Math.random()}`,
      points,
      label,
      emoji,
      type,
      timestamp: Date.now()
    };

    setScoreEvents(prev => [...prev, event]);
    setTotalScore(prev => prev + points);
  }, []);

  // Analyze video frame
  const analyzeFrame = useCallback(async () => {
    if (!videoElement || !isInitialized || !isRecording) return;

    try {
      // Object detection
      const detections = await analyzer.detectObjects(videoElement);
      
      detections.forEach(detection => {
        if (detection.score > 0.4 && isRoomObject(detection.class)) { // Lowered threshold from 0.6 to 0.4
          const objectKey = detection.class as RoomObjectKey;
          
          // Only award points once per object type per recording session
          if (!detectedObjects.has(objectKey)) {
            const objectInfo = ROOM_OBJECTS[objectKey];
            addScoreEvent(
              objectInfo.points,
              objectInfo.label,
              objectInfo.emoji,
              'object'
            );
            
            setDetectedObjects(prev => new Set(Array.from(prev).concat(objectKey)));
          }
        }
      });

      // Similarity matching (less frequent to avoid performance issues)
      const now = Date.now();
      if (referenceImageUrl && now - lastMatchCheckRef.current > 3000) { // Check every 3 seconds
        lastMatchCheckRef.current = now;
        
        const matchResult = await analyzer.compareWithReference(
          videoElement,
          referenceImageUrl,
          0.85
        );

        if (matchResult.isMatch) {
          addScoreEvent(
            25,
            'Perfect room match!',
            '🎯',
            'match'
          );
        }
      }
    } catch (error) {
      console.error('Frame analysis failed:', error);
    }
  }, [videoElement, isInitialized, isRecording, analyzer, detectedObjects, referenceImageUrl, addScoreEvent]);

  // Start/stop analysis based on recording state
  useEffect(() => {
    if (isRecording && isInitialized && videoElement) {
      // Start analysis loop
      analysisIntervalRef.current = setInterval(analyzeFrame, 1000); // Analyze every 1 second for better responsiveness
      console.log('Started video analysis');
    } else {
      // Stop analysis
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
        console.log('Stopped video analysis');
      }
    }

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, [isRecording, isInitialized, videoElement, analyzeFrame]);

  // Reset for new recording
  const resetAnalysis = useCallback(() => {
    setScoreEvents([]);
    setTotalScore(0);
    setDetectedObjects(new Set());
    lastMatchCheckRef.current = 0;
  }, []);

  return {
    isInitialized,
    scoreEvents,
    totalScore,
    detectedObjects: Array.from(detectedObjects),
    resetAnalysis
  };
}
