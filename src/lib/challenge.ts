// src/lib/challenge.ts
// Data model and state management for the Daily Challenge module

import { getStreak, updateStreak } from './storage';

export interface ChallengeTask {
  day: number;
  title: string;
  description: string;
  targetDuration: string;
  dos?: string[];
  donts?: string[];
}

export interface DayStatus {
  day: number;
  status: 'done' | 'skipped' | 'pending';
  score?: number;
  fillerScore?: number;
  completedAt?: string;
}

export interface FillerScoreEntry {
  day: number;
  fillerScore: number;
  score: number;
  date: string;
}

export interface ChallengeState {
  current_day: number; // 1-20 (or 21 when all days completed)
  streak_count: number;
  freeze_tokens_remaining: number; // starts at 2
  sessions_completed: number;
  days_status: DayStatus[];
  filler_scores: FillerScoreEntry[];
  unlocked_milestones: number[]; // e.g. [5, 10, 15, 20]
  lastUpdated?: string;
}

export interface JourneyDay {
  day: number;
  title: string;
  subtitle: string;
  description: string;
  category: 'intro' | 'pace' | 'interview' | 'technical' | 'fluency' | 'mock' | 'review';
  actionUrl: string;
  actionText: string;
  targetDuration: string;
}

export const SEVEN_DAY_JOURNEY: JourneyDay[] = [
  {
    day: 1,
    title: 'Introduce Yourself',
    subtitle: '60-second introduction',
    description: 'Share who you are, your background, and goals. Focus on clear, confident articulation.',
    category: 'intro',
    actionUrl: '/speech-coach?topic=Introduce+Yourself&duration=60&challengeDay=1',
    actionText: 'Start Day 1',
    targetDuration: '60 sec',
  },
  {
    day: 2,
    title: 'Speak for 60 Seconds',
    subtitle: 'Impromptu speaking & pacing',
    description: 'Choose any familiar topic and speak continuously for 60 seconds at a steady 130-155 WPM pace.',
    category: 'pace',
    actionUrl: '/speech-coach?topic=60-Second+Impromptu+Speaking&duration=60&challengeDay=2',
    actionText: 'Start Day 2',
    targetDuration: '60 sec',
  },
  {
    day: 3,
    title: 'Answer an HR Interview Question',
    subtitle: 'Behavioral response with STAR',
    description: 'Answer: "Tell me about a time you overcame a challenge." Use Situation, Task, Action, Result.',
    category: 'interview',
    actionUrl: '/interview?role=HR+Interview',
    actionText: 'Start Day 3',
    targetDuration: '90 sec',
  },
  {
    day: 4,
    title: 'Explain a Technical Concept',
    subtitle: 'Clarity without jargon',
    description: 'Explain a technical or professional concept simply, as if explaining it to a smart 12-year-old.',
    category: 'technical',
    actionUrl: '/speech-coach?topic=Explain+a+Technical+Concept&duration=90&challengeDay=4',
    actionText: 'Start Day 4',
    targetDuration: '90 sec',
  },
  {
    day: 5,
    title: 'Practice English Fluency',
    subtitle: 'Vocal flow & pause mastery',
    description: 'Focus on eliminating filler words ("um", "like", "basically") by using deliberate 1-second silent pauses.',
    category: 'fluency',
    actionUrl: '/speech-coach?topic=Daily+Fluency+Exercise&duration=60&challengeDay=5',
    actionText: 'Start Day 5',
    targetDuration: '60 sec',
  },
  {
    day: 6,
    title: 'Complete a Mock Interview',
    subtitle: 'Realistic AI call simulation',
    description: 'Put all techniques together in an interactive AI mock interview with real-time feedback.',
    category: 'mock',
    actionUrl: '/interview',
    actionText: 'Start Day 6',
    targetDuration: '3-5 min',
  },
  {
    day: 7,
    title: 'Review Your Progress',
    subtitle: 'Growth audit & celebration',
    description: 'Review your 7-day speaking telemetry, WPM pacing curve, and filler word reductions.',
    category: 'review',
    actionUrl: '/reports',
    actionText: 'Review Progress',
    targetDuration: 'Audit',
  },
];

export const DAILY_TASKS: ChallengeTask[] = [
  { day: 1, title: 'Introduce Yourself', description: 'Share who you are, your background, and goals in a 60-second introduction.', targetDuration: '60 sec' },
  { day: 2, title: 'Speak for 60 Seconds', description: 'Speak continuously on any familiar topic for 1 minute at steady 130-155 WPM.', targetDuration: '60 sec' },
  { day: 3, title: 'Answer an HR Interview Question', description: 'Answer a behavioral HR question using the STAR (Situation-Task-Action-Result) method.', targetDuration: '90 sec' },
  { day: 4, title: 'Explain a Technical Concept', description: 'Explain an engineering or business concept simply without confusing jargon.', targetDuration: '90 sec' },
  { day: 5, title: 'Practice English Fluency', description: 'Vocal flow exercise: eliminate filler words by practicing deliberate 1-second silent pauses.', targetDuration: '60 sec' },
  { day: 6, title: 'Complete a Mock Interview', description: 'Complete a realistic AI mock interview round with live question audio.', targetDuration: '3-5 min' },
  { day: 7, title: 'Review Your Progress', description: 'Review your 7-day speaking metrics, WPM trend, and filler reductions.', targetDuration: 'Audit' },
  { day: 8, title: 'Executive Elevator Pitch', description: 'Pitch a project, idea, or startup in 60 seconds with clear hook and call-to-action.', targetDuration: '60 sec' },
  { day: 9, title: 'Handling Difficult Questions', description: 'Practice responding calmly when an interviewer pushes back or asks for deeper detail.', targetDuration: '90 sec' },
  { day: 10, title: 'Final Graduation Speech', description: 'Deliver a 2-minute celebratory presentation on your communication journey.', targetDuration: '120 sec' }
];

const STORAGE_KEY = 'Oratii_20day_challenge_state';

export function getInitialChallengeState(): ChallengeState {
  const initialDays: DayStatus[] = Array.from({ length: 20 }, (_, i) => ({
    day: i + 1,
    status: 'pending',
  }));

  return {
    current_day: 1,
    streak_count: 0,
    freeze_tokens_remaining: 2,
    sessions_completed: 0,
    days_status: initialDays,
    filler_scores: [],
    unlocked_milestones: [],
    lastUpdated: new Date().toISOString(),
  };
}

export function getChallengeState(): ChallengeState {
  if (typeof window === 'undefined') return getInitialChallengeState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let parsed: ChallengeState;
    if (!raw) {
      parsed = getInitialChallengeState();
    } else {
      parsed = JSON.parse(raw);
    }

    let isModified = false;

    // Self-healing sanitization:
    // If sessions_completed is 0 or unrecorded, user has not completed any daily challenge.
    // Reset streak to 0, current_day to 1, and mark days_status as pending.
    if (!parsed.sessions_completed || parsed.sessions_completed === 0) {
      if (parsed.streak_count !== 0) {
        parsed.streak_count = 0;
        isModified = true;
      }
      if (parsed.current_day !== 1) {
        parsed.current_day = 1;
        isModified = true;
      }
      if (parsed.days_status && parsed.days_status.some(d => d.status === 'done')) {
        parsed.days_status = parsed.days_status.map(d => ({
          day: d.day,
          status: 'pending',
        }));
        isModified = true;
      }
      if (parsed.filler_scores && parsed.filler_scores.length > 0) {
        parsed.filler_scores = [];
        isModified = true;
      }
    } else {
      // Calculate actual completed days
      const doneCount = parsed.days_status ? parsed.days_status.filter(d => d.status === 'done').length : 0;
      if (parsed.streak_count !== doneCount) {
        parsed.streak_count = doneCount;
        isModified = true;
      }

      // Set current active day to next pending day
      const nextPendingIdx = parsed.days_status ? parsed.days_status.findIndex(d => d.status === 'pending') : -1;
      if (nextPendingIdx !== -1) {
        parsed.current_day = nextPendingIdx + 1;
      } else {
        parsed.current_day = 21;
      }
    }

    if (isModified || !raw) {
      saveChallengeState(parsed);
    }

    return parsed;
  } catch (e) {
    console.error('Error reading challenge state:', e);
    return getInitialChallengeState();
  }
}

export function saveChallengeState(state: ChallengeState): void {
  if (typeof window === 'undefined') return;
  state.lastUpdated = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function skipChallengeDay(dayNumber: number, forceResetStreak: boolean = false): {
  success: boolean;
  tokensLeft: number;
  streakReset: boolean;
  newState: ChallengeState;
} {
  const state = getChallengeState();
  let streakReset = false;

  if (state.freeze_tokens_remaining > 0 && !forceResetStreak) {
    state.freeze_tokens_remaining -= 1;
  } else {
    // No tokens remaining or force reset requested
    state.streak_count = 0;
    streakReset = true;
  }

  // Mark day as skipped
  const dayIdx = dayNumber - 1;
  if (state.days_status[dayIdx]) {
    state.days_status[dayIdx].status = 'skipped';
    state.days_status[dayIdx].completedAt = new Date().toISOString();
  }

  // Advance current_day if skipping today's active day
  if (state.current_day === dayNumber && state.current_day <= 20) {
    state.current_day += 1;
  }

  saveChallengeState(state);

  return {
    success: true,
    tokensLeft: state.freeze_tokens_remaining,
    streakReset,
    newState: state,
  };
}

export function completeChallengeDay(
  dayNumber: number,
  sessionResult: { overallScore: number; fillerCount: number }
): {
  newState: ChallengeState;
  newMilestoneUnlocked?: number;
} {
  const state = getChallengeState();

  // Mark day status as done
  const dayIdx = dayNumber - 1;
  if (state.days_status[dayIdx]) {
    state.days_status[dayIdx].status = 'done';
    state.days_status[dayIdx].score = sessionResult.overallScore;
    state.days_status[dayIdx].fillerScore = sessionResult.fillerCount;
    state.days_status[dayIdx].completedAt = new Date().toISOString();
  }

  // Increment total completed sessions
  state.sessions_completed = (state.sessions_completed || 0) + 1;

  // Streak count is count of done days
  const doneCount = state.days_status.filter(d => d.status === 'done').length;
  state.streak_count = doneCount;

  // Also update global main streak
  updateStreak();

  // Add filler score entry to history
  state.filler_scores.push({
    day: dayNumber,
    fillerScore: sessionResult.fillerCount,
    score: sessionResult.overallScore,
    date: new Date().toISOString(),
  });

  // Check milestone unlocks (Day 5, 10, 15, 20)
  let newMilestoneUnlocked: number | undefined = undefined;
  const milestones = [5, 10, 15, 20];
  if (milestones.includes(dayNumber) && !state.unlocked_milestones.includes(dayNumber)) {
    state.unlocked_milestones.push(dayNumber);
    newMilestoneUnlocked = dayNumber;
  }

  // Advance day counter if completed current active day
  if (state.current_day === dayNumber) {
    state.current_day = Math.min(21, dayNumber + 1);
  }

  saveChallengeState(state);

  return {
    newState: state,
    newMilestoneUnlocked,
  };
}

export function resetChallengeState(): ChallengeState {
  const initial = getInitialChallengeState();
  saveChallengeState(initial);
  return initial;
}
