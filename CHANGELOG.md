# Changelog

All notable changes to Oratii are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-10-31

### 🚀 Initial Public Release

#### Added
- **Speech Coach** — Real-time WPM counter, filler word detection, vocal tone scoring, and Gemini deep-analysis feedback
- **Slide Deck Analyzer** — PPTX/PDF upload, AI visual clutter & text density audit, live presentation mode
- **Body Language Tracking** — MediaPipe GPU-accelerated in-browser eye contact and posture scoring
- **AI Mock Interview Studio** — Dual-pane photorealistic interviewer (Sarah Jenkins / Marcus Vance) with STAR pacing cues
- **Academic Defense Examiner** — Context-aware Q&A from uploaded slides, Easy → Hard difficulty levels
- **20-Day Speaking Challenge** — Gamified daily drills, streak tracking, freeze tokens, XP rewards, Day 20 Before/After summary
- **Trainer Portal v1** — Academy creation, batch management, invite-code enrollment, WhatsApp-style leaderboard
- **Full Admin Panel** — KPI dashboard, user management, interview analytics, question bank, revenue dashboard, system logs
- **Multi-AI Waterfall** — Cerebras → Groq → Gemini → OpenRouter automatic failover for 99.9% uptime
- **Razorpay Payments** — Pro (₹499/mo) and Enterprise (₹1,999/mo) with webhook verification
- **VAPID Push Notifications** — Streak reminders and broadcast notifications
- **PWA Service Worker v4** — Offline fallback, cache management, ChunkLoadError recovery
- **SEO Optimization** — OpenGraph, JSON-LD Schema, GA4, Google Tag Manager, sitemap, robots.txt
- **Rate Limiting** — Upstash Redis per-route rate limiting on all public API endpoints
- **Error Monitoring** — Sentry integration with network/ChunkLoadError detection and auto-reconnect UI

#### Tech Stack
- Next.js 14.2.1 (App Router) + TypeScript
- Supabase (PostgreSQL + RLS + Auth)
- Google Gemini 1.5/2.5 Flash
- Deepgram Nova-2 STT
- Tailwind CSS 3.4 + Glassmorphism
- Recharts + jsPDF + html2canvas

---

## [Unreleased]

### Planned
- Mobile App (React Native)
- Chrome Extension — real-time meeting coach overlay
- Multi-language support (Hindi, Urdu, Arabic)
- AI Avatar upgrade with HeyGen/D-ID
- LMS Integration (Canvas / Moodle)
- Team Workspaces for organizations

---

[1.0.0]: https://github.com/gazi82749-wq/oratii/releases/tag/v1.0.0
