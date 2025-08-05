import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Challenges endpoint
app.get('/api/challenges', async (req, res) => {
  try {
    // Mock data for now - replace with actual database query
    const challenges = [
      {
        id: '1',
        name: 'My Room, My Vibe',
        description: 'Show off your living space and what makes it uniquely yours',
        tagline: 'Your space, your story',
        pointsPerStep: 25,
        totalSteps: 5,
        estimatedDuration: 30,
        difficulty: 'easy',
        category: 'lifestyle',
        isActive: true,
        createdAt: new Date(),
        promptPool: [
          { id: "favorite-corner", text: "Show your favorite corner in the room", emoji: "🏩", duration: 5 },
          { id: "study-setup", text: "What's your study setup like?", emoji: "🎧", duration: 5 },
          { id: "kitchen-tour", text: "Take us to your kitchen – what do you cook most?", emoji: "🍜", duration: 6 },
          { id: "love-most", text: "Say one thing you love most about living here", emoji: "❤️", duration: 4 },
          { id: "chill-zone", text: "Your chill-out zone", emoji: "🧘", duration: 5 }
        ]
      }
    ];
    res.json(challenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

// Submissions endpoint
app.post('/api/submissions', async (req, res) => {
  try {
    const { challengeId, videoClips, totalPoints, userId } = req.body;
    
    // Mock submission response - replace with actual database logic
    const submission = {
      id: `sub_${Date.now()}`,
      challengeId,
      userId: userId || 'anonymous',
      totalPoints,
      status: 'completed',
      createdAt: new Date().toISOString()
    };
    
    res.json({ submission });
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({ error: 'Failed to create submission' });
  }
});

// Export the serverless function
export const handler = serverless(app);
