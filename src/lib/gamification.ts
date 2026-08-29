// src/lib/gamification.ts
// Gamification engine for XP awards, level-ups, badge unlocks, and streak management

import { XP_AWARDS, BADGES, GAMIFICATION_LEVELS } from './constants';
import {
  addXP, getXP, getLevel, getLevelProgress,
  unlockBadge, getBadges, hasBadge,
  updateStreak, getStreak,
  getHistory, getCompletedChallenges,
  getCompletedInterviewCategories, getStreakFreezes, addStreakFreeze
} from './storage';

// ─── Process a completed session and return XP + badge events ───
export function processSessionCompletion(type: string, scores: Record<string, any> = {}) {
  const events = [];
  const previousLevel = getLevel();

  // 1. Update streak
  const streak = updateStreak();

  // 2. Award base XP via lookup map
  const XP_MAP: Record<string, string> = {
    speech: 'speech_session', presentation: 'presentation_session', viva: 'viva_session',
    interview: 'interview_round', jury: 'jury_defense', challenge: 'challenge_day'
  };
  let xpGained = XP_AWARDS[XP_MAP[type]] || 20;

  // 3. Bonus XP for high scores
  const overallScore = scores.overall || scores.confidence || 0;
  if (overallScore >= 90) {
    xpGained += XP_AWARDS.high_score_bonus;
    events.push({ type: 'bonus', message: 'High Score Bonus! +15 XP' });
  }

  // 4. Streak bonuses
  if (streak === 3) {
    xpGained += XP_AWARDS.streak_3_bonus;
    events.push({ type: 'streak', message: '3-Day Streak! +25 XP' });
  }
  if (streak === 7) {
    xpGained += XP_AWARDS.streak_7_bonus;
    events.push({ type: 'streak', message: '7-Day Streak! +50 XP' });
  }

  // 5. Add XP
  let totalXP = addXP(xpGained);
  events.push({ type: 'xp', amount: xpGained, totalXP });

  // 6. Check level-up
  const newLevel = getLevel();
  if (newLevel > previousLevel) {
    const levelInfo = GAMIFICATION_LEVELS.find(l => l.level === newLevel);
    events.push({
      type: 'level_up',
      level: newLevel,
      name: levelInfo?.name || `Level ${newLevel}`,
      icon: levelInfo?.icon || '🎉'
    });
  }

  // 7. Check badge unlocks
  const newBadges = checkBadgeUnlocks(type, scores, streak);
  newBadges.forEach(badge => {
    events.push({ type: 'badge', badge });
    
    // Reward for unlocking a badge (Make the user happy!)
    const badgeBonus = 100;
    xpGained += badgeBonus;
    totalXP = addXP(badgeBonus);
    events.push({ type: 'bonus', message: `Badge Unlocked: ${badge.name}! +${badgeBonus} XP` });
  });

  return {
    xpGained,
    totalXP,
    level: newLevel,
    leveledUp: newLevel > previousLevel,
    streak,
    events,
    newBadges
  };
}

// ─── Check which badges should be unlocked ───
function checkBadgeUnlocks(sessionType: string, scores: Record<string, any>, streak: number) {
  const unlocked = [];
  const sessions = getHistory();
  const challengesDone = getCompletedChallenges();
  const interviewCats = getCompletedInterviewCategories();

  const stats = {
    speech_count: sessions.filter(s => s.type === 'speech').length,
    presentation_count: sessions.filter(s => s.type === 'presentation').length,
    viva_questions: sessions.filter(s => s.type === 'viva').reduce((sum, s) => sum + (s.questionsAnswered || 0), 0),
    interview_categories_done: interviewCats.length,
    streak,
    max_score: Math.max(scores.overall || 0, ...sessions.map(s => s.scores?.overall || 0)),
    challenges_done: challengesDone.length,
    jury_count: sessions.filter(s => s.type === 'jury').length,
    builds: sessions.filter(s => s.type === 'builder').length,
    level: getLevel(),
    zero_filler_sessions: sessions.filter(s => s.type === 'speech' && s.scores?.fillerCount === 0).length,
    high_eye_contact: sessions.filter(s => s.scores?.eyeContact >= 95).length
  };

  // Check each badge
  const badgeChecks = {
    first_words: stats.speech_count >= 1,
    slide_master: stats.presentation_count >= 5,
    viva_survivor: stats.viva_questions >= 10,
    interview_ready: stats.interview_categories_done >= 6,
    on_fire: stats.streak >= 3,
    unstoppable: stats.streak >= 7,
    perfect_score: stats.max_score >= 100,
    challenge_10: stats.challenges_done >= 10,
    jury_survivor: stats.jury_count >= 1,
    builder: stats.builds >= 1,
    no_fillers: stats.zero_filler_sessions >= 1,
    eye_contact_pro: stats.high_eye_contact >= 1,
    Oratii_master: stats.level >= 5
  };

  Object.entries(badgeChecks).forEach(([badgeId, condition]) => {
    if (condition && !hasBadge(badgeId)) {
      const badgeDef = BADGES.find(b => b.id === badgeId);
      if (badgeDef && unlockBadge(badgeId)) {
        unlocked.push(badgeDef);
      }
    }
  });

  // Check improvement badge (20%+ increase between last two sessions of same type)
  const typeSessions = sessions.filter(s => s.type === sessionType);
  if (typeSessions.length >= 2 && scores.overall) {
    const prevScore = typeSessions[0].scores?.overall || 0;
    if (scores.overall - prevScore >= 20 && !hasBadge('improver')) {
      const badgeDef = BADGES.find(b => b.id === 'improver');
      if (badgeDef && unlockBadge('improver')) {
        unlocked.push(badgeDef);
      }
    }
  }

  return unlocked;
}

// ─── Get gamification summary for UI display ───
export function getGamificationSummary() {
  const levelProgress = getLevelProgress();
  const badges = getBadges();
  const streak = getStreak();
  const freezes = getStreakFreezes();
  const allBadges = BADGES.map(b => ({
    ...b,
    unlocked: badges.includes(b.id)
  }));

  return {
    ...levelProgress,
    streak,
    freezes,
    badges: allBadges,
    unlockedCount: badges.length,
    totalBadges: BADGES.length
  };
}

// ─── Gamification Economy ───
export function purchaseStreakFreeze(cost = 200) {
  const currentXp = getXP();
  if (currentXp >= cost) {
    addXP(-cost);
    addStreakFreeze(1);
    return true;
  }
  return false;
}
