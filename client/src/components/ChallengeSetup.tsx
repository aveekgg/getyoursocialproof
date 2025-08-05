import { Challenge } from "@shared/schema";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';

interface ChallengeSetupProps {
  challenge: Challenge;
  onStartChallenge: () => void;
  onBack: () => void;
}

// Fun Gen Z encouragement messages
const encouragements = [
  "🎬 Lights, camera, action! Let's make some magic!",
  "✨ You're about to create something amazing!",
  "🔥 This is your moment to shine!",
  "💯 Get ready to be the star of the show!",
  "🚀 Blast off to content creation greatness!",
  "🌟 Your future followers are waiting!",
  "📱 Time to go viral, bestie!"
];

export default function ChallengeSetup({ challenge, onStartChallenge, onBack }: ChallengeSetupProps) {
  const [currentEncouragement, setCurrentEncouragement] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Rotate through encouragement messages
  useEffect(() => {
    const timer = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentEncouragement(prev => (prev + 1) % encouragements.length);
        setIsVisible(true);
      }, 500);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-y-auto">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={onBack}
              data-testid="button-back"
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
            >
              <span className="text-xl">←</span>
            </button>
            <h2 className="text-xl font-bold">{challenge.name}</h2>
            <div className="w-10"></div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/20">
            <h3 className="font-bold text-sm uppercase tracking-wider text-white/80 mb-2">🎯 Your Mission</h3>
            <p className="text-sm leading-relaxed">{challenge.description}</p>
          </div>
          
          {/* Animated encouragement message */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentEncouragement}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -10 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-center text-sm bg-white/10 rounded-full py-2 px-4 mb-2 inline-block"
            >
              {encouragements[currentEncouragement]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Main content */}
      <div className="p-6 pb-24">
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Your Prompt Playlist
          </h3>
          <p className="text-gray-600">
            Swipe through these ideas and record your responses
          </p>
        </div>

        <div className="space-y-4 mb-8 max-w-2xl mx-auto">
          {(!challenge.promptPool || challenge.promptPool.length === 0) ? (
            // Fallback prompts if server data isn't loaded
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-2xl">
                  🏩
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">Show your favorite corner in the room</h4>
                  <div className="flex items-center mt-1">
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                      +{challenge.pointsPerStep} pts
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      ~5s
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                  <span className="text-sm">1</span>
                </div>
              </motion.div>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl">🎧</div>
                <div className="flex-1">
                  <h4 className="font-semibold">What's your study setup like?</h4>
                  <p className="text-sm text-gray-600">5s • +{challenge.pointsPerStep} points</p>
                </div>
                <span className="text-lg">🎬</span>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl">🍜</div>
                <div className="flex-1">
                  <h4 className="font-semibold">Take us to your kitchen – what do you cook most?</h4>
                  <p className="text-sm text-gray-600">6s • +{challenge.pointsPerStep} points</p>
                </div>
                <span className="text-lg">🎬</span>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl">❤️</div>
                <div className="flex-1">
                  <h4 className="font-semibold">Say one thing you love most about living here</h4>
                  <p className="text-sm text-gray-600">4s • +{challenge.pointsPerStep} points</p>
                </div>
                <span className="text-lg">🎬</span>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl">🧘</div>
                <div className="flex-1">
                  <h4 className="font-semibold">Your chill-out zone</h4>
                  <p className="text-sm text-gray-600">5s • +{challenge.pointsPerStep} points</p>
                </div>
                <span className="text-lg">🎬</span>
              </div>
            </div>
          ) : (
            challenge.promptPool.map((prompt, index) => (
              <div key={prompt.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl">{prompt.emoji}</div>
                <div className="flex-1">
                  <h4 className="font-semibold">{prompt.text}</h4>
                  <p className="text-sm text-gray-600">{prompt.duration}s • +{challenge.pointsPerStep} points</p>
                </div>
                <span className="text-lg">🎬</span>
              </div>
            ))
          )}
        </div>
        
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xl">💡</span>
            <span className="font-semibold text-accent">Pro Tips</span>
          </div>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Hold your phone steady (or prop it up)</li>
            <li>• Natural lighting works best</li>
            <li>• Be yourself - authenticity wins</li>
            <li>• Don't worry about being perfect!</li>
          </ul>
        </div>
        
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent p-4 pt-8">
          <div className="max-w-2xl mx-auto">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onStartChallenge}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              🎬 Start Recording
            </motion.button>
            <p className="text-center text-xs text-gray-500 mt-2">
              Pro tip: Find good lighting and speak clearly!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
