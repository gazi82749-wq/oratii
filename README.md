# Oratii — AI Speech & Presentation Coach

Oratii is an AI-powered public speaking and presentation auditing platform designed to help users deliver confident, impactful speeches and presentations.

## Finalized MVP Scope (4 Core Modules)

1. **Speech Coach** (`/speech-coach`)
   - Live microphone audio recording and audio file upload (MP3, WAV, M4A, AAC, FLAC).
   - Real-time pacing (WPM), filler word detection, vocal tone scoring, and timestamped insights.
2. **Slide Analyzer** (`/presentation`)
   - PowerPoint (PPTX) and PDF presentation deck visual clutter, text density, and structural readability analysis.
3. **AI Viva Defense** (`/viva`)
   - Context-aware Q&A defense practice sessions generated directly from uploaded presentation slides or speech topics.
4. **20-Day Challenge** (`/challenge`)
   - Gamified daily speaking habit builder tied into Speech Coach sessions with daily prompts, streak tracking, freeze tokens, and Day 20 Before vs After progress summaries.

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to launch the app.
