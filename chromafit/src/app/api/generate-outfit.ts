import type { NextApiRequest, NextApiResponse } from 'next';

const NANOBANANA_API_KEY = process.env.NANOBANANA_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { environment, occasion } = req.body;

  if (!environment || !occasion) {
    return res.status(400).json({ error: 'Environment and occasion required' });
  }

  try {
    const prompt = `Generate a stylish outfit suitable for a ${environment} setting at a ${occasion} event.`;

    const response = await fetch('https://api.nanobananaapi.ai/api/v1/nanobanana/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: NANOBANANA_API_KEY,
        input: { prompt }
      })
    });

    const data = await response.json();
    res.status(200).json({ jobId: data.jobId });
  } catch (error) {
    res.status(500).json({ error: 'Generation failed' });
  }
}