import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getVideoInfo } from './youtube.js';
import { generateTitleVariations } from './claude.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/video-info/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'YouTube API key not configured' });
    }

    const videoInfo = await getVideoInfo(videoId, apiKey);
    res.json(videoInfo);
  } catch (error) {
    console.error('Error fetching video info:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch video info' });
  }
});

app.post('/api/generate-titles', async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Anthropic API key not configured' });
    }

    const variations = await generateTitleVariations(title);
    res.json({ variations });
  } catch (error) {
    console.error('Error generating titles:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate titles' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
