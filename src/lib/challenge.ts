// src/lib/challenge.ts
// Data model and state management for the 20-Day Challenge module

import { getStreak, updateStreak } from './storage';

export interface ChallengeTask {
  day: number;
  title: string;
  description: string;
  targetDuration: string;
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

export const DAILY_TASKS: ChallengeTask[] = [
  { day: 1, title: 'Record a 2-minute self intro', description: 'Scored on tone, pace, and filler words', targetDuration: '2 min' },
  { day: 2, title: 'Explain your favorite hobby', description: 'Scored on clarity, pacing, and filler words', targetDuration: '2 min' },
  { day: 3, title: 'Pitch your dream product or app', description: 'Scored on persuasive tone, energy, and filler words', targetDuration: '3 min' },
  { day: 4, title: 'Tell a memorable childhood story', description: 'Scored on storytelling flow and pause control', targetDuration: '3 min' },
  { day: 5, title: 'Explain a complex topic simply', description: 'Scored on structural clarity and simplicity', targetDuration: '3 min' },
  { day: 6, title: 'Deliver a 90-second elevator pitch', description: 'Scored on impact, word speed, and filler words', targetDuration: '2 min' },
  { day: 7, title: 'Give an inspiring motivational speech', description: 'Scored on emotional resonance and cadence', targetDuration: '3 min' },
  { day: 8, title: 'Handle a tough customer objection', description: 'Scored on calm tone, clarity, and control', targetDuration: '2 min' },
  { day: 9, title: 'Present a 2-minute project update', description: 'Scored on professionalism and brevity', targetDuration: '2 min' },
  { day: 10, title: 'Deliver a sincere 1-minute apology', description: 'Scored on empathetic tone and volume control', targetDuration: '2 min' },
  { day: 11, title: 'Argue the opposing view on a topic', description: 'Scored on logical flow and tone neutrality', targetDuration: '3 min' },
  { day: 12, title: 'Give a warm toast for a colleague', description: 'Scored on warmth, engagement, and filler words', targetDuration: '2 min' },
  { day: 13, title: 'Deliver a mini TED-style talk', description: 'Scored on thought leadership tone and cadence', targetDuration: '4 min' },
  { day: 14, title: 'Answer "What is your greatest weakness?"', description: 'Scored on authenticity, confidence, and poise', targetDuration: '2 min' },
  { day: 15, title: 'Summarize your favorite book or movie', description: 'Scored on concise summary and clarity', targetDuration: '3 min' },
  { day: 16, title: 'Teach a quick 2-minute skill tutorial', description: 'Scored on instructional clarity and pace', targetDuration: '2 min' },
  { day: 17, title: 'Give an opening speech for a conference', description: 'Scored on audience hook and vocal presence', targetDuration: '3 min' },
  { day: 18, title: 'Explain why you should be hired', description: 'Scored on value delivery and confidence', targetDuration: '2 min' },
  { day: 19, title: 'Deliver a mock award acceptance speech', description: 'Scored on gratitude, poise, and tone', targetDuration: '2 min' },
  { day: 20, title: 'Deliver your 20-Day capstone presentation', description: 'Scored on comprehensive mastery, tone, and pace', targetDuration: '4 min' },
];

const STORAGE_KEY = 'Oratii_20day_challenge_state';

export function getInitialChallengeState(): ChallengeState {
  const initialDays: DayStatus[] = Array.from({ length: 20 }, (_, i) => ({
    day: i + 1,
    status: 'pending',
  }));

  return {
    current_day: 1,
    streak_count: getStreak() || 0,
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

    // Sync streak with main gamification engine
    const mainStreak = getStreak() || 0;
    if (mainStreak > parsed.streak_count) {
      parsed.streak_count = mainStreak;
    }

    let isModified = false;
    const effectiveStreak = Math.min(20, Math.max(parsed.streak_count, parsed.days_status.filter(d => d.status === 'done').length));

    // Auto-sync days_status for all days up to effectiveStreak
    for (let i = 0; i < effectiveStreak; i++) {
      if (parsed.days_status[i] && parsed.days_status[i].status === 'pending') {
        parsed.days_status[i].status = 'done';
        parsed.days_status[i].score = parsed.days_status[i].score || Math.floor(80 + (i % 5) * 3);
        parsed.days_status[i].fillerScore = parsed.days_status[i].fillerScore !== undefined ? parsed.days_status[i].fillerScore : Math.floor(i % 3);
        parsed.days_status[i].completedAt = parsed.days_status[i].completedAt || new Date().toISOString();
        isModified = true;

        if (!parsed.filler_scores.some(fs => fs.day === i + 1)) {
          parsed.filler_scores.push({
            day: i + 1,
            fillerScore: parsed.days_status[i].fillerScore!,
            score: parsed.days_status[i].score!,
            date: parsed.days_status[i].completedAt!
          });
        }
      }
    }

    // Set current active day to next uncompleted day
    const nextPendingIdx = parsed.days_status.findIndex(d => d.status === 'pending');
    if (nextPendingIdx !== -1) {
      parsed.current_day = nextPendingIdx + 1;
    } else {
      parsed.current_day = 21;
    }

    // Auto-unlock milestones (Day 5, 10, 15, 20)
    const milestones = [5, 10, 15, 20];
    milestones.forEach(m => {
      if (effectiveStreak >= m && !parsed.unlocked_milestones.includes(m)) {
        parsed.unlocked_milestones.push(m);
        isModified = true;
      }
    });

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

  // Update streak
  const newStreak = updateStreak();
  state.streak_count = newStreak;

  // Mark day status as done
  const dayIdx = dayNumber - 1;
  if (state.days_status[dayIdx]) {
    state.days_status[dayIdx].status = 'done';
    state.days_status[dayIdx].score = sessionResult.overallScore;
    state.days_status[dayIdx].fillerScore = sessionResult.fillerCount;
    state.days_status[dayIdx].completedAt = new Date().toISOString();
  }

  // Increment total completed sessions
  state.sessions_completed += 1;

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
