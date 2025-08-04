import { useState, useEffect, useRef } from 'react';
import { useVideoAnalysis } from '@/hooks/useVideoAnalysis';

interface AIOverlayProps {
  videoElement: HTMLVideoElement | null;
  isRecording: boolean;
  challengeId: string;
}

export default function AIOverlay({ videoElement, isRecording, challengeId }: AIOverlayProps) {
  // Only enable AI for "My Room, My Vibe" challenge
  const isAIEnabled = challengeId === 'my-room-my-vibe';
  
  const {
    isInitialized,
    scoreEvents,
    totalScore,
    detectedObjects
  } = useVideoAnalysis({
    videoElement,
    isRecording: isRecording && isAIEnabled,
    challengeId,
    referenceImageUrl: isAIEnabled ? '/reference-photos/cozy-corner.jpg' : undefined
  });

  // Don't render anything if AI is not enabled for this challenge
  if (!isAIEnabled) return null;

  return (
    <>
      {/* AI Status Indicator - Top Left */}
      <div className="absolute top-4 left-4 z-30">
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          isInitialized 
            ? 'bg-green-500/80 text-white' 
            : 'bg-yellow-500/80 text-black'
        }`}>
          {isInitialized ? '🤖 AI Ready' : '🤖 Loading...'}
        </div>
      </div>

      {/* Score Display - Top Right */}
      {isRecording && totalScore > 0 && (
        <div className="absolute top-4 right-4 z-30">
          <div className="bg-black/70 backdrop-blur-sm rounded-xl px-3 py-2 text-white">
            <div className="text-xs font-medium">AI Score</div>
            <div className="text-lg font-bold text-yellow-400">{totalScore}</div>
          </div>
        </div>
      )}

      {/* Floating Score Events */}
      <div className="absolute inset-0 pointer-events-none z-30">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {scoreEvents.slice(-1).map((event) => (
            <div
              key={event.id}
              className="animate-score-popup text-center"
            >
              <div className="bg-black/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-2xl border border-white/20">
                <div className="text-2xl mb-1">{event.emoji}</div>
                <div className="text-sm font-bold text-yellow-400">+{event.points} pts</div>
                <div className="text-xs text-gray-300">{event.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detected Objects - Bottom Center (only show during recording) */}
      {isRecording && detectedObjects.length > 0 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-black/70 backdrop-blur-sm rounded-xl px-3 py-2">
            <div className="text-xs text-green-400 mb-1 text-center">Objects detected:</div>
            <div className="flex flex-wrap gap-1 justify-center">
              {detectedObjects.slice(0, 3).map(obj => (
                <span key={obj} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                  {obj}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
