const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  channelTitle: string;
  viewCount: string;
  likeCount: string;
}

function formatNumber(num: string): string {
  const n = parseInt(num);
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <div class="container">
    <h1>YouTube Title Generator</h1>
    <p class="subtitle">Paste a YouTube link to get AI-powered title variations</p>
    <div class="input-group">
      <input
        type="text"
        class="youtube-input"
        id="youtube-url"
        placeholder="https://www.youtube.com/watch?v=..."
      />
      <button class="submit-btn" id="submit-btn">Load Video</button>
    </div>
    <div id="message-container"></div>
    <div id="video-info-container"></div>
    <div id="titles-container"></div>
  </div>
`;

const input = document.querySelector<HTMLInputElement>('#youtube-url')!;
const submitBtn = document.querySelector<HTMLButtonElement>('#submit-btn')!;
const messageContainer = document.querySelector<HTMLDivElement>('#message-container')!;
const videoInfoContainer = document.querySelector<HTMLDivElement>('#video-info-container')!;
const titlesContainer = document.querySelector<HTMLDivElement>('#titles-container')!;

let currentVideoInfo: VideoInfo | null = null;

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

function showMessage(text: string, type: 'success' | 'error' | 'loading'): void {
  messageContainer.innerHTML = `<div class="message ${type}">${text}</div>`;
}

function clearMessage(): void {
  messageContainer.innerHTML = '';
}

function showVideoInfo(info: VideoInfo): void {
  videoInfoContainer.innerHTML = `
    <div class="video-card">
      <img src="${info.thumbnail}" alt="Video thumbnail" class="video-thumbnail" />
      <div class="video-details">
        <h2 class="video-title">${info.title}</h2>
        <p class="video-channel">${info.channelTitle}</p>
        <div class="video-stats">
          <span class="video-duration">${info.duration}</span>
          <span class="video-views">${formatNumber(info.viewCount)} views</span>
          <span class="video-likes">${formatNumber(info.likeCount)} likes</span>
        </div>
      </div>
      <button class="generate-btn" id="generate-btn">Generate Title Variations</button>
    </div>
  `;

  const generateBtn = document.querySelector<HTMLButtonElement>('#generate-btn')!;
  generateBtn.addEventListener('click', handleGenerateTitles);
}

function showTitleVariations(variations: string[]): void {
  titlesContainer.innerHTML = `
    <div class="titles-section">
      <h3>AI-Generated Title Variations</h3>
      <ul class="titles-list">
        ${variations.map((title, i) => `
          <li class="title-item">
            <span class="title-number">${i + 1}</span>
            <span class="title-text">${title}</span>
            <button class="copy-btn" data-title="${title.replace(/"/g, '&quot;')}">Copy</button>
          </li>
        `).join('')}
      </ul>
    </div>
  `;

  document.querySelectorAll<HTMLButtonElement>('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.dataset.title || '';
      navigator.clipboard.writeText(title);
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
    });
  });
}

async function fetchVideoInfo(videoId: string): Promise<VideoInfo> {
  const response = await fetch(`${API_BASE}/api/video-info?videoId=${videoId}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch video info');
  }
  return response.json();
}

async function generateTitles(title: string): Promise<string[]> {
  const response = await fetch(`${API_BASE}/api/generate-titles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate titles');
  }
  const data = await response.json();
  return data.variations;
}

async function handleSubmit(): Promise<void> {
  const url = input.value.trim();

  if (!url) {
    showMessage('Please enter a YouTube URL', 'error');
    videoInfoContainer.innerHTML = '';
    titlesContainer.innerHTML = '';
    return;
  }

  const videoId = extractVideoId(url);

  if (!videoId) {
    showMessage('Invalid YouTube URL. Please check and try again.', 'error');
    videoInfoContainer.innerHTML = '';
    titlesContainer.innerHTML = '';
    return;
  }

  showMessage('Loading video info...', 'loading');
  titlesContainer.innerHTML = '';

  try {
    currentVideoInfo = await fetchVideoInfo(videoId);
    clearMessage();
    showVideoInfo(currentVideoInfo);
  } catch (error) {
    showMessage(error instanceof Error ? error.message : 'Failed to load video', 'error');
    videoInfoContainer.innerHTML = '';
  }
}

async function handleGenerateTitles(): Promise<void> {
  if (!currentVideoInfo) return;

  const generateBtn = document.querySelector<HTMLButtonElement>('#generate-btn');
  if (generateBtn) {
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';
  }

  titlesContainer.innerHTML = '<div class="message loading">Generating title variations with AI...</div>';

  try {
    const variations = await generateTitles(currentVideoInfo.title);
    showTitleVariations(variations);
  } catch (error) {
    titlesContainer.innerHTML = `<div class="message error">${error instanceof Error ? error.message : 'Failed to generate titles'}</div>`;
  } finally {
    if (generateBtn) {
      generateBtn.disabled = false;
      generateBtn.textContent = 'Generate Title Variations';
    }
  }
}

submitBtn.addEventListener('click', handleSubmit);

input.addEventListener('keypress', (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSubmit();
  }
});
