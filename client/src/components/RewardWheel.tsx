import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface Reward {
  emoji: string;
  text: string;
  color: string;
  value: string;
}

interface RewardWheelProps {
  rewards: Reward[];
  onSpinComplete: (reward: Reward) => void;
  onBack: () => void;
}

export default function RewardWheel({ rewards, onSpinComplete, onBack }: RewardWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const handleSpin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    const newRotation = rotation + Math.random() * 3600 + 3600; // 10-20 full rotations
    setRotation(newRotation);
    
    setTimeout(() => {
      const sectionAngle = 360 / rewards.length;
      const winningIndex = Math.floor(((360 - (newRotation % 360)) % 360) / sectionAngle);
      const selectedReward = rewards[winningIndex];
      
      setIsSpinning(false);
      onSpinComplete(selectedReward);
    }, 6500); // Increased duration
  };

  // Create confetti elements
  const confettiElements = Array.from({ length: 9 }, (_, i) => (
    <div 
      key={i}
      className="confetti-piece absolute animate-confetti text-2xl"
      style={{
        left: `${(i + 1) * 10}%`,
        animationDelay: `${i * 0.2}s`
      }}
    >
      {['🎉', '⭐', '🎊', '💫'][i % 4]}
    </div>
  ));



  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Confetti Animation */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {confettiElements}
      </div>
      
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Header */}
        <div className="mb-8 w-full relative">
           <button 
            onClick={onBack}
            className="absolute top-0 left-0 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl"
          >
            &lt;
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">🌀 Nice one! Your reel is live.</h1>
          <p className="text-xl text-white/90 mb-4">Now let's get you a surprise!</p>
          <p className="text-lg text-white/80">🎯 Spin the wheel to unlock a student perk 🎁</p>
        </div>
        
        {/* Modern Wheel Design */}
        <div className="relative mb-8">
          {/* Wheel with glassmorphism effect */}
          <div className="relative">
            <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-white/10 backdrop-blur-lg p-2 shadow-2xl border border-white/20">
              <div 
                className="w-full h-full rounded-full relative overflow-hidden transition-transform duration-[6s] ease-out"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                {/* Wheel Sections with better visibility */}
                {rewards.map((reward, index) => {
                  const angle = (360 / rewards.length) * index;
                  const sectionAngle = 360 / rewards.length;
                  
                  return (
                    <div
                      key={index}
                      className="absolute inset-0"
                      style={{
                        background: reward.color,
                        clipPath: `polygon(50% 50%, ${50 + 45 * Math.cos((angle - 90) * Math.PI / 180)}% ${50 + 45 * Math.sin((angle - 90) * Math.PI / 180)}%, ${50 + 45 * Math.cos((angle + sectionAngle - 90) * Math.PI / 180)}% ${50 + 45 * Math.sin((angle + sectionAngle - 90) * Math.PI / 180)}%)`
                      }}
                    >
                      <div 
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          transform: `rotate(${angle + sectionAngle / 2}deg)`,
                          transformOrigin: '50% 50%'
                        }}
                      >
                        <div className="text-center" style={{ transform: 'translateY(-95px)' }}>
                          <div className="text-5xl mb-1">{reward.emoji}</div>
                          <div className="text-sm font-bold text-white">{reward.text}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Center Hub */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-gray-200">
                    <span className="text-3xl">🎯</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
              <div className="w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-white shadow-lg"></div>
            </div>
          </div>
        </div>
        
        <div className="w-full max-w-sm">
          <button 
            onClick={handleSpin}
            disabled={isSpinning}
            data-testid="button-spin-wheel"
            className="w-full border-3 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black py-6 px-8 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:hover:bg-transparent disabled:hover:text-yellow-400"
          >
            {isSpinning ? '🎯 Spinning...' : '🎉 Spin Now'}
          </button>
        </div>
      </div>


    </div>
  );
}
