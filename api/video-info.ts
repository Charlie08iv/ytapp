import type { VercelRequest, VercelResponse } from '@vercel/node';

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  channelTitle: string;
  viewCount: string;
  likeCount: string;
}

function parseDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

async function getVideoInfo(videoId: string, apiKey: string): Promise<VideoInfo> {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new Error('Video not found');
  }

  const video = data.items[0];
  const snippet = video.snippet;
  const contentDetails = video.contentDetails;
  const statistics = video.statistics;

  return {
    title: snippet.title,
    thumbnail: snippet.thumbnails.high?.url || snippet.thumbnails.default?.url,
    duration: parseDuration(contentDetails.duration),
    channelTitle: snippet.channelTitle,
    viewCount: statistics.viewCount || '0',
    likeCount: statistics.likeCount || '0',
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videoId } = req.query;

    if (!videoId || typeof videoId !== 'string') {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'YouTube API key not configured' });
    }

    const videoInfo = await getVideoInfo(videoId, apiKey);
    return res.status(200).json(videoInfo);
  } catch (error) {
    console.error('Error fetching video info:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch video info' });
  }
}
