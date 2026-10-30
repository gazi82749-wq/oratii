<div align="center">

# 🎤 Oratii

### AI-Powered Communication & Public Speaking Coach

**Speak with confidence. Present with impact. Ace every room.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel)](https://oratii.in)
[![License: MIT](https://img.shields.io/badge/License-MIT-F2A93B?style=for-the-badge)](LICENSE)

[**🌐 Live Demo → oratii.in**](https://oratii.in) &nbsp;·&nbsp; [**🐛 Report Bug**](https://oratii.in/feedback) &nbsp;·&nbsp; [**✨ Request Feature**](https://oratii.in/feedback)

</div>

---

## 🌟 What is Oratii?

**Oratii** is a full-stack, AI-powered platform that helps students, professionals, and educators become exceptional communicators. From real-time speech analysis and slide deck audits to AI mock interviews and a 20-day habit-building challenge — Oratii gives you the tools to own every stage, boardroom, and screen.

> Built for the modern communicator. Powered by Google Gemini, Deepgram, MediaPipe, and a multi-provider AI waterfall for near-100% uptime.

---

## 📑 Table of Contents

- [✨ Core Features](#-core-features)
- [🛠 Tech Stack](#-tech-stack)
- [🤖 AI Architecture](#-ai-architecture)
- [🗂 Project Structure](#-project-structure)
- [⚙️ Getting Started](#%EF%B8%8F-getting-started)
- [🔑 Environment Variables](#-environment-variables)
- [🚀 Deployment](#-deployment)
- [👑 Admin Panel](#-admin-panel)
- [🗄 Database Schema](#-database-schema)
- [📈 Roadmap](#-roadmap)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Core Features

### 🎙️ Speech Coach
Real-time microphone recording + audio file upload (MP3, WAV, M4A, FLAC). Instant AI feedback on:
- **Words Per Minute (WPM)** pacing with target zone indicators
- **Filler word detection** — "um", "uh", "like", "you know" with exact timestamps
- **Vocal tone scoring** — clarity, energy, and confidence metrics
- **Deep AI analysis** — structured improvement recommendations powered by Gemini

### 📊 Slide Deck Analyzer
Upload PowerPoint (PPTX) or PDF decks for a full AI audit:
- Visual clutter & text density scoring per slide
- Structural readability and information hierarchy review
- Live mode with body language tracking (eye contact + posture via MediaPipe GPU)

### 🤝 AI Mock Interview Studio
A photorealistic dual-pane interview experience:
- **Left pane** — AI interviewer (Sarah Jenkins or Marcus Vance) with speaking animations
- **Right pane** — Live candidate webcam with on/off toggle
- Real-time voice capture, STAR method pacing cues, and automated evaluation reports
- Question replay with audio, topic switching, and difficulty levels

### 🏆 20-Day Speaking Challenge
Gamified daily habit builder:
- Day-by-day drills integrated with the Speech Coach
- Streak tracking, freeze tokens, XP rewards, and leaderboard
- Day 20 Before vs After progress summary

### 📚 Academic Defense Examiner
AI-powered oral Q&A examiner for thesis and technical oral defenses:
- Generates context-aware questions from uploaded slides or topic prompts
- Difficulty levels: Easy → Medium → Hard
- Instant examiner-style feedback per answer

### 🏫 Trainer Portal
Educator-first cohort management:
- Create academies, manage student batches, track progress
- WhatsApp-style leaderboard preview
- Invite-code based student enrollment (`/join/[code]`)

---

## 🛠 Tech Stack

| Layer | Technology |
|:---|:---|
| **Framework** | Next.js 14.2.1 (App Router, React 18, SSR + Client Components) |
| **Language** | TypeScript 5.x |
| **Styling** | Tailwind CSS 3.4, Vanilla CSS Keyframes, Glassmorphism, Dark Mode |
| **Database & Auth** | Supabase (PostgreSQL, Row Level Security, Auth Triggers) |
| **Primary AI** | Google Gemini 1.5 / 2.5 Flash (Multimodal Text + Vision) |
| **Speech-to-Text** | Deepgram Nova-2 (real-time STT) |
| **Client ML / CV** | MediaPipe Tasks Vision (GPU in-browser eye contact & posture) |
| **AI Fallback Chain** | Cerebras Llama-3.3-70B → Groq → OpenAI GPT-4o → OpenRouter |
| **Payments** | Razorpay Checkout SDK & Webhook verification |
| **Notifications** | VAPID Web Push (`web-push`) + Resend Transactional Email |
| **Analytics** | Google Analytics 4 + Google Tag Manager |
| **File Processing** | pdf.js, JSZip (PPTX parsing), pdf-parse, ConvertAPI |
| **Media Recording** | react-webcam, RecordRTC (WebM/WAV), IndexedDB |
| **Charts & Export** | Recharts, jsPDF + html2canvas |
| **Rate Limiting** | Upstash Redis + `@upstash/ratelimit` |
| **Error Monitoring** | Sentry (`@sentry/nextjs`) |
| **Testing** | Jest + React Testing Library + Playwright (E2E) |
| **Deployment** | Vercel (Edge Network, Auto CI/CD) |

---

## 🤖 AI Architecture

Oratii uses a **multi-provider AI waterfall** (`src/lib/aiFallback.ts`) to guarantee near-100% uptime across all AI features:

```
Request
  └─► [1] Cerebras Llama-3.3-70B   — ultra-fast primary reasoning
          ↓ on failure / rate-limit
      [2] Groq Llama-3.3-70B        — high-throughput secondary
          ↓ on failure / rate-limit
      [3] Google Gemini 1.5/2.5     — multimodal vision & structured JSON
          ↓ on failure
      [4] OpenRouter Free            — emergency community fallback
```

**Gemini** handles all **multimodal tasks** — slide image analysis, body language scoring from webcam frames, and structured JSON evaluation reports.

---

## 🗂 Project Structure

```
oratii/
├── src/
│   ├── app/
│   │   ├── page.tsx               # Landing page
│   │   ├── speech-coach/          # Speech analysis studio
│   │   ├── presentation/          # Slide deck analyzer
│   │   ├── interview/             # AI mock interview studio
│   │   ├── viva/                  # Academic defense examiner
│   │   ├── challenge/             # 20-day speaking challenge
│   │   ├── dashboard/             # User performance hub
│   │   ├── reports/               # Session report viewer
│   │   ├── pricing/               # Plans & Razorpay checkout
│   │   ├── trainer/               # Educator portal
│   │   ├── admin/                 # Protected admin panel (role-gated)
│   │   └── api/                   # Next.js Route Handlers (server-side)
│   │       ├── speech-analyzer/
│   │       ├── analyze-body-language/
│   │       ├── interview-eval/
│   │       ├── viva/
│   │       ├── razorpay/
│   │       └── admin/
│   ├── components/                # Shared UI components
│   ├── lib/                       # Core utilities
│   │   ├── aiFallback.ts          # Multi-provider AI waterfall
│   │   ├── supabase.ts            # DB client helpers
│   │   ├── adminAuth.ts           # Admin email allowlist
│   │   └── gamification.ts        # XP / streak / challenge logic
│   └── middleware.ts              # Edge auth + admin route protection
├── public/
│   └── sw.js                      # PWA Service Worker v4
├── supabase/                       # DB migrations & seed scripts
├── tests/                          # Jest unit tests
├── .env.example                    # Environment variable template
└── PROJECT_CONTEXT.md              # Full architecture reference
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- A [Supabase](https://supabase.com/) project (free tier works)
- API key for at least one AI provider (Google Gemini recommended)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/oratii.git
cd oratii

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you're live! ✅

### Available Scripts

```bash
npm run dev       # Development server (localhost:3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint check
npm test          # Jest unit tests
```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
# ─── Supabase ──────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ─── AI Providers ──────────────────────────────────────────────
GOOGLE_GEMINI_API_KEY=
CEREBRAS_API_KEY=
GROQ_API_KEY=
OPENAI_API_KEY=           # optional fallback
OPENROUTER_API_KEY=       # optional fallback

# ─── Speech-to-Text (Deepgram) ─────────────────────────────────
DEEPGRAM_API_KEY=

# ─── Payments (Razorpay) ───────────────────────────────────────
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=

# ─── Email (Resend) ────────────────────────────────────────────
RESEND_API_KEY=

# ─── Push Notifications (VAPID) ────────────────────────────────
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# ─── File Conversion ───────────────────────────────────────────
CONVERTAPI_SECRET=

# ─── Rate Limiting (Upstash Redis) ────────────────────────────
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

> ⚠️ **Never commit `.env.local` to version control.** It is already listed in `.gitignore`.

---

## 🚀 Deployment

Oratii is deployed on **Vercel** with zero-config CI/CD from the main branch:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

**Custom domain setup:** Add your domain (e.g. `oratii.in`) in Vercel Project Settings → Domains.

The `next.config.mjs` automatically:
- 308 Permanent Redirect: `ppt-analyzer.vercel.app` → `https://oratii.in`
- `X-Robots-Tag: noindex` on all Vercel preview/staging URLs (SEO safe)

---

## 👑 Admin Panel

The admin panel lives at `/admin` and is protected by three layers:

1. **Edge Middleware** (`src/middleware.ts`) — non-admin users are instantly redirected
2. **Client Gatekeeper** (`src/app/admin/layout.tsx`) — session re-validation on every mount
3. **API Route Guards** — every `/api/admin/*` endpoint calls `verifyAdminCaller(req)`

### Admin Capabilities

| Module | Features |
|:---|:---|
| **Dashboard** | KPI cards, 6-month growth chart, MRR revenue chart, live activity feed |
| **User Management** | Search, plan upgrades, role toggle, credit allocation, CSV export |
| **Speech Analytics** | WPM trends, tone/clarity/fluency score distribution |
| **Interview Analytics** | Score distribution, session duration, performance trends |
| **Question Bank** | Add/edit/delete interview & defense questions by subject/difficulty |
| **PPT Reports** | Slide count, content/delivery scores, category breakdowns |
| **Revenue Dashboard** | Gross revenue, active subscribers, live Razorpay transaction log |
| **Push Notifications** | VAPID broadcast form, subscription management, cron triggers |
| **AI Health Monitor** | Token usage, daily limits, system prompt editor |
| **System Logs** | Real-time Supabase event stream, severity filters, CSV/JSON export |
| **Platform Settings** | Site config, UPI QR payments, support emails, 2FA |

---

## 🗄 Database Schema

All tables live in **Supabase (PostgreSQL)** with Row Level Security enabled:

| Table | Purpose |
|:---|:---|
| `profiles` | User accounts — plan, XP, streak, credits, role |
| `session_reports` | All coaching session logs (speech / slide / interview / defense) |
| `payments` | Razorpay transaction records |
| `viva_questions` | Question bank with subject, category, difficulty |
| `user_feedback` | Bug reports, feature requests, ratings |
| `support_tickets` | Help desk ticket queue |
| `system_logs` | Platform-wide event and error logs |
| `ai_settings` | Per-feature prompt templates & model config |
| `push_subscriptions` | VAPID device registration records |

---

## 📈 Roadmap

- [ ] **Mobile App** — React Native with offline speech coaching
- [ ] **Team Workspaces** — Organization-level analytics and batch assignments
- [ ] **AI Avatar Upgrade** — HeyGen / D-ID photorealistic interviewer integration
- [ ] **Multi-language Support** — Hindi, Urdu, Arabic coaching modes
- [ ] **Chrome Extension** — Real-time meeting coach overlay (Google Meet / Zoom)
- [ ] **LMS Integration** — Canvas / Moodle plugin for educators
- [x] Trainer Portal v1 ✅
- [x] Razorpay payments + webhooks ✅
- [x] PWA Service Worker + offline support ✅
- [x] Multi-AI fallback waterfall ✅
- [x] VAPID push notifications ✅

---

## 🤝 Contributing

Contributions are welcome!

```bash
# 1. Fork the repo
# 2. Create your feature branch
git checkout -b feat/your-feature-name

# 3. Read PROJECT_CONTEXT.md before making changes
# 4. Make your changes & run tests
npm test && npm run lint

# 5. Commit and push
git commit -m "feat: your descriptive commit message"
git push origin feat/your-feature-name

# 6. Open a Pull Request 🚀
```

> 📖 **Please read [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md)** before contributing — it contains the full architecture, all API routes, database schema, and coding guidelines.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

---

<div align="center">

Built with ❤️ by the Oratii team &nbsp;·&nbsp; [oratii.in](https://oratii.in)

⭐ **If Oratii helped you speak better, star this repo!**

</div>
