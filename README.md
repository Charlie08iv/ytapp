# YouTube Title Generator

A web application that generates AI-powered title variations for YouTube videos. Paste a YouTube link to get engaging, alternative title suggestions.

## Features

- Fetch video information from YouTube (title, thumbnail, duration, views, likes)
- Generate 5 AI-powered title variations using Groq's LLaMA 3.3 70B model
- Copy generated titles to clipboard with one click
- Clean, responsive UI

## Tech Stack

- **Frontend:** TypeScript, Vite
- **Backend:** Express.js, TypeScript
- **APIs:** YouTube Data API v3, Groq AI

## Prerequisites

- Node.js (v18 or higher recommended)
- YouTube Data API key
- Groq API key

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ytapp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Add your API keys to `.env`:
   ```
   YOUTUBE_API_KEY=your_youtube_api_key_here
   GROQ_API_KEY=your_groq_api_key_here
   ```

   - Get a YouTube API key at: https://console.cloud.google.com/apis/credentials
   - Get a Groq API key at: https://console.groq.com/keys

## Running the Application

Start the backend server:
```bash
npm run server
```

In a separate terminal, start the frontend dev server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` and the API server at `http://localhost:3001`.

## Usage

1. Paste a YouTube video URL into the input field
2. Click "Load Video" to fetch video information
3. Click "Generate Title Variations" to get AI-generated alternative titles
4. Click "Copy" on any title to copy it to your clipboard

## Project Structure

```
ytapp/
├── src/
│   ├── main.ts      # Frontend application
│   └── style.css    # Styles
├── server/
│   ├── index.ts     # Express server
│   ├── youtube.ts   # YouTube API integration
│   └── groq.ts      # Groq AI integration
├── package.json
└── .env.example
```

## License

ISC
