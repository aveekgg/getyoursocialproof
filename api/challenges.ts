import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const challenges = await storage.getChallenges();
      res.status(200).json(challenges);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      res.status(500).json({ message: 'Failed to fetch challenges' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
