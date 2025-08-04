import { useState, useEffect } from 'react';

export interface ScoreEvent {
  id: string;
  points: number;
  label: string;
  emoji: string;
  type: 'object' | 'match';
  timestamp: number;
}

interface ScoringOverlayProps {
  scoreEvents: ScoreEvent[];
  totalScore: number;
}

export default function ScoringOverlay({ scoreEvents, totalScore }: ScoringOverlayProps) {
  const [visibleEvents, setVisibleEvents] = useState<ScoreEvent[]>([]);

  useEffect(() => {
    if (scoreEvents.length === 0) return;

    const latestEvent = scoreEvents[scoreEvents.length - 1];
    setVisibleEvents(prev => [...prev, latestEvent]);

    // Remove event after animation
    const timer = setTimeout(() => {
      setVisibleEvents(prev => prev.filter(event => event.id !== latestEvent.id));
    }, 2000);

    return () => clearTimeout(timer);
  }, [scoreEvents]);

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {/* Total Score Display */}
      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-2xl px-4 py-2 text-white">
        <div className="text-sm font-medium">Score</div>
        <div className="text-2xl font-bold text-yellow-400">{totalScore}</div>
      </div>

      {/* Animated Score Events */}
      <div className="absolute inset-0 flex items-center justify-center">
        {visibleEvents.map((event, index) => (
          <div
            key={event.id}
            className={`absolute animate-score-popup ${
              event.type === 'match' ? 'text-green-400' : 'text-yellow-400'
            }`}
            style={{
              animationDelay: `${index * 100}ms`,
              transform: `translateY(${index * -20}px)`
            }}
          >
            <div className="bg-black/80 backdrop-blur-sm rounded-2xl px-6 py-3 text-center shadow-2xl border border-white/20">
              <div className="text-3xl mb-1">{event.emoji}</div>
              <div className="text-lg font-bold text-white">+{event.points} pts</div>
              <div className="text-sm text-gray-300">{event.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Perfect Match Celebration */}
      {visibleEvents.some(event => event.type === 'match') && (
        <div className="absolute inset-0 flex items-center justify-center animate-pulse">
          <div className="text-6xl animate-bounce">🎯</div>
        </div>
      )}
    </div>
  );
}

// Add these CSS animations to your global CSS or Tailwind config
export const scoringAnimations = `
@keyframes score-popup {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.8);
  }
  20% {
    opacity: 1;
    transform: translateY(0px) scale(1.1);
  }
  80% {
    opacity: 1;
    transform: translateY(-10px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-30px) scale(0.9);
  }
}

.animate-score-popup {
  animation: score-popup 2s ease-out forwards;
}
`;
