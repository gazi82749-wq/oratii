// src/lib/storage.ts
// Unified localStorage storage layer for all Oratii modules

import { supabase } from './supabaseClient';

const KEYS = {
  SESSIONS: 'Oratii_sessions',
  XP: 'Oratii_xp',
  LEVEL: 'Oratii_level',
  BADGES: 'Oratii_badges',
  STREAK: 'Oratii_streak',
  STREAK_DATE: 'Oratii_streak_date',
  CHALLENGES: 'Oratii_challenges_done',
  RECOMMENDATIONS: 'Oratii_recommendations',
  IMPROVEMENT_PLANS: 'Oratii_improvement_plans',
  INTERVIEW_CATEGORIES: 'Oratii_interview_cats_done',
  LEARNING_PATHS: 'Oratii_learning_paths',
  SESSION_RECORDINGS: 'Oratii_session_recordings',
  ONBOARDING: 'Oratii_onboarding',
  PROFILE: 'Oratii_profile',
  SETTINGS: 'Oratii_settings',
  STREAK_FREEZES: 'Oratii_streak_freezes'
};

// In-memory fallback for private browsing modes or quota errors
const memoryStorageFallback = new Map<string, string>();

function getJSON<T = any>(key: string, fallback: T | null = null): T | null {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    // Check in-memory fallback if localStorage access fails
    const memRaw = memoryStorageFallback.get(key);
    if (memRaw) {
      try { return JSON.parse(memRaw); } catch { return fallback; }
    }
  }
  return fallback;
}

function setJSON(key: string, value: any): void {
  if (typeof window === 'undefined') return;
  const stringified = JSON.stringify(value);
  try {
    localStorage.setItem(key, stringified);
  } catch (err) {
    console.warn(`[Storage] Failed to save key "${key}" to localStorage (QuotaExceeded or Private Browsing mode):`, err);
    memoryStorageFallback.set(key, stringified);
  }
}

// ─── Supabase Sync Helpers ───
async function syncUserStats() {
  if (typeof window === 'undefined') return;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    // We only update stats if user is logged in
    const xp = getXP();
    const streak = getStreak();
    const level = getLevel();
    
    // Fetch current highest streak first
    const { data: currentStats } = await supabase
      .from('user_stats')
      .select('highest_streak')
      .eq('user_id', session.user.id)
      .single();
      
    const highestStreak = currentStats?.highest_streak || 0;
    const newHighest = Math.max(highestStreak, streak);

    await supabase.from('user_stats').update({
      total_xp: xp,
      current_streak: streak,
      highest_streak: newHighest,
      level: level,
      updated_at: new Date().toISOString()
    }).eq('user_id', session.user.id);
  } catch (error) {
    console.error('Failed to sync user stats to Supabase:', error);
  }
}

async function syncSession(type: string, score: number, sessionData: any = null): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    await supabase.from('sessions').insert({
      user_id: session.user.id,
      session_type: type,
      score: score || 0,
      session_data: sessionData
    });
  } catch (error) {
    console.error('Failed to sync session to Supabase:', error);
  }
}

// ─── Session History (7-Day Privacy Retention Policy) ───
const RETENTION_PERIOD_MS = 7 * 24 * 60 * 60 * 1000; // 7 Days in milliseconds

export function isSessionExpired(timestamp: string | number): boolean {
  if (!timestamp) return false;
  const time = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
  if (isNaN(time)) return false;
  return Date.now() - time > RETENTION_PERIOD_MS;
}

export function purgeExpiredHistory(): void {
  if (typeof window === 'undefined') return;
  const sessions = getJSON(KEYS.SESSIONS, []);
  if (!Array.isArray(sessions) || sessions.length === 0) return;

  const validSessions = sessions.filter(s => !isSessionExpired(s.timestamp));
  if (validSessions.length !== sessions.length) {
    setJSON(KEYS.SESSIONS, validSessions);
  }
}

export function saveSession(type: string, data: Record<string, any>) {
  // Purge expired records before adding new session
  purgeExpiredHistory();

  const sessions = getJSON(KEYS.SESSIONS, []);
  const session = {
    id: `session-${Date.now()}`,
    type, // 'speech' | 'presentation' | 'viva' | 'interview' | 'jury' | 'challenge'
    timestamp: new Date().toISOString(),
    retentionExpiresAt: new Date(Date.now() + RETENTION_PERIOD_MS).toISOString(),
    ...data
  };
  sessions.unshift(session); // newest first
  // Keep maximum 100 recent sessions within retention window
  if (sessions.length > 100) sessions.length = 100;
  setJSON(KEYS.SESSIONS, sessions);
  
  // Sync to Supabase in background with full session data payload
  syncSession(type, data.scores?.overall || 0, session);
  
  return session;
}

export async function fetchCloudHistory(type: string | null = null) {
  if (typeof window === 'undefined') return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const sevenDaysAgoISO = new Date(Date.now() - RETENTION_PERIOD_MS).toISOString();

    let query = supabase
      .from('sessions')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('created_at', sevenDaysAgoISO)
      .order('created_at', { ascending: false });

    if (type && type !== 'all') {
      query = query.eq('session_type', type);
    }

    const { data, error } = await query;
    if (error || !data) {
      if (error) console.error('Error fetching sessions from Supabase:', error);
      return null;
    }

    return data
      .filter((item: any) => !isSessionExpired(item.created_at))
      .map((item: any) => {
        const payload = item.session_data || {};
        return {
          id: item.id || `session-${item.created_at}`,
          type: item.session_type,
          timestamp: item.created_at,
          retentionExpiresAt: new Date(new Date(item.created_at).getTime() + RETENTION_PERIOD_MS).toISOString(),
          scores: payload.scores || { overall: item.score || 0 },
          ...payload
        };
      });
  } catch (error) {
    console.error('Failed to fetch cloud history from Supabase:', error);
    return null;
  }
}

export function getHistory(type: string | null = null) {
  purgeExpiredHistory();
  const sessions = getJSON(KEYS.SESSIONS, []);
  const validSessions = sessions.filter(s => !isSessionExpired(s.timestamp));
  if (!type || type === 'all') return validSessions;
  return validSessions.filter(s => s.type === type);
}

export function getRecentSessions(count: number = 5) {
  const sessions = getJSON(KEYS.SESSIONS, []);
  return sessions.slice(0, count);
}

export function getSessionById(id: string) {
  const sessions = getJSON(KEYS.SESSIONS, []);
  return sessions.find(s => s.id === id) || null;
}

// ─── XP & Level ───
export function getXP() {
  return getJSON(KEYS.XP, 0);
}

export function addXP(amount: number): number {
  const current = getXP();
  const newXP = current + amount;
  setJSON(KEYS.XP, newXP);
  syncUserStats(); // Sync background
  return newXP;
}

export function getLevel() {
  const xp = getXP();
  if (xp >= 2000) return 5;
  if (xp >= 1000) return 4;
  if (xp >= 500) return 3;
  if (xp >= 200) return 2;
  return 1;
}

export function getLevelProgress() {
  const xp = getXP();
  const level = getLevel();
  const thresholds = [0, 200, 500, 1000, 2000];
  const currentThreshold = thresholds[level - 1];
  const nextThreshold = level < 5 ? thresholds[level] : thresholds[4];
  const progress = level >= 5 ? 100 : Math.round(((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
  return { xp, level, progress: Math.min(progress, 100), currentThreshold, nextThreshold };
}

// ─── Badges ───
export function getBadges() {
  return getJSON(KEYS.BADGES, []);
}

export function unlockBadge(badgeId: string): boolean {
  const badges = getBadges();
  if (!badges.includes(badgeId)) {
    badges.push(badgeId);
    setJSON(KEYS.BADGES, badges);
    return true; // newly unlocked
  }
  return false; // already had it
}

export function hasBadge(badgeId: string): boolean {
  return getBadges().includes(badgeId);
}

// ─── Streak ───
export function getStreak() {
  return getJSON(KEYS.STREAK, 0);
}

export function getStreakDate() {
  return getJSON(KEYS.STREAK_DATE, null);
}

export function getStreakFreezes() {
  return getJSON(KEYS.STREAK_FREEZES, 0);
}

export function addStreakFreeze(count: number = 1): number {
  const current = getStreakFreezes();
  const next = current + count;
  setJSON(KEYS.STREAK_FREEZES, next);
  return next;
}

export function consumeStreakFreeze() {
  const current = getStreakFreezes();
  if (current > 0) {
    setJSON(KEYS.STREAK_FREEZES, current - 1);
    return true;
  }
  return false;
}

export function updateStreak() {
  const today = new Date().toISOString().split('T')[0];
  const lastDate = getStreakDate();

  if (lastDate === today) {
    return getStreak(); // already logged today
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  let streak = getStreak();

  if (lastDate === yesterday) {
    streak += 1;
  } else if (lastDate) {
    // Missed a day. Check for streak freeze!
    if (consumeStreakFreeze()) {
      streak += 1; // Streak saved!
    } else {
      streak = 1; // reset
    }
  } else {
    streak = 1; // first time
  }

  setJSON(KEYS.STREAK, streak);
  setJSON(KEYS.STREAK_DATE, today);
  syncUserStats(); // Sync background
  return streak;
}

// ─── Challenge Progress ───
export function getCompletedChallenges() {
  return getJSON(KEYS.CHALLENGES, []);
}

export function completeChallenge(day: number) {
  const done = getCompletedChallenges();
  if (!done.includes(day)) {
    done.push(day);
    setJSON(KEYS.CHALLENGES, done);
  }
  return done;
}

export function isChallengeCompleted(day: number): boolean {
  return getCompletedChallenges().includes(day);
}

// ─── Interview Categories Done ───
export function getCompletedInterviewCategories() {
  return getJSON(KEYS.INTERVIEW_CATEGORIES, []);
}

export function completeInterviewCategory(categoryId: string) {
  const done = getCompletedInterviewCategories();
  if (!done.includes(categoryId)) {
    done.push(categoryId);
    setJSON(KEYS.INTERVIEW_CATEGORIES, done);
  }
  return done;
}

// ─── Learning Paths ───
export function getLearningPathProgress(pathId: string) {
  const paths = getJSON(KEYS.LEARNING_PATHS, {});
  return paths[pathId] || { completedMilestones: [], startedAt: null };
}

export function completeMilestone(pathId: string, milestoneId: string) {
  const paths = getJSON(KEYS.LEARNING_PATHS, {});
  if (!paths[pathId]) {
    paths[pathId] = { completedMilestones: [], startedAt: new Date().toISOString() };
  }
  if (!paths[pathId].completedMilestones.includes(milestoneId)) {
    paths[pathId].completedMilestones.push(milestoneId);
  }
  setJSON(KEYS.LEARNING_PATHS, paths);
  return paths[pathId];
}

// ─── Session Recordings (for Replay) ───
export function saveSessionRecording(sessionId: string, events: any) {
  const recordings = getJSON(KEYS.SESSION_RECORDINGS, {});
  recordings[sessionId] = {
    events,
    savedAt: new Date().toISOString()
  };
  // Keep only last 10 recordings to manage storage
  const keys = Object.keys(recordings);
  if (keys.length > 10) {
    delete recordings[keys[0]];
  }
  setJSON(KEYS.SESSION_RECORDINGS, recordings);
}

export function getSessionRecording(sessionId: string) {
  const recordings = getJSON(KEYS.SESSION_RECORDINGS, {});
  return recordings[sessionId] || null;
}

export function getAllRecordings() {
  return getJSON(KEYS.SESSION_RECORDINGS, {});
}

// ─── Recommendations ───
export function saveRecommendations(recs: any[]) {
  setJSON(KEYS.RECOMMENDATIONS, recs);
}

export function getRecommendations() {
  return getJSON(KEYS.RECOMMENDATIONS, []);
}

// ─── Improvement Plans ───
export function saveImprovementPlan(sessionId: string, plan: any) {
  const plans = getJSON(KEYS.IMPROVEMENT_PLANS, {});
  plans[sessionId] = plan;
  setJSON(KEYS.IMPROVEMENT_PLANS, plans);
}

export function getImprovementPlan(sessionId: string) {
  const plans = getJSON(KEYS.IMPROVEMENT_PLANS, {});
  return plans[sessionId] || null;
}

// ─── Weakness Detection ───
export function getWeaknesses() {
  const sessions = getHistory();
  const recent = sessions.slice(0, 10);
  const weaknesses = {};

  const metrics = ['confidence', 'clarity', 'pace', 'fluency', 'eyeContact', 'communication', 'technicalAccuracy', 'delivery'];

  metrics.forEach(metric => {
    const scores = recent
      .filter(s => s.scores && s.scores[metric] !== undefined)
      .map(s => s.scores[metric]);

    if (scores.length >= 2) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg < 70) {
        weaknesses[metric] = {
          average: Math.round(avg),
          sessions: scores.length,
          trend: scores.length >= 3 ? (scores[0] > scores[scores.length - 1] ? 'improving' : 'declining') : 'stable'
        };
      }
    }
  });

  return weaknesses;
}

// ─── Statistics ───
export function getStatistics() {
  const sessions = getHistory();
  const totalSessions = sessions.length;

  const allScores = sessions
    .filter(s => s.scores && s.scores.overall !== undefined)
    .map(s => s.scores.overall);

  const averageScore = allScores.length > 0
    ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
    : 0;

  const streak = getStreak();
  const xp = getXP();
  const level = getLevel();
  const badges = getBadges().length;
  const streakFreezes = getStreakFreezes();

  return { totalSessions, averageScore, streak, xp, level, badges, streakFreezes };
}

// ─── Profile & Settings ───
export interface UserProfile {
  name?: string;
  email?: string;
  goals?: string[];
  avatar?: string | null;
}

export function getProfile(): UserProfile {
  return getJSON<UserProfile>(KEYS.PROFILE, { name: '', email: '', goals: [], avatar: null }) || { name: '', email: '', goals: [], avatar: null };
}

export function saveProfile(profile: Record<string, any>) {
  setJSON(KEYS.PROFILE, profile);
}

export function getSettings() {
  return getJSON(KEYS.SETTINGS, { theme: 'dark', language: 'en', notifications: true }) || { theme: 'dark', language: 'en', notifications: true };
}
export function saveSettings(settings: Record<string, any>) {
  setJSON(KEYS.SETTINGS, settings);
}
