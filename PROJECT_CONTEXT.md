# 🚀 Oratii — Complete Project Context & System Architecture

> **Oratii** is an AI-powered communication, public speaking, presentation, and interview coaching platform built with Next.js 14 (App Router). It provides real-time speech evaluation, multimodal slide deck audits, interactive AI mock interviews, viva defense practice, gamified daily challenge tracks, and a full-featured live Admin Panel.

---

## 📑 Table of Contents
1. [Tech Stack & Infrastructure](#tech-stack--infrastructure)
2. [Database Schema & Supabase Models](#database-schema--supabase-models)
3. [Multi-AI Fallback & Waterfall Architecture](#multi-ai-fallback--waterfall-architecture)
4. [Live Site Core Modules & Endpoints](#live-site-core-modules--endpoints)
5. [Admin Panel Architecture & Capabilities](#admin-panel-architecture--capabilities)
6. [Agent Guidelines for Maintaining Context](#agent-guidelines-for-maintaining-context)

---

## 🛠 Tech Stack & Infrastructure

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 14.2.1 (App Router, React 18, Server & Client Components) |
| **Language** | TypeScript (ES2017+) |
| **Styling** | Tailwind CSS 3.4.1, Vanilla CSS Keyframes, Glassmorphism, Dark Mode |
| **Database & Auth** | Supabase (PostgreSQL, Row Level Security, Auth Triggers, Service Role Admin) |
| **Primary AI Models** | Google Gemini 1.5 / 2.5 Flash (Multimodal Text/Vision), Deepgram Nova-2 (STT) |
| **Fallback Cascade** | Cerebras (`llama-3.3-70b`), Groq, OpenAI GPT-4o, OpenRouter (`free` fallback) |
| **Client ML Vision** | MediaPipe Tasks Vision (GPU in-browser eye contact & posture tracking) |
| **Payments** | Razorpay Checkout SDK & Webhook verification (Pro: ₹499/mo, Enterprise: ₹1,999/mo) |
| **Notifications** | VAPID Web Push Notifications (`web-push`) & Resend Transactional Email |
| **Analytics & SEO** | Google Analytics 4 (`G-VP7GYTQVVB` via `@next/third-parties/google`), OpenGraph, JSON-LD Schema |
| **File Processing** | `pdf.js` (client), `JSZip` (PPTX parsing), `pdf-parse` (server), ConvertAPI |
| **Media Recording** | `react-webcam`, `RecordRTC` (WebM/WAV audio blob recording), IndexedDB |
| **Data Viz & PDF** | Recharts (Responsive charts), `jsPDF` + `html2canvas` (PDF Export) |

---

## 🗄 Database Schema & Supabase Models

* **`profiles`**: User account metadata (`id`, `email`, `full_name`, `avatar_url`, `role` [`user`|`admin`], `current_plan` [`free`|`pro`|`enterprise`], `credits`, `streak`, `xp`, `created_at`, `updated_at`).
* **`session_reports`**: Speech, PPT, and Interview session logs (`id`, `user_id`, `session_type` [`speech`|`ppt`|`interview`|`viva`], `scores` JSON, `transcript`, `wpm`, `filler_words`, `duration`, `created_at`).
* **`payments`**: Razorpay transaction logs (`id`, `user_id`, `user_email`, `amount`, `plan`, `razorpay_payment_id`, `status` [`completed`|`failed`|`refunded`], `method`, `created_at`).
* **`viva_questions`**: Question bank items (`id`, `question`, `subject`, `category`, `difficulty` [`easy`|`medium`|`hard`], `times_used`, `created_at`).
* **`user_feedback`**: User feedback submissions (`id`, `user_id`, `user_name`, `user_email`, `type` [`bug`|`feature`|`general`|`complaint`], `rating`, `message`, `created_at`).
* **`support_tickets`**: Support desk tickets (`id`, `user_id`, `user_name`, `subject`, `status` [`open`|`in_progress`|`resolved`|`closed`], `priority`, `created_at`, `updated_at`).
* **`system_logs`**: System event logs (`id`, `timestamp`, `severity` [`info`|`warning`|`error`|`critical`], `category`, `message`, `source`, `details`).
* **`ai_settings`**: Prompt engineering configurations (`feature_key`, `prompt_text`, `model_name`, `temperature`, `max_tokens`).
* **`push_subscriptions`**: VAPID push notification device registrations (`id`, `user_id`, `endpoint`, `keys`, `created_at`).

---

## 🛡 Multi-AI Fallback & Waterfall Architecture

Located in `src/lib/aiFallback.ts`, the multi-AI waterfall ensures 99.9% uptime by automatically retrying failed or rate-limited requests across providers:
1. **Cerebras Llama-3.3-70B**: High-speed primary text reasoning.
2. **Groq Llama-3.3-70B**: Secondary high-throughput LLM.
3. **Google Gemini 1.5 / 2.5 Flash**: Multimodal vision & structured JSON evaluation.
4. **OpenRouter Free Fallback**: Emergency fallback network.

---

## 🌐 Live Site Core Modules & Endpoints

| Route | Feature Description | API Endpoints Used |
| :--- | :--- | :--- |
| `/` | Landing page with feature showcases, interactive AI demo cards, & pricing | - |
| `/speech-coach` | Studio for speech practice with STT, WPM counter, filler word detection, & AI feedback | `/api/speech-analyzer`, `/api/speech-analyzer-deep` |
| `/presentation` | Slide deck analyzer supporting PPTX/PDF uploads, slide audit, and live presentation mode | `/api/convert-pptx`, `/api/presentations/*`, `/api/analyze-body-language` |
| `/interview` | Live AI Video Mock Interview Studio (Mocklingo-style dual-pane call): Left pane photorealistic AI interviewer (Sarah Jenkins / Marcus Vance) with speaking animations; Right pane live candidate webcam (`react-webcam`) with on/off toggle; Top question bar with audio replay; Real-time voice answer capture, STAR pacing cues, and automated evaluation reports | `/api/interview-eval`, `/api/interview/reminder` |
| `/viva` | Academic viva defense examiner for thesis and technical subject Q&A | `/api/viva` |
| `/challenge` | 20-Day Public Speaking Challenge with gamified daily drills & streak tracking | `/api/cron/streak-reminder` |
| `/dashboard` | User performance dashboard showing XP, streak, session history, & billing link | `/api/free-upgrade` |
| `/reports` & `/reports/[id]` | Detailed breakdown reports with Recharts visual graphs & jsPDF export | - |
| `/pricing` & `/dashboard/billing` | Plan comparison and Razorpay checkout modal (Pro & Enterprise) | `/api/razorpay/create-order`, `/api/webhooks/razorpay` |
| `/feedback` & `/support` | Help desk ticket submission and platform rating form | `/api/contact`, `/api/admin/feedback` |
| `/trainer` | Trainer Academy for cohort management, batch assignments, & code joins | `/api/trainer/*`, `/join/[code]` |

---

## 👑 Admin Panel Architecture & Capabilities (`/admin`)

All Admin routes bypass client RLS policies using `verifyAdminCaller` and `SUPABASE_SERVICE_ROLE_KEY`.

| Admin Route | Module Name | Features & Real-Time Sync |
| :--- | :--- | :--- |
| `/admin` | **Dashboard Overview** | KPI cards, 6-month user growth chart, MRR revenue chart, daily active user trends, live user signup & session activity feed. |
| `/admin/users` | **All Users** | User search, pagination, plan upgrade (`free`/`pro`/`enterprise`), role toggling (`admin`/`user`), credit allocation, CSV export. |
| `/admin/users/[id]` | **User Profile Detail** | Detailed profile view with user joined date, active plan, individual speech/PPT history, and payment transactions. |
| `/admin/users/premium` | **Premium Users** | Filtered view of active Pro and Enterprise subscribers. |
| `/admin/speech` & `.../analytics` | **Speech Coach Admin** | Speech report logs (WPM, tone, clarity, fluency) and aggregated score trends. |
| `/admin/interview` | **Mock Interview (v1)** | Session logs, score distribution, average interview duration. |
| `/admin/interview/questions` | **Question Bank** | Add, edit, and delete viva and mock interview questions by subject/difficulty. |
| `/admin/interview/analytics` | **Interview Analytics** | Candidate performance distribution and score trends over time. |
| `/admin/ppt` | **PPT Presentations** | Presentation audit reports, slide count, category breakdowns, content/delivery scores. |
| `/admin/viva` | **Viva Defense (Coming Soon)** | Roadmap view badged under Presentation Practice integration. |
| `/admin/challenge` | **Daily Habits Admin** | Platform-wide user streak distribution and habit retention stats. |
| `/admin/subscriptions` | **Plans & Allocations** | Pay-as-you-go credit pack manager (Starter Free 10 Cr/mo, Pro ₹149 for 40 Cr, Premium ₹499 for 200 Cr) and B2B campus licensing. |
| `/admin/revenue` | **Revenue Dashboard** | Financial metrics, gross platform revenue, active credit pack purchasers, and live payment transaction table. |
| `/admin/subscriptions/payments` | **Payment History** | Transaction log in INR (₹) with status filters (`completed`, `captured`, `failed`, `refunded`, `pending`) & CSV export. |
| `/admin/feedback` | **User Feedback** | Review user feedback submissions, star ratings, and bug reports. |
| `/admin/feedback/tickets` | **Support Tickets** | Ticket queue management, priority badges, and resolution status. |
| `/admin/ai-settings` | **AI Health & Limits** | Real-time token usage monitor for Gemini/Cerebras/Groq, daily limits, and system prompt editor. |
| `/admin/notifications` | **Push Notifications** | Broadcast VAPID Web Push notification form, active subscriptions, and streak reminder cron trigger. |
| `/admin/logs` | **System Logs** | Real-time Supabase event stream, log severity filtering, CSV/JSON export, and error simulation. |
| `/admin/settings` | **Platform Settings** | Site title, logo, contact/support emails, UPI ID for QR payments, and 2FA settings. |

---

## ⚡ Network Resilience & Service Worker Architecture (`/public/sw.js` & `src/app/error.tsx`)

* **Service Worker v3 (`CACHE_NAME = 'oratii-pwa-v3'`)**:
  - Strictly ignores API (`/api/*`), Next.js RSC data (`_rsc`, `_next/data`), and development HMR requests.
  - For Next.js dynamic JS chunks (`/_next/static/*`) and static assets: never returns HTML documents on network failures, preventing fatal `SyntaxError: Unexpected token '<'` (script compiling/execution errors).
  - Only serves HTML offline fallback when `event.request.mode === 'navigate'`.
  - Automatically flushes obsolete caches (`v1`, `v2`) on activation.
* **Error Boundaries (`src/app/error.tsx` & `src/app/global-error.tsx`)**:
  - Network and ChunkLoadError detection (`ChunkLoadError`, `Failed to fetch`, `Unexpected token '<'`, offline status).
  - Displays polished "Connection Interrupted" card with automatic `online` event listener for seamless auto-reconnect.
  - Safe error reporting wrapped in try/catch to prevent Sentry telemetry failures from crashing recovery UI.
  - Provides dual recovery actions: **"Reload & Reconnect"** (`window.location.reload()`) for clearing failed module caches, and **"Try Again"** (`reset()`).

* **SEO & Webmaster Tools Optimization**:
  - `next.config.mjs` configures an automatic 308 Permanent Redirect from `ppt-analyzer.vercel.app` to `https://oratii.in` and `X-Robots-Tag: noindex` on Vercel preview URLs.
  - Multi-resolution favicon support: SVG vector (`/oratii-logo-square.svg`), transparent Oratii speech bubble emblem with prominent gold/emerald soundwaves, multi-resolution ICO (`/favicon.ico` 16x16, 32x32, 48x48), `/icon-192.png`, and `/icon-512.png` eliminating black box artifact in browser URL bars.
  - Added `rel="nofollow"` to links pointing to private/disallowed routes (`/dashboard`, `/reports`, `/admin`) to prevent "Blocked by robots.txt" crawl errors in Bing Webmaster Tools.
  - Eliminated client bailouts during SSR for `/feedback`, `/support`, and `/challenge` to ensure all pages render with clean, crawlable `<h1>` tags in static server HTML.
  - Upgraded Google Analytics 4 integration to bulletproof `next/script` `afterInteractive` gtag.js tags inside `<body>` with automatic `G-` prefix normalization to prevent missing measurement ID issues.
  - Added official Google Tag Manager container (`GTM-TFNFSSKK`) script and noscript iframe in `src/app/layout.tsx`.

* **Trainer Portal v1 (Performance, Access Control & Landing Page Showcase)**:
  - **High-Speed Loading & Parallel Fetching**: Eliminated multi-hop waterfalls by parallelizing `profiles` & `academies` queries in `TrainerLayout` (`Promise.all`), parallelizing `/api/trainer/academy` and `/api/trainer/batches` in `page.tsx`, and parallelizing member/submission counts in `/api/trainer/batches/route.ts`. Added instant animated dashboard skeleton loader.
  - **Strict Normal User Protection Gate**: Guarded `/trainer` routes in `TrainerLayout` against normal student accounts (`role !== 'trainer' && role !== 'admin'`). Renders a dedicated "Instructor Access Only" gate with quick return to `/dashboard` or upgrade via `EducatorSwitchModal`.
  - **Landing Page Showcase Section (`#trainer-portal`)**: Added dedicated Educator Studio showcase on `HomeClient.tsx` with header nav link, interactive academy batch simulation, WhatsApp leaderboard preview, and instant CTAs. Dynamically targeted to only display for users who signed up as a trainer or admin (`role === 'trainer' || role === 'admin'`), keeping normal learner views uncluttered.
  - Harmonized with Oratii website theme (deep midnight navy `#0F1426`, gold `#F2A93B` accents, emerald badges, and rounded-3xl cards).

---

## 📝 Agent Guidelines for Maintaining Context

> **IMPORTANT MANDATE FOR AGENTS:**
> 1. **Read `PROJECT_CONTEXT.md`** at the beginning of tasks involving architecture, new features, or Admin Panel updates.
> 2. **Update `PROJECT_CONTEXT.md`** whenever a new route, database table, API endpoint, or major configuration change is made.
> 3. **Ensure Zero Dummy Data**: Always connect Admin views to live Supabase DB queries or `/api/admin/*` endpoints.

*Last Updated: 2026-10-23 (Replaced opaque dark square favicon with transparent Oratii brand speech emblem; build verified)*
