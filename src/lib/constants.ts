// src/lib/constants.ts
// Central constants for all Oratii modules

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://oratii.in';

// ─── Interview Categories (Module 1) ───
export const INTERVIEW_CATEGORIES = [
  {
    id: 'hr',
    label: 'HR Interview',
    icon: '👔',
    description: 'Behavioral questions, STAR method, culture fit',
    color: '#6c5ce7'
  },
  {
    id: 'technical',
    label: 'Technical Interview',
    icon: '💻',
    description: 'Coding concepts, system design, problem-solving',
    color: '#00cec9'
  },
  {
    id: 'product',
    label: 'Product Interview',
    icon: '📦',
    description: 'User empathy, metrics, prioritization frameworks',
    color: '#fd79a8'
  },
  {
    id: 'startup',
    label: 'Startup Founder',
    icon: '🚀',
    description: 'Vision, market analysis, traction, scalability',
    color: '#fdcb6e'
  },
  {
    id: 'placement',
    label: 'Placement Interview',
    icon: '🎓',
    description: 'Aptitude, communication, general knowledge',
    color: '#00b894'
  },
  {
    id: 'communication',
    label: 'Communication Skills',
    icon: '🗣️',
    description: 'Articulation, structure, persuasion, clarity',
    color: '#e17055'
  }
];
export const JURY_PERSONAS = [
  {
    id: 'professor',
    name: 'Dr. Sharma',
    title: 'Professor',
    icon: '🎓',
    color: '#6c5ce7',
    personality: 'You are a strict university professor who values academic rigor, methodology, proper research references, and structured thinking. Ask questions about methodology, literature review, and theoretical foundations.'
  },
  {
    id: 'industry_expert',
    name: 'Ms. Kapoor',
    title: 'Industry Expert',
    icon: '🏢',
    color: '#00cec9',
    personality: 'You are a senior industry professional who values practical application, real-world feasibility, market relevance, and implementation details. Ask questions about practical use cases, scalability, and industry standards.'
  },
  {
    id: 'investor',
    name: 'Mr. Mehta',
    title: 'Investor',
    icon: '💰',
    color: '#fdcb6e',
    personality: 'You are a venture capital investor who evaluates business viability, ROI, market size, competitive advantage, and monetization. Ask questions about business model, revenue, market opportunity, and growth strategy.'
  },
  {
    id: 'researcher',
    name: 'Dr. Patel',
    title: 'Researcher',
    icon: '🔬',
    color: '#fd79a8',
    personality: 'You are a research scientist who values novelty, scientific contribution, experimental design, data analysis, and reproducibility. Ask questions about innovation, data validation, and research contribution.'
  }
];

// ——— Gamification Levels (Module 9) ———
export const GAMIFICATION_LEVELS = [
  { level: 1, name: 'Beginner Speaker', icon: '🌱', xpRequired: 0, color: '#a29bfe' },
  { level: 2, name: 'Confident Speaker', icon: '🎤', xpRequired: 200, color: '#6c5ce7' },
  { level: 3, name: 'Presentation Pro', icon: '📊', xpRequired: 500, color: '#00cec9' },
  { level: 4, name: 'Communication Expert', icon: '⚡', xpRequired: 1000, color: '#fdcb6e' },
  { level: 5, name: 'Oratii Master', icon: '🏆', xpRequired: 2000, color: '#fd79a8' }
];

// ——— XP Awards ———
export const XP_AWARDS = {
  speech_session: 30,
  presentation_session: 40,
  viva_session: 25,
  interview_round: 35,
  jury_defense: 50,
  challenge_day: 20,
  high_score_bonus: 15,     // score > 90%
  streak_3_bonus: 25,
  streak_7_bonus: 50
};

// ——— Achievement Badges ———
export const BADGES = [
  { id: 'first_words', name: 'First Words', icon: '🎤', description: 'Complete your first speech session' },
  { id: 'slide_master', name: 'Slide Master', icon: '📊', description: 'Analyze 5 presentations' },
  { id: 'viva_survivor', name: 'Viva Survivor', icon: '🎓', description: 'Complete 10 viva questions' },
  { id: 'interview_ready', name: 'Interview Ready', icon: '💼', description: 'Complete all 6 interview categories' },
  { id: 'on_fire', name: 'On Fire', icon: '🔥', description: 'Maintain a 3-day streak' },
  { id: 'unstoppable', name: 'Unstoppable', icon: '⚡', description: 'Maintain a 7-day streak' },
  { id: 'perfect_score', name: 'Perfect Score', icon: '🏆', description: 'Score 100% on any session' },
  { id: 'improver', name: 'Improver', icon: '📈', description: 'Increase score by 20% between sessions' },
  { id: 'challenge_10', name: 'Challenge Accepted', icon: '🎯', description: 'Complete 10 challenge days' },
  { id: 'jury_survivor', name: 'Jury Survivor', icon: '⚖️', description: 'Complete a jury panel defense' },
  { id: 'builder', name: 'Builder', icon: '🛠️', description: 'Create a presentation with AI Builder' },
  { id: 'learner', name: 'Learner', icon: '📚', description: 'Complete a learning path' },
  { id: 'no_fillers', name: 'No Fillers', icon: '🗣️', description: 'Complete speech with 0 filler words' },
  { id: 'eye_contact_pro', name: 'Eye Contact Pro', icon: '👁️', description: 'Maintain >95% posture & camera eye contact' },
  { id: 'Oratii_master', name: 'Oratii Master', icon: '🎖️', description: 'Reach Level 5' }
];

// ——— Challenge Days (Daily Challenge) ———
export const CHALLENGE_DAYS = [
  { day: 1, title: 'Introduce Yourself', description: 'Record a 1-minute self-introduction', xp: 20, type: 'speech' },
  { day: 2, title: 'One Minute Speech', description: 'Speak on any topic for exactly 60 seconds', xp: 20, type: 'speech' },
  { day: 3, title: 'Filler Word Elimination', description: 'Give a 2-minute speech with zero filler words', xp: 25, type: 'speech' },
  { day: 4, title: 'Eye Contact Challenge', description: 'Maintain posture & camera eye contact >90% during video practice', xp: 25, type: 'presentation' },
  { day: 5, title: 'Storytelling', description: 'Tell a personal story in under 3 minutes', xp: 20, type: 'speech' },
  { day: 6, title: 'Elevator Pitch', description: 'Pitch an idea in 30 seconds', xp: 25, type: 'speech' },
  { day: 7, title: 'Impromptu Speech', description: 'Speak on a random topic for 2 minutes', xp: 30, type: 'speech' },
  { day: 8, title: 'Confidence Boost', description: 'Present with power poses and confident body language', xp: 25, type: 'presentation' },
  { day: 9, title: 'Technical Explanation', description: 'Explain a complex concept simply in 3 minutes', xp: 30, type: 'speech' },
  { day: 10, title: 'Slide Design', description: 'Create and analyze a 5-slide presentation', xp: 30, type: 'presentation' },
  { day: 11, title: 'Viva Practice', description: 'Answer 5 viva questions from AI', xp: 25, type: 'viva' },
  { day: 12, title: 'Interview Warmup', description: 'Complete a 5-question HR interview', xp: 30, type: 'interview' },
  { day: 13, title: 'Pace Control', description: 'Maintain 120-140 WPM throughout a speech', xp: 30, type: 'speech' },
  { day: 14, title: 'Persuasive Speech', description: 'Convince the AI of your argument in 3 minutes', xp: 30, type: 'speech' },
  { day: 15, title: 'Panel Defense', description: 'Defend your project to 2 jury members', xp: 35, type: 'jury' },
  { day: 16, title: 'Group Discussion Sim', description: 'Argue for and against a topic', xp: 30, type: 'speech' },
  { day: 17, title: 'Speed Pitch', description: 'Pitch 3 different ideas in 5 minutes', xp: 35, type: 'speech' },
  { day: 18, title: 'Full Presentation', description: 'Give a complete 10-slide presentation', xp: 40, type: 'presentation' },
  { day: 19, title: 'Mock Interview', description: 'Complete a full technical interview round', xp: 40, type: 'interview' },
  { day: 20, title: 'Grand Finale', description: 'Full presentation + viva + jury defense', xp: 50, type: 'mixed' }
];

// â”€â”€â”€ Learning Paths (Module 5) â”€â”€â”€
export const LEARNING_PATHS = [
  {
    id: 'public_speaking',
    name: 'Public Speaking',
    icon: '🎤',
    color: '#6c5ce7',
    milestones: [
      { id: 1, title: 'Introduction Speech', action: 'Complete Challenge Day 1', link: '/challenge' },
      { id: 2, title: 'Eliminate Fillers', action: 'Complete Challenge Day 3', link: '/challenge' },
      { id: 3, title: 'Master Storytelling', action: 'Complete Challenge Day 5', link: '/challenge' },
      { id: 4, title: 'Impromptu Speaking', action: 'Complete Challenge Day 7', link: '/challenge' },
      { id: 5, title: 'Persuasion Skills', action: 'Complete Challenge Day 14', link: '/challenge' },
      { id: 6, title: 'Audience Engagement', action: 'Score 85%+ on speech confidence', link: '/speech-coach' },
      { id: 7, title: 'Voice Modulation', action: 'Maintain optimal pace for 3 minutes', link: '/speech-coach' },
      { id: 8, title: 'Body Language', action: 'Score 90%+ eye contact in presentation', link: '/presentation' },
      { id: 9, title: 'Advanced Delivery', action: 'Complete Challenge Day 18', link: '/challenge' },
      { id: 10, title: 'Public Speaking Pro', action: 'Score 90%+ on 3 consecutive speeches', link: '/speech-coach' }
    ]
  },
  {
    id: 'college_presentations',
    name: 'College Presentations',
    icon: '🎓',
    color: '#00cec9',
    milestones: [
      { id: 1, title: 'Slide Basics', action: 'Analyze your first presentation', link: '/presentation' },
      { id: 2, title: 'Text Density', action: 'Score 80%+ on slide design', link: '/presentation' },
      { id: 3, title: 'Visual Hierarchy', action: 'Create a presentation with AI Builder', link: '/presentation-builder' },
      { id: 4, title: 'Delivery Skills', action: 'Complete a live presentation session', link: '/presentation' },
      { id: 5, title: 'Eye Contact', action: 'Complete Challenge Day 4', link: '/challenge' },
      { id: 6, title: 'Content Depth', action: 'Score 85%+ on content quality', link: '/presentation' },
      { id: 7, title: 'Viva Preparation', action: 'Answer 10 viva questions', link: '/presentation' },
      { id: 8, title: 'Full Defense', action: 'Complete a jury panel session', link: '/jury-panel' }
    ]
  },
  {
    id: 'viva_preparation',
    name: 'Viva Preparation',
    icon: '📋',
    color: '#fd79a8',
    milestones: [
      { id: 1, title: 'Basic Questions', action: 'Answer 5 basic viva questions', link: '/presentation' },
      { id: 2, title: 'Technical Depth', action: 'Answer 5 technical viva questions', link: '/presentation' },
      { id: 3, title: 'Expert Level', action: 'Answer 5 expert viva questions', link: '/presentation' },
      { id: 4, title: 'Confidence Building', action: 'Score 80%+ confidence in viva', link: '/presentation' },
      { id: 5, title: 'Defense Skills', action: 'Complete Challenge Day 11', link: '/challenge' },
      { id: 6, title: 'Panel Practice', action: 'Face 2 jury members', link: '/jury-panel' },
      { id: 7, title: 'Full Panel', action: 'Face 4 jury members', link: '/jury-panel' },
      { id: 8, title: 'Viva Master', action: 'Score 90%+ on 3 consecutive viva sessions', link: '/presentation' }
    ]
  },
  {
    id: 'interview_preparation',
    name: 'Interview Preparation',
    icon: '💼',
    color: '#fdcb6e',
    milestones: [
      { id: 1, title: 'HR Basics', action: 'Complete HR interview round', link: '/interview-simulator' },
      { id: 2, title: 'Self Introduction', action: 'Complete Challenge Day 1', link: '/challenge' },
      { id: 3, title: 'Communication', action: 'Complete Communication interview', link: '/interview-simulator' },
      { id: 4, title: 'Technical Skills', action: 'Complete Technical interview', link: '/interview-simulator' },
      { id: 5, title: 'Product Thinking', action: 'Complete Product interview', link: '/interview-simulator' },
      { id: 6, title: 'Placement Ready', action: 'Complete Placement interview', link: '/interview-simulator' },
      { id: 7, title: 'Body Language', action: 'Score 85%+ eye contact during interview', link: '/interview-simulator' },
      { id: 8, title: 'Confidence Mastery', action: 'Score 90%+ confidence in interviews', link: '/interview-simulator' },
      { id: 9, title: 'Mock Full Round', action: 'Complete Challenge Day 19', link: '/challenge' },
      { id: 10, title: 'Interview Champion', action: 'Complete all 6 categories', link: '/interview-simulator' }
    ]
  },
  {
    id: 'startup_pitching',
    name: 'Startup Pitching',
    icon: '🚀',
    color: '#e17055',
    milestones: [
      { id: 1, title: 'Elevator Pitch', action: 'Complete Challenge Day 6', link: '/challenge' },
      { id: 2, title: 'Problem Statement', action: 'Create pitch deck with AI Builder', link: '/presentation-builder' },
      { id: 3, title: 'Market Analysis', action: 'Complete Startup Founder interview', link: '/interview-simulator' },
      { id: 4, title: 'Pitch Delivery', action: 'Present pitch deck with camera on', link: '/presentation' },
      { id: 5, title: 'Investor Questions', action: 'Face Investor jury member', link: '/jury-panel' },
      { id: 6, title: 'Speed Pitching', action: 'Complete Challenge Day 17', link: '/challenge' },
      { id: 7, title: 'Full Pitch', action: 'Score 85%+ on startup pitch presentation', link: '/presentation' },
      { id: 8, title: 'Pitch Master', action: 'Complete Grand Finale challenge', link: '/challenge' }
    ]
  }
];

// â”€â”€â”€ Score Thresholds â”€â”€â”€
export const SCORE_THRESHOLDS = {
  excellent: 90,
  good: 75,
  average: 60,
  poor: 40
};

export const SCORE_COLORS = {
  excellent: '#00b894',
  good: '#00cec9',
  average: '#fdcb6e',
  poor: '#ff7675'
};

export function getScoreColor(score: number): string {
  if (score >= SCORE_THRESHOLDS.excellent) return SCORE_COLORS.excellent;
  if (score >= SCORE_THRESHOLDS.good) return SCORE_COLORS.good;
  if (score >= SCORE_THRESHOLDS.average) return SCORE_COLORS.average;
  return SCORE_COLORS.poor;
}

export function getScoreLabel(score: number): string {
  if (score >= SCORE_THRESHOLDS.excellent) return 'Excellent';
  if (score >= SCORE_THRESHOLDS.good) return 'Good';
  if (score >= SCORE_THRESHOLDS.average) return 'Average';
  return 'Needs Work';
}

// ——— Standardized Filler Lexicons ———
export const STANDARD_ENGLISH_FILLERS = [
  'um', 'uh', 'ah', 'er', 'mm', 'hmm', 'like', 'basically', 'actually', 'literally'
];

export const HINGLISH_FILLERS = [
  'matlab', 'yani', 'samjhe', 'na', 'bhai', 'arre', 'dekho', 'toh'
];

export const ALL_AUDITED_FILLERS = Array.from(new Set([...STANDARD_ENGLISH_FILLERS, ...HINGLISH_FILLERS]));

/**
 * Deduplicates and counts filler words from speech word tokens.
 * Matches Deepgram's native filler tokens as well as audited English and Hinglish conversational fillers.
 */
export function groupFillerWords(words: any[], topN: number = 6): { word: string; count: number; category: 'english' | 'hinglish' }[] {
  if (!words || !Array.isArray(words)) return [];
  const counts: Record<string, { count: number; category: 'english' | 'hinglish' }> = {};

  words.forEach(w => {
    const cleanWord = (w.word || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!cleanWord) return;

    const isNativeFiller = w.type === 'filler' || w.filler === true;
    const isEnglish = STANDARD_ENGLISH_FILLERS.includes(cleanWord);
    const isHinglish = HINGLISH_FILLERS.includes(cleanWord);

    if (isNativeFiller || isEnglish || isHinglish) {
      const category: 'english' | 'hinglish' = isHinglish ? 'hinglish' : 'english';
      if (!counts[cleanWord]) {
        counts[cleanWord] = { count: 0, category };
      }
      counts[cleanWord].count += 1;
    }
  });

  return Object.entries(counts)
    .map(([word, data]) => ({ word, count: data.count, category: data.category }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

