import { useState, useEffect, useRef } from "react";
import { Challenge, VideoClip, ChallengePrompt } from "@shared/schema";
import { useCamera } from "@/hooks/useCamera";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";
import { useVideoAnalysis } from "@/hooks/useVideoAnalysis";
import SketchOverlay from "./SketchOverlay";
import ScoringOverlay from "./ScoringOverlay";

interface EnhancedCameraInterfaceProps {
  challenge: Challenge;
  selectedPrompts: ChallengePrompt[];
  onVideoComplete: (clip: VideoClip & { aiScore?: number }) => void;
  onBack: () => void;
}

type RecordingState = 'idle' | 'countdown' | 'recording';

// Reference images for "My Room, My Vibe" challenge prompts
const REFERENCE_IMAGES: Record<string, string> = {
  'favorite-corner': '/reference-photos/cozy-corner.jpg',
  'study-setup': '/reference-photos/study-desk.jpg',
  'kitchen-tour': '/reference-photos/kitchen.jpg',
  'window-view': '/reference-photos/window-view.jpg',
  'chill-zone': '/reference-photos/living-area.jpg'
};

export default function EnhancedCameraInterface({ 
  challenge, 
  selectedPrompts,
  onVideoComplete, 
  onBack
}: EnhancedCameraInterfaceProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [countdown, setCountdown] = useState(3);
  const [recordingTime, setRecordingTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { stream, error: cameraError } = useCamera();
  const { startRecording, stopRecording, isRecording } = useMediaRecorder(stream);
  
  const maxRecordingTime = 60; // 60 seconds max
  const referenceImageUrl = REFERENCE_IMAGES['favorite-corner']; // Use one reference for the challenge
  
  // Initialize video analysis for "My Room, My Vibe" challenge
  const {
    isInitialized: isAnalysisReady,
    scoreEvents,
    totalScore,
    detectedObjects,
    resetAnalysis
  } = useVideoAnalysis({
    videoElement: videoRef.current,
    isRecording,
    challengeId: challenge.id,
    referenceImageUrl: challenge.id === 'my-room-my-vibe' ? referenceImageUrl : undefined
  });

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (recordingState === 'countdown') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setRecordingState('recording');
            startRecording();
            resetAnalysis(); // Reset scoring for new recording
            return 3;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [recordingState, startRecording, resetAnalysis]);

  useEffect(() => {
    if (recordingState === 'recording') {
      const timer = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 0.1;
          if (newTime >= maxRecordingTime) {
            handleStopRecording();
            return 0;
          }
          return newTime;
        });
      }, 100);

      return () => clearInterval(timer);
    }
  }, [recordingState, maxRecordingTime]);

  const handleStartRecording = () => {
    setRecordingState('countdown');
    setCountdown(3);
  };

  const handleStopRecording = async () => {
    if (!isRecording) return;

    const blob = await stopRecording();
    if (blob) {
      const videoClip: VideoClip & { aiScore?: number } = {
        stepId: 0,
        duration: recordingTime,
        size: blob.size,
        timestamp: new Date().toISOString(),
        aiScore: totalScore // Include AI-generated score
      };
      
      onVideoComplete(videoClip);
    }
    
    setRecordingState('idle');
    setRecordingTime(0);
  };

  const handleRetake = () => {
    setRecordingState('idle');
    setRecordingTime(0);
    resetAnalysis();
  };

  if (cameraError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">📷</div>
          <h2 className="text-xl font-bold mb-2">Camera Access Required</h2>
          <p className="text-gray-300 mb-4">Please allow camera access to record your video.</p>
          <button 
            onClick={onBack}
            className="bg-white text-black px-6 py-3 rounded-2xl font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const progress = (recordingTime / maxRecordingTime) * 100;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Video Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* AI Analysis Status */}
      {challenge.id === 'my-room-my-vibe' && (
        <div className="absolute top-4 left-4 z-20">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isAnalysisReady 
              ? 'bg-green-500/80 text-white' 
              : 'bg-yellow-500/80 text-black'
          }`}>
            {isAnalysisReady ? '🤖 AI Ready' : '🤖 Loading...'}
          </div>
        </div>
      )}

      {/* Scoring Overlay - Only for "My Room, My Vibe" challenge */}
      {challenge.id === 'my-room-my-vibe' && isAnalysisReady && (
        <ScoringOverlay scoreEvents={scoreEvents} totalScore={totalScore} />
      )}

      {/* Sketch Overlay */}
      <SketchOverlay 
        isActive={recordingState === 'recording'}
        intensity={0.7}
      />

      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={onBack}
            data-testid="button-close-camera"
            className="w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
          >
            <span className="text-lg">×</span>
          </button>
          <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
            <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-white text-sm font-medium">
              {isRecording ? `${recordingTime.toFixed(1)}s` : 'Ready'}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        {recordingState === 'recording' && (
          <div className="w-full bg-black/30 rounded-full h-1 mb-4">
            <div 
              className="bg-red-500 h-1 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Countdown Overlay */}
      {recordingState === 'countdown' && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
          <div className="text-white text-8xl font-bold animate-ping">
            {countdown}
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
        {/* Challenge Display */}
        <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-4 mb-6 text-center">
          <div className="text-3xl mb-2">🎬</div>
          <div className="text-white font-semibold text-lg mb-1">{challenge.name}</div>
          <div className="text-gray-300 text-sm">Record up to {maxRecordingTime}s</div>
          
          {/* AI Detection Status */}
          {challenge.id === 'my-room-my-vibe' && detectedObjects.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="text-xs text-green-400 mb-1">Objects detected:</div>
              <div className="flex flex-wrap gap-1 justify-center">
                {detectedObjects.map(obj => (
                  <span key={obj} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                    {obj}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recording Controls */}
        <div className="flex items-center justify-center space-x-6">
          {recordingState === 'idle' && (
            <>
              <button
                onClick={handleStartRecording}
                data-testid="button-start-recording"
                className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-2xl hover:bg-red-600 transition-colors"
              >
                <div className="w-6 h-6 bg-white rounded-sm"></div>
              </button>
            </>
          )}

          {recordingState === 'recording' && (
            <button
              onClick={handleStopRecording}
              data-testid="button-stop-recording"
              className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center shadow-2xl border-4 border-red-500"
            >
              <div className="w-8 h-8 bg-red-500 rounded-sm"></div>
            </button>
          )}
        </div>

        {/* Retake Option */}
        {recordingState === 'idle' && recordingTime === 0 && (
          <div className="text-center mt-4">
            <button
              onClick={handleRetake}
              className="text-white/70 text-sm hover:text-white transition-colors"
            >
              Retake
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
