import type { VercelRequest, VercelResponse } from '@vercel/node';

// Import storage directly to avoid module resolution issues
import { MemStorage } from '../server/storage';

// Create storage instance
const storage = new MemStorage();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method === 'GET') {
      console.log('Fetching challenges...');
      const challenges = await storage.getChallenges();
      console.log('Found challenges:', challenges.length);
      res.status(200).json(challenges);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in challenges API:', error);
    res.status(500).json({ 
      message: 'Failed to fetch challenges',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
