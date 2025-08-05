import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import ChallengeGallery from "@/components/ChallengeGallery";
import CameraInterface from "@/components/CameraInterface";
import RecordingComplete from "@/components/RecordingComplete";
import FinalReview from "@/components/FinalReview";
import RewardWheel from "@/components/RewardWheel";
import SuccessScreen from "@/components/SuccessScreen";
import DetailsForm from "@/components/DetailsForm";
import type { Challenge, VideoClip, ChallengePrompt } from "@shared/schema";

interface Reward {
  emoji: string;
  text: string;
  color: string;
  value: string;
}

type Screen = 'gallery' | 'camera' | 'complete' | 'review' | 'reward' | 'success' | 'details';

export default function RoomReelChallenge() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('gallery');
  const [screenHistory, setScreenHistory] = useState<Screen[]>(['gallery']);

  const navigateTo = (screen: Screen) => {
    setScreenHistory(prev => [...prev, screen]);
  };

  const handleBack = () => {
    if (screenHistory.length > 1) {
      setScreenHistory(prev => prev.slice(0, -1));
    }
  };

  useEffect(() => {
    setCurrentScreen(screenHistory[screenHistory.length - 1]);
  }, [screenHistory]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      handleBack();
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [screenHistory]); // Re-add listener if history logic changes

  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [selectedPrompts, setSelectedPrompts] = useState<ChallengePrompt[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedClips, setCompletedClips] = useState<VideoClip[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [wonReward, setWonReward] = useState<Reward | null>(null);

  const { data: challenges = [], error, isLoading, isError } = useQuery<Challenge[]>({
    queryKey: ['/api/challenges'],
    // Always fetch challenges - no login required to browse
  });

  // Debug logging for Vercel deployment
  useEffect(() => {
    console.log('Challenges query state:', { 
      challenges: challenges?.length || 0, 
      isLoading, 
      isError, 
      error: error?.message 
    });
  }, [challenges, isLoading, isError, error]);

  const rewards: Reward[] = [
    { emoji: '☕', text: 'Starbucks', color: '#FF6B6B', value: 'Starbucks ☕' },
    { emoji: '💪', text: 'Gym Trial', color: '#4ECDC4', value: 'Gym Trial 💪' },
    { emoji: '🎧', text: 'Spotify', color: '#45B7D1', value: 'Spotify 1-Month 🎧' },
    { emoji: '🌟', text: 'IG Feature', color: '#96CEB4', value: 'Feature Me on IG 🌟' },
    { emoji: '🛒', text: 'Grocery', color: '#FFEAA7', value: 'Grocery Voucher 🛒' },
    { emoji: '🏰', text: 'Surprise', color: '#DDA0DD', value: 'Surprise 🏰' }
  ];

  const handleChallengeSelect = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      setSelectedChallenge(challenge);
      // Use all prompts from the challenge, or fallback prompts
      const fallbackPrompts: ChallengePrompt[] = [
        { id: "favorite-corner", text: "Show your favorite corner in the room", emoji: "🏩", duration: 5 },
        { id: "study-setup", text: "What's your study setup like?", emoji: "🎧", duration: 5 },
        { id: "kitchen-tour", text: "Take us to your kitchen – what do you cook most?", emoji: "🍜", duration: 6 },
        { id: "love-most", text: "Say one thing you love most about living here", emoji: "❤️", duration: 4 },
        { id: "chill-zone", text: "Your chill-out zone", emoji: "🧘", duration: 5 }
      ];
      setSelectedPrompts(challenge.promptPool && challenge.promptPool.length > 0 ? challenge.promptPool : fallbackPrompts);
      
      navigateTo('camera');
    }
  };

  const handleStartChallenge = () => {
    setCurrentStep(0);
    navigateTo('camera');
  };

  const handleClipComplete = (clip: VideoClip & { thumbnailUrl?: string }) => {
    setCompletedClips(prev => [...prev, clip]);
    setTotalPoints((selectedChallenge?.pointsPerStep || 25) * selectedPrompts.length);
    navigateTo('review');
  };

  const handleSubmitVideo = async (submissionId: string) => {
    setSubmissionId(submissionId);
    navigateTo('reward');
  };

  const handleSpinComplete = (reward: Reward) => {
    setWonReward(reward);
    navigateTo('details');
  };

  const handleFinishChallenge = () => {
    navigateTo('details'); // Go to details form instead of success
  };

  const handleDetailsSubmit = (details: { email: string; instagram?: string }) => {
    console.log('User Details:', details); // You can send this to your backend
    navigateTo('success');
  };

  const handleContinueRecording = () => {
    if (currentStep < selectedPrompts.length - 1) {
      setCurrentStep(currentStep + 1);
      navigateTo('camera');
    } else {
      navigateTo('review');
    }
  };

  const handleStartNewChallenge = () => {
    // Reset all state
    setScreenHistory(['gallery']);
    setSelectedChallenge(null);
    setSelectedPrompts([]);
    setCurrentStep(0);
    setCompletedClips([]);
    setTotalPoints(0);
    setSubmissionId(null);
    setWonReward(null);
  };

  // Allow scrolling except on camera screen
  useEffect(() => {
    if (currentScreen === 'camera') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [currentScreen]);

  const commonProps = { onBack: handleBack };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="min-h-screen">
        {(() => {
          switch (currentScreen) {
            case 'gallery':
              return (
                <ChallengeGallery
                  challenges={challenges}
                  onChallengeSelect={handleChallengeSelect}
                />
              );
            
            // Removed redundant setup screen
    
    case 'camera':
      return (
        <CameraInterface
          challenge={selectedChallenge!}
          selectedPrompts={selectedPrompts}
          onVideoComplete={handleClipComplete}
          {...commonProps}
        />
      );
    
    case 'complete':
      return (
        <RecordingComplete
          challenge={selectedChallenge!}
          selectedPrompts={selectedPrompts}
          currentStep={currentStep}
          totalSteps={selectedPrompts.length}
          pointsEarned={selectedChallenge?.pointsPerStep || 25}
          totalPoints={totalPoints}
          onContinue={handleContinueRecording}
          onRetake={() => setCurrentScreen('camera')}
        />
      );
    
    case 'review':
      return (
        <FinalReview
          challenge={selectedChallenge!}
          selectedPrompts={selectedPrompts}
          completedClips={completedClips}
          totalPoints={totalPoints}
          onSubmit={handleSubmitVideo}
          {...commonProps}
        />
      );
    
    case 'reward':
      return (
        <RewardWheel
          rewards={rewards}
          onSpinComplete={handleSpinComplete}
          {...commonProps}
        />
      );
    
    case 'success':
      return (
        <SuccessScreen
          reward={wonReward}
          totalPoints={totalPoints}
          clipsCount={completedClips.length}
          totalDuration={completedClips.reduce((sum, clip) => sum + clip.duration, 0)}
          onStartNew={handleStartNewChallenge}
          onShare={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Check out my RoomReel!',
                text: 'I just created an awesome room tour video with RoomReel Challenge!',
                url: window.location.href
              });
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied to clipboard!');
            }
          }}
        />
      );

    case 'details':
      return (
        <DetailsForm onSubmit={handleDetailsSubmit} {...commonProps} />
      );
    
            default:
              return <ChallengeGallery challenges={challenges} onChallengeSelect={handleChallengeSelect} />;
          }
        })()}
      </div>
    </div>
  );
}
