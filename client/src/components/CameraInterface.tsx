import { useState, useEffect, useRef } from "react";
import { Challenge, VideoClip, ChallengePrompt } from "@shared/schema";
import { useCamera } from "@/hooks/useCamera";
import { useMediaRecorder, RecordingState as MediaRecorderState } from "@/hooks/useMediaRecorder";
import SketchOverlay from "./SketchOverlay";

interface CameraInterfaceProps {
  challenge: Challenge;
  selectedPrompts: ChallengePrompt[];
  onVideoComplete: (clip: VideoClip & { thumbnailUrl?: string }) => void;
  onBack: () => void;
}

type RecordingState = 'idle' | 'countdown' | 'recording' | 'paused';

export default function CameraInterface({ 
  challenge, 
  selectedPrompts,
  onVideoComplete, 
  onBack
}: CameraInterfaceProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [countdown, setCountdown] = useState(3);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [reactions, setReactions] = useState<{ id: number; emoji: string }[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { stream, error: cameraError } = useCamera();
  const {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    isRecording,
    isPaused,
  } = useMediaRecorder(stream);
  
  const totalDuration = selectedPrompts.reduce((sum, prompt) => sum + prompt.duration, 0);
  const currentPrompt = selectedPrompts[currentPromptIndex] || selectedPrompts[0];

  const handleNextPrompt = () => {
    setCurrentPromptIndex(prev => Math.min(prev + 1, selectedPrompts.length - 1));
  };

  const handlePrevPrompt = () => {
    setCurrentPromptIndex(prev => Math.max(prev - 1, 0));
  };

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
            return 3;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [recordingState, startRecording]);

  useEffect(() => {
    if (recordingState === 'recording' && !isPaused) {
      const timer = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          
          // Stop recording when total duration is reached
          if (newTime >= totalDuration) {
            clearInterval(timer);
            handleStopRecording();
            return 0;
          }
          return newTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setRecordingTime(0);
    }
  }, [recordingState, totalDuration]);

  // Reset prompt index when starting new recording
  useEffect(() => {
    if (recordingState === 'countdown') {
      setCurrentPromptIndex(0);
    }
  }, [recordingState]);

  const handleStartRecording = () => {
    if (recordingState === 'idle') {
      setRecordingState('countdown');
    }
  };

  const handlePauseRecording = () => {
    pauseRecording();
    setRecordingState('paused');
  };

  const handleResumeRecording = () => {
    resumeRecording();
    setRecordingState('recording');
  };

  const handleCaptureThumbnail = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const url = canvas.toDataURL('image/jpeg');
        setThumbnailUrl(url);
        // Optional: Show a brief confirmation
      }
    }
  };

  const handleTriggerReaction = () => {
    const genZNudges = ['🔥', '✨', '🙌', '💯', '💅', ' slay'];
    const emoji = genZNudges[Math.floor(Math.random() * genZNudges.length)];
    setReactions(prev => [...prev, { id: Date.now(), emoji }]);
    setTimeout(() => {
      setReactions(prev => prev.slice(1));
    }, 2000);
  };

  const handleStopRecording = async () => {
    const blob = await stopRecording();
    if (blob) {
      const clip: VideoClip & { thumbnailUrl?: string } = {
        stepId: 1, // Single video for entire challenge
        duration: recordingTime,
        size: blob.size,
        timestamp: new Date().toISOString(),
        thumbnailUrl: thumbnailUrl ?? undefined,
      };
      onVideoComplete(clip);
    }
    setRecordingState('idle');
    setThumbnailUrl(null);
  };

  // Removed handleLockShot - no longer needed

  if (cameraError) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-6 text-center max-w-sm">
          <div className="text-4xl mb-4">📹</div>
          <h3 className="text-xl font-bold mb-2">Camera Access Required</h3>
          <p className="text-gray-600 mb-4">Please allow camera access to record your video clips.</p>
          <button 
            onClick={() => window.location.reload()}
            data-testid="button-retry-camera"
            className="bg-primary text-white py-2 px-4 rounded-xl font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark relative">
      {/* Camera Feed */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Camera grid overlay */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20 pointer-events-none">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="border border-white/30"></div>
        ))}
      </div>

      {/* Gen Z Nudges */}
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        {reactions.map(reaction => (
          <div 
            key={reaction.id} 
            className="absolute text-4xl animate-float-up"
            style={{
              left: `${Math.random() * 80 + 10}%`,
              bottom: '10%',
            }}
          >
            {reaction.emoji}
          </div>
        ))}
      </div>

      {/* Sketch Overlay */}
      <SketchOverlay 
        isActive={recordingState === 'recording'}
        intensity={0.7}
      />


      
      {/* Clean interface - no obstructive overlays */}
      
      {/* Top Overlay - Clean and Minimal */}
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
            <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : (isPaused ? 'bg-yellow-500' : 'bg-gray-400')}`}></div>
            <span className="text-white text-xs font-medium">
              {isRecording ? 'REC' : (isPaused ? 'PAUSED' : 'READY')}
            </span>
          </div>
          <div className="text-white text-xs bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
            {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
          </div>
        </div>
        
        {/* Removed horizontal carousel */}
      </div>
      
      {/* Removed obstructive center overlay */}
      
      {/* In-Recording Prompt Bubble - Moved to bottom center */}
      {(isRecording || isPaused) && currentPrompt && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 w-full max-w-sm px-4">
          <div className="bg-black/70 backdrop-blur-lg rounded-2xl p-4 text-white text-center flex items-center justify-between shadow-2xl">
            <button 
              onClick={handlePrevPrompt} 
              disabled={currentPromptIndex === 0}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50 flex items-center justify-center transition-all"
            >
              &lt;
            </button>
            <div className="flex-1 mx-3">
              <div className="text-3xl mb-1">{currentPrompt.emoji}</div>
              <div className="text-sm font-semibold leading-tight">{currentPrompt.text}</div>
              <div className="text-xs text-white/70 mt-1">{currentPromptIndex + 1} of {selectedPrompts.length}</div>
            </div>
            <button 
              onClick={handleNextPrompt} 
              disabled={currentPromptIndex === selectedPrompts.length - 1}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50 flex items-center justify-center transition-all"
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      {/* Bottom Controls - Clean and Simple */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6 pb-8">
        <div className="flex items-center justify-center">
          {recordingState === 'idle' && (
            <button 
              onClick={handleStartRecording}
              data-testid="button-start-recording"
              className="border-3 border-red-500 text-red-500 hover:bg-red-500 hover:text-white py-4 px-8 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              🎬 Start Recording
            </button>
          )}
          
          {recordingState === 'recording' && !isPaused && (
            <button 
              onClick={handlePauseRecording}
              data-testid="button-pause-recording"
              className="bg-yellow-500 hover:bg-yellow-600 text-white py-4 px-8 rounded-full font-bold text-lg shadow-lg"
            >
              ⏸️ Pause
            </button>
          )}

          {isPaused && (
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleResumeRecording}
                data-testid="button-resume-recording"
                className="bg-green-500 hover:bg-green-600 text-white py-4 px-8 rounded-full font-bold text-lg shadow-lg"
              >
                ▶️ Resume
              </button>
              <button 
                onClick={handleStopRecording}
                data-testid="button-finish-recording"
                className="bg-red-600 hover:bg-red-700 text-white py-4 px-8 rounded-full font-bold text-lg shadow-lg"
              >
                ⏹️ Finish
              </button>
            </div>
          )}
          
          {recordingState === 'countdown' && (
            <div className="text-white text-center">
              <div className="text-lg font-semibold">Get ready...</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Minimal Countdown - No obstructive overlay */}
      {recordingState === 'countdown' && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="text-white text-center">
            <div className="text-8xl font-bold animate-bounce text-red-500" data-testid="text-countdown">
              {countdown}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
