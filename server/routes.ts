import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { insertSubmissionSchema, insertRewardSchema } from "@shared/schema.js";
import { z } from "zod";

// Type for error handling middleware
type ErrorWithStatus = Error & {
  status?: number;
  statusCode?: number;
  message: string;
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all challenges
  app.get("/api/challenges", async (_req: Request, res: Response) => {
    try {
      const challenges = await storage.getChallenges();
      res.json(challenges);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  // Type for reward preview
  type RewardPreview = {
    icon: string;
    name: string;
    rarity: 'common' | 'rare' | 'epic';
  };

  // Get rewards preview for homepage
  app.get("/api/rewards/preview", async (_req: Request, res: Response<RewardPreview[] | { message: string }>) => {
    try {
      const rewardPreviews: RewardPreview[] = [
        { icon: "☕", name: "Costa Cards", rarity: "common" },
        { icon: "🎵", name: "Spotify Premium", rarity: "rare" },
        { icon: "🍕", name: "Food Vouchers", rarity: "common" },
        { icon: "💰", name: "PayPal Cash", rarity: "epic" },
        { icon: "🛍️", name: "ASOS Vouchers", rarity: "epic" },
        { icon: "🎮", name: "Gaming Credit", rarity: "rare" }
      ];
      res.json(rewardPreviews);
    } catch (error) {
      console.error('Error fetching reward previews:', error);
      res.status(500).json({ message: "Failed to fetch reward previews" });
    }
  });

  // Get specific challenge
  app.get("/api/challenges/:id", async (req: Request<{ id: string }>, res: Response) => {
    try {
      const challenge = await storage.getChallenge(req.params.id);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      res.json(challenge);
    } catch (error) {
      console.error(`Error fetching challenge ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch challenge" });
    }
  });

  // Submit completed challenge
  app.post("/api/submissions", async (req, res) => {
    try {
      const validatedData = insertSubmissionSchema.parse(req.body);
      const created = await storage.createSubmission(validatedData);
      
      // Generate random reward with weighted distribution - Updated to match changes.md
      const rewards = [
        // Common rewards (70% chance)
        { type: "coffee", value: "Starbucks ☕", weight: 20 },
        { type: "gym", value: "Gym Trial 💪", weight: 15 },
        { type: "music", value: "Spotify 1-Month 🎧", weight: 15 },
        { type: "grocery", value: "Grocery Voucher 🛒", weight: 15 },
        { type: "social", value: "Feature Me on IG 🌟", weight: 5 },
        
      ];
      
      let selectedReward = rewards[0];
      const random = Math.random();
      let cumulativeWeight = 0;
      
      for (const reward of rewards) {
        cumulativeWeight += reward.weight;
        if (random <= cumulativeWeight) {
          selectedReward = reward;
          break;
        }
      }
      
      const reward = await storage.createReward({
        submissionId: created.id,
        rewardType: selectedReward.type,
        rewardValue: selectedReward.value,
        claimed: 0
      });
      
      res.status(201).json({ submission: created, reward });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error in submission:', error.errors);
        res.status(400).json({ 
          message: "Invalid submission data", 
          errors: error.errors 
        });
      } else {
        console.error('Error submitting challenge:', error);
        res.status(500).json({ 
          message: "Failed to submit challenge" 
        });
      }
    }
  });

  // Get user's rewards
  app.get("/api/rewards", async (req: Request<{}, {}, {}, { userId?: string }>, res: Response) => {
    try {
      const { userId } = req.query;
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ 
          message: "User ID is required" 
        });
      }
      const rewards = await storage.getUserRewards(userId);
      res.json(rewards);
    } catch (error) {
      console.error('Error fetching user rewards:', error);
      res.status(500).json({ 
        message: "Failed to fetch rewards" 
      });
    }
  });

  // Type for claim reward request
  type ClaimRewardRequest = {
    userId: string;
    rewardId: string;
  };

  // Claim a reward
  app.post("/api/rewards/claim", async (req: Request<{}, {}, ClaimRewardRequest>, res: Response) => {
    try {
      const { userId, rewardId } = req.body;
      if (!userId || !rewardId) {
        return res.status(400).json({ 
          message: "User ID and Reward ID are required" 
        });
      }
      const reward = await storage.claimReward(userId, rewardId);
      res.status(201).json(reward);
    } catch (error) {
      console.error('Error claiming reward:', error);
      if (error instanceof Error && error.message.includes('not enough points')) {
        return res.status(400).json({ 
          message: error.message 
        });
      }
      res.status(500).json({ 
        message: "Failed to claim reward" 
      });
    }
  });

  // Get submission details
  app.get("/api/submissions/:id", async (req: Request<{ id: string }>, res: Response) => {
    try {
      const submission = await storage.getSubmission(req.params.id);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      const reward = await storage.getRewardBySubmission(submission.id);
      res.json({ submission, reward });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch submission" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
