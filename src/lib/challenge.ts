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
  {
    day: 1,
    title: '90-Sec Professional Introduction ("Tell me about yourself")',
    description: 'Scored on technical focus, clarity, and elimination of personal fluff',
    targetDuration: '90 sec',
    dos: ['Degree, college, & core technical focus (15s)', '1 major engineering project built & tech stack (45s)', 'Why you are eager for this role / company (30s)'],
    donts: ['Do NOT recite high school marks from 5+ years ago', "Do NOT detail family history or parents' jobs", 'Do NOT list 10 generic hobbies (music, cricket)']
  },
  {
    day: 2,
    title: 'Defend Your Engineering Project Architecture',
    description: 'Scored on architectural data flow, schema logic, and component boundaries',
    targetDuration: '2 min',
    dos: ['Explain Frontend, Backend APIs & Database interaction', 'Explain why you selected this specific tech stack', 'State 1 concrete technical bottleneck resolved'],
    donts: ['Do NOT say "it just works" without detailing how', 'Do NOT skip the database schema explanation']
  },
  {
    day: 3,
    title: 'STAR Method Behavioral Round: Crisis Resolution',
    description: 'Scored on Situation, Task, Action, and measurable Result under pressure',
    targetDuration: '2 min',
    dos: ['Define the exact production bug / project deadline crisis', 'Detail your specific personal technical contributions', 'Conclude with the quantifiable outcome (e.g. latency, uptime)'],
    donts: ['Do NOT blame other teammates for the bug', 'Do NOT omit the quantifiable resolution']
  },
  {
    day: 4,
    title: 'Explain a Complex Technical Concept Simply',
    description: 'Scored on simple analogies, structural clarity, and non-tech audience comprehension',
    targetDuration: '2 min',
    dos: ['Use a clean real-world analogy (e.g. restaurant menu for APIs)', 'Explain core mechanics without heavy jargon', 'Confirm clarity for a non-technical recruiter'],
    donts: ['Do NOT recite textbook definitions verbatim', 'Do NOT ramble without a structured beginning, middle, end']
  },
  {
    day: 5,
    title: 'Campus Placement Salary & Role Negotiation',
    description: 'Scored on professional enthusiasm, growth questions, and confident poise',
    targetDuration: '2 min',
    dos: ['Express genuine excitement for learning & mentorship', 'Ask thoughtful questions about engineering culture and tech stack', 'Maintain respectful, confident vocal modulation'],
    donts: ['Do NOT sound aggressive or entitled', 'Do NOT make compensation the sole topic of discussion']
  },
  {
    day: 6,
    title: 'Cross-Exam Defense: Handling Hostile Questions',
    description: 'Scored on composure, emotional stability, and evidence-based defense',
    targetDuration: '2 min',
    dos: ['Acknowledge the examiner\'s skepticism calmly', 'Provide logical justification with real architectural trade-offs', 'Admit edge-case limits honestly without guessing'],
    donts: ['Do NOT become defensive or argue with the panel', 'Do NOT fake an answer if you do not know']
  },
  {
    day: 7,
    title: 'IELTS Speaking Part 2 Cue Card (Technology & Society)',
    description: 'Scored on 2-minute continuous fluency, lexical resource, and coherence',
    targetDuration: '2 min',
    dos: ['Speak uninterrupted for the full 2 minutes', 'Structure into: What it is, How it functions, and Societal impact', 'Use rich vocabulary and discourse connectors'],
    donts: ['Do NOT pause for more than 4 seconds', 'Do NOT repeat the exact same sentence multiple times']
  },
  {
    day: 8,
    title: 'STAR Behavioral: Dealing with a Difficult Teammate',
    description: 'Scored on interpersonal conflict de-escalation, empathy, and project alignment',
    targetDuration: '2 min',
    dos: ['Focus on aligning goals toward sprint/project delivery', 'Describe a professional 1-on-1 dialogue held to clarify roles', 'Highlight how the team succeeded together'],
    donts: ['Do NOT badmouth the teammate or show personal anger', 'Do NOT claim you wrote all the code alone']
  },
  {
    day: 9,
    title: '2-Minute Executive Project Status & Metrics Pitch',
    description: 'Scored on executive presence, metric precision, and brevity',
    targetDuration: '2 min',
    dos: ['State current milestone completion percentage', 'Highlight 1 critical blocker and proactive mitigation plan', 'Deliver a punchy, confident 120-second summary'],
    donts: ['Do NOT deliver an unstructured narrative', 'Do NOT hide project blockers until delivery day']
  },
  {
    day: 10,
    title: 'Global Tech Verbal Communication & Accent Clarity Drill',
    description: 'Scored on pronunciation, pace (130-150 WPM), and regional filler elimination',
    targetDuration: '2 min',
    dos: ['Enunciate clearly with consistent volume', 'Eliminate regional filler words ("matlab", "basically", "actually")', 'Speak in complete, grammatically sound sentences'],
    donts: ['Do NOT rush speech above 160 WPM or mutter under your breath', 'Do NOT use casual campus slang or informal shortcuts']
  },
  {
    day: 11,
    title: 'Defending Trade-offs & Limitations in Your Project',
    description: 'Scored on intellectual honesty, engineering maturity, and roadmap vision',
    targetDuration: '2 min',
    dos: ['Openly state 1 architectural limitation of your system', 'Explain why this trade-off was chosen over alternatives', 'Outline how you would scale it in version 2.0'],
    donts: ['Do NOT claim your software has "zero bugs or limitations"', 'Do NOT freeze when asked about flaws']
  },
  {
    day: 12,
    title: 'Group Discussion (GD) Opening & Interjection Drill',
    description: 'Scored on topic framing, respectful transition phrases, and group presence',
    targetDuration: '2 min',
    dos: ['Hook the group with a clear definition and balanced stance', 'Use polite transition phrases ("Building on what my peer said...")', 'Deliver points in crisp 45-60 second structured bursts'],
    donts: ['Do NOT shout, interrupt aggressively, or dominate the floor', 'Do NOT stay completely silent for the entire round']
  },
  {
    day: 13,
    title: 'Technical Viva: Database Indexing & Scalability',
    description: 'Scored on database theory, B-Trees, normalization, and ACID properties',
    targetDuration: '2 min',
    dos: ['Explain how indexing improves read speed vs write overhead', 'Discuss Foreign Keys, Primary Keys, and ACID guarantees', 'Contrast relational SQL with NoSQL use cases correctly'],
    donts: ['Do NOT confuse SQL tables with document collections', 'Do NOT give vague one-word answers without reasoning']
  },
  {
    day: 14,
    title: 'Answering "What is your greatest technical or academic failure?"',
    description: 'Scored on authenticity, self-reflection, and preventive engineering habits',
    targetDuration: '2 min',
    dos: ['Pick a genuine mistake that taught you an engineering lesson', 'Detail how you diagnosed, debugged, and resolved it', 'Explain the preventive safeguards you instituted afterwards'],
    donts: ['Do NOT say "I have never failed" or "I am too perfectionist"', 'Do NOT blame external servers or team members']
  },
  {
    day: 15,
    title: 'Rapid-Fire Technical Viva Defense',
    description: 'Scored on prompt response time, conceptual precision, and no-freeze delivery',
    targetDuration: '2 min',
    dos: ['Answer directly in 1 to 2 crisp, high-impact sentences per question', 'Maintain confident posture and prompt eye contact', 'Remain calm under fast questioning cadence'],
    donts: ['Do NOT beat around the bush with lengthy, rambling intros', 'Do NOT freeze or panic if you need a split-second breath']
  },
  {
    day: 16,
    title: 'Explaining Code / Architecture to a Non-Technical Recruiter',
    description: 'Scored on translation of technical components into tangible business outcomes',
    targetDuration: '2 min',
    dos: ['Translate technical components into business user benefits', 'Focus on user experience, reliability, and security', 'Keep language engaging, relatable, and clear'],
    donts: ['Do NOT overwhelm the recruiter with raw syntax or acronyms', 'Do NOT speak in a flat, monotone voice']
  },
  {
    day: 17,
    title: 'IELTS Speaking Part 3: Abstract AI & Automation Debate',
    description: 'Scored on balanced argumentation, formal connectors, and abstract reasoning',
    targetDuration: '3 min',
    dos: ['Express balanced viewpoints on workforce automation', 'Use formal discourse connectors ("Consequently", "In contrast", "Furthermore")', 'Support generalizations with realistic societal examples'],
    donts: ['Do NOT provide simplistic 1-word yes/no answers', 'Do NOT rely on informal internet colloquialisms']
  },
  {
    day: 18,
    title: 'Campus Final Round: "Why should we hire you over other peers?"',
    description: 'Scored on differentiated value proposition, adaptability, and poise',
    targetDuration: '2 min',
    dos: ['Connect your technical competence directly to company needs', 'Highlight your rapid learning speed and team adaptability', 'Conclude with sincere dedication and professional polish'],
    donts: ['Do NOT sound arrogant or speak negatively of other students', 'Do NOT give a generic, clichéd script found on Google']
  },
  {
    day: 19,
    title: 'High-Pressure Hostile Examiner Stress Test',
    description: 'Scored on poise under intense cross-examination, voice stability, and composure',
    targetDuration: '2 min',
    dos: ['Maintain professional composure when challenged forcefully', 'Stand firmly by verified architectural facts while remaining respectful', 'Control vocal breathing, volume, and pacing'],
    donts: ['Do NOT lose your temper or stammer in panic', 'Do NOT agree with demonstrably incorrect statements out of fear']
  },
  {
    day: 20,
    title: 'Full Campus Placement & Viva Capstone Simulation',
    description: 'Comprehensive evaluation across Introduction, Technical Architecture, STAR, and Viva Defense',
    targetDuration: '3 min',
    dos: ['Deliver a unified 3-stage performance (Intro, Project, Q&A)', 'Synthesize all 20 days of pacing, STAR structure, and conciseness', 'Target a 90%+ composite scorecard for placement certification'],
    donts: ['Do NOT revert to old filler habits or rambling', 'Do NOT rush through the final closing statement']
  }
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
