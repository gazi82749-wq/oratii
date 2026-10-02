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
| `/interview` | AI Mock Interviewer with customizable role personas, real-time voice, and candidate evaluation | `/api/interview-eval`, `/api/interview/reminder` |
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

## 📝 Agent Guidelines for Maintaining Context

> **IMPORTANT MANDATE FOR AGENTS:**
> 1. **Read `PROJECT_CONTEXT.md`** at the beginning of tasks involving architecture, new features, or Admin Panel updates.
> 2. **Update `PROJECT_CONTEXT.md`** whenever a new route, database table, API endpoint, or major configuration change is made.
> 3. **Ensure Zero Dummy Data**: Always connect Admin views to live Supabase DB queries or `/api/admin/*` endpoints.

*Last Updated: 2026-10-02 (Verified Google OAuth Production Branding with Oratii logo & domains; configured Google Search Console domain verification, sitemap.xml, & robots.txt)*
