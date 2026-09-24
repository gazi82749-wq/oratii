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

export const DAILY_TASKS: ChallengeTask[] = [
  { day: 1, title: 'Introduce Yourself', description: 'A basic 60-second introduction.', targetDuration: '60 sec' },
  { day: 2, title: 'Describe Nature', description: 'Talk about your favorite place in nature.', targetDuration: '60 sec' },
  { day: 3, title: 'Thoughts on Money', description: 'What do you think about money and wealth?', targetDuration: '60 sec' },
  { day: 4, title: 'Your Favorite Hobby', description: 'Discuss what you enjoy doing in your free time.', targetDuration: '60 sec' },
  { day: 5, title: 'A Memorable Trip', description: 'Talk about a journey you will never forget.', targetDuration: '60 sec' },
  { day: 6, title: 'Future Goals', description: 'Where do you see yourself in 5 years?', targetDuration: '60 sec' },
  { day: 7, title: 'Thoughts on Technology', description: 'How does technology impact our daily lives?', targetDuration: '60 sec' },
  { day: 8, title: 'Favorite Food', description: 'Describe your favorite meal in detail.', targetDuration: '60 sec' },
  { day: 9, title: 'Role Model', description: 'Who inspires you the most and why?', targetDuration: '60 sec' },
  { day: 10, title: 'Best Childhood Memory', description: 'Share a happy memory from your childhood.', targetDuration: '60 sec' }
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

    // We no longer sync with the global mainStreak so it doesn't auto-complete challenge days
    // when a user does a mock interview instead.

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
