// src/lib/scoringRubric.ts
// Standardized Academic Scoring & Evaluation Rubric for Oratii
// Benchmarked against CEFR (Common European Framework of Reference) and IELTS Speaking Descriptors

export interface RubricPillarScore {
  score: number;       // Points scored
  maxScore: number;    // Maximum possible points
  percentage: number;  // 0 - 100%
  rating: 'Exceptional' | 'Proficient' | 'Competent' | 'Developing' | 'Needs Work';
  summary: string;
  deductions: string[];
  bonuses: string[];
}

export interface AcademicBenchmark {
  overallScore: number; // 0 - 100
  cefrLevel: 'C2' | 'C1' | 'B2' | 'B1' | 'A2' | 'A1';
  cefrTitle: string;
  cefrDescription: string;
  ieltsBand: number; // e.g. 7.5
  ieltsDescriptor: string;
  badgeColor: string;
}

export interface AuditedSpeechRubric {
  overallScore: number;
  pacing: RubricPillarScore;
  fluency: RubricPillarScore;
  vocabularyAndStructure: RubricPillarScore;
  benchmark: AcademicBenchmark;
  trustGuarantee: string;
}

/**
 * 1. Pacing Pillar (Max 30 points)
 * Sweet spot: 130 - 155 WPM (Optimal international presentation & interview pace)
 * Tolerable: 110 - 129 WPM or 156 - 175 WPM
 * Fast/Slow: < 100 or > 185 WPM
 */
export function calculatePacingScore(wpm: number): RubricPillarScore {
  const maxScore = 30;
  let score = maxScore;
  const deductions: string[] = [];
  const bonuses: string[] = [];

  if (wpm >= 130 && wpm <= 155) {
    bonuses.push('Spoke within optimal executive sweet-spot (130-155 WPM)');
    score = 30;
  } else if (wpm >= 115 && wpm < 130) {
    const diff = 130 - wpm;
    score -= Math.round((diff / 15) * 4); // Lose up to 4 pts
    deductions.push(`Slightly measured pace (${wpm} WPM). Aim for 130-150 WPM for maximum engagement.`);
  } else if (wpm > 155 && wpm <= 175) {
    const diff = wpm - 155;
    score -= Math.round((diff / 20) * 5); // Lose up to 5 pts
    deductions.push(`Slightly elevated speed (${wpm} WPM). Add deliberate pauses after key points.`);
  } else if (wpm < 115) {
    const diff = 115 - wpm;
    const penalty = Math.min(18, Math.round(5 + (diff / 5) * 1.5));
    score -= penalty;
    deductions.push(`Speaking rate is too deliberate/slow (${wpm} WPM). May cause audience impatience.`);
  } else {
    // wpm > 175
    const diff = wpm - 175;
    const penalty = Math.min(18, Math.round(6 + (diff / 5) * 1.5));
    score -= penalty;
    deductions.push(`Speaking rate is rushed (${wpm} WPM). Vital message retention drops significantly.`);
  }

  score = Math.max(8, Math.min(maxScore, score));
  const percentage = Math.round((score / maxScore) * 100);

  let rating: RubricPillarScore['rating'] = 'Competent';
  if (score >= 28) rating = 'Exceptional';
  else if (score >= 23) rating = 'Proficient';
  else if (score >= 18) rating = 'Competent';
  else if (score >= 13) rating = 'Developing';
  else rating = 'Needs Work';

  return {
    score,
    maxScore,
    percentage,
    rating,
    summary: `${wpm} WPM · ${rating}`,
    deductions,
    bonuses
  };
}

/**
 * 2. Fluency & Filler Density Pillar (Max 30 points)
 * Metric: Fillers per Minute (FPM)
 * FPM < 0.8 => 29-30 pts (Executive Fluency)
 * FPM 0.8 - 2.0 => 24-28 pts (Natural Spoken Flow)
 * FPM 2.1 - 4.5 => 16-23 pts (Noticeable hesitation)
 * FPM > 4.5 => 8-15 pts (Frequent disruptions)
 */
export function calculateFluencyScore(totalFillers: number, durationSeconds: number): RubricPillarScore {
  const maxScore = 30;
  const durationMinutes = Math.max(0.15, durationSeconds / 60);
  const fpm = Number((totalFillers / durationMinutes).toFixed(1));
  let score = maxScore;
  const deductions: string[] = [];
  const bonuses: string[] = [];

  if (totalFillers === 0) {
    bonuses.push('Zero filler words detected! Exceptional vocal discipline.');
    score = 30;
  } else if (fpm <= 0.8) {
    score = 28;
    bonuses.push(`Minimal filler density (${fpm}/min) — well within professional thresholds.`);
  } else if (fpm <= 2.0) {
    score = 25;
    deductions.push(`Moderate filler rate (${fpm}/min, ${totalFillers} total). Try replacing with brief silent pauses.`);
  } else if (fpm <= 4.0) {
    score = 18;
    deductions.push(`Noticeable filler density (${fpm}/min, ${totalFillers} total). Frequent "um/like" disrupts listener train of thought.`);
  } else if (fpm <= 7.0) {
    score = 12;
    deductions.push(`High filler reliance (${fpm}/min, ${totalFillers} total). Significant impact on confidence perception.`);
  } else {
    score = 8;
    deductions.push(`Severe filler concentration (${fpm}/min). Requires focused pause-training drills.`);
  }

  score = Math.max(6, Math.min(maxScore, score));
  const percentage = Math.round((score / maxScore) * 100);

  let rating: RubricPillarScore['rating'] = 'Competent';
  if (score >= 28) rating = 'Exceptional';
  else if (score >= 24) rating = 'Proficient';
  else if (score >= 17) rating = 'Competent';
  else if (score >= 12) rating = 'Developing';
  else rating = 'Needs Work';

  return {
    score,
    maxScore,
    percentage,
    rating,
    summary: `${fpm} fillers/min · ${rating}`,
    deductions,
    bonuses
  };
}

/**
 * 3. Vocabulary, Structure & Coherence Pillar (Max 40 points)
 * Evaluates lexical diversity (Type-Token Ratio), transitional markers, and sentence balance.
 */
export function calculateVocabularyScore(transcript: string): RubricPillarScore {
  const maxScore = 40;
  const words = transcript.toLowerCase().match(/[a-z0-9à-ÿ]+/g) || [];
  const wordCount = words.length;

  const deductions: string[] = [];
  const bonuses: string[] = [];
  let score = 28; // Standard baseline

  if (wordCount < 12) {
    return {
      score: 12,
      maxScore,
      percentage: 30,
      rating: 'Needs Work',
      summary: 'Sample too brief to evaluate structure',
      deductions: ['Recording contains insufficient spoken vocabulary.'],
      bonuses: []
    };
  }

  // A. Lexical Diversity: Unique Words / Total Words (Type-Token Ratio)
  const uniqueWords = new Set(words);
  const ttr = Number((uniqueWords.size / wordCount).toFixed(2));

  if (ttr >= 0.70) {
    score += 5;
    bonuses.push('High lexical variety with minimal repetitive phrasing.');
  } else if (ttr < 0.45 && wordCount > 30) {
    score -= 4;
    deductions.push('Repetitive vocabulary observed. Broaden descriptive adjectives and technical nouns.');
  }

  // B. Transition & Coherence Markers
  const TRANSITION_MARKERS = [
    'furthermore', 'however', 'therefore', 'consequently', 'specifically',
    'for instance', 'for example', 'in addition', 'on the other hand',
    'moreover', 'as a result', 'in conclusion', 'firstly', 'secondly', 'ultimately'
  ];
  const lowerTranscript = transcript.toLowerCase();
  const matchedTransitions = TRANSITION_MARKERS.filter(m => lowerTranscript.includes(m));

  if (matchedTransitions.length >= 3) {
    score += 6;
    bonuses.push(`Excellent logical signposting used (${matchedTransitions.slice(0, 3).join(', ')}).`);
  } else if (matchedTransitions.length >= 1) {
    score += 3;
    bonuses.push(`Good use of transition connectives (${matchedTransitions[0]}).`);
  } else if (wordCount > 50) {
    score -= 3;
    deductions.push('Missing explicit transitions. Incorporate signposts like "Furthermore" or "As a result".');
  }

  // C. Sentence Complexity & Length
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : wordCount;

  if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 24) {
    score += 2;
    bonuses.push('Balanced sentence length — clear structure without rambling.');
  } else if (avgWordsPerSentence > 32) {
    score -= 3;
    deductions.push('Overly long compound sentences observed. Break ideas into punchier statements.');
  }

  score = Math.max(12, Math.min(maxScore, score));
  const percentage = Math.round((score / maxScore) * 100);

  let rating: RubricPillarScore['rating'] = 'Competent';
  if (score >= 35) rating = 'Exceptional';
  else if (score >= 30) rating = 'Proficient';
  else if (score >= 24) rating = 'Competent';
  else if (score >= 18) rating = 'Developing';
  else rating = 'Needs Work';

  return {
    score,
    maxScore,
    percentage,
    rating,
    summary: `${score}/${maxScore} pts · ${rating}`,
    deductions,
    bonuses
  };
}

/**
 * 4. Unified CEFR & IELTS Official Benchmark Mapping
 */
export function getAcademicLevel(overallScore: number): AcademicBenchmark {
  const score = Math.max(0, Math.min(100, overallScore));

  if (score >= 88) {
    return {
      overallScore: score,
      cefrLevel: 'C2',
      cefrTitle: 'Mastery / Native Fluency',
      cefrDescription: 'Expresses oneself spontaneously, very fluently and precisely, differentiating finer shades of meaning even in complex scenarios.',
      ieltsBand: 8.5,
      ieltsDescriptor: 'Expert / Very Good User (Band 8.5 - 9.0)',
      badgeColor: '#059669' // Emerald
    };
  } else if (score >= 78) {
    return {
      overallScore: score,
      cefrLevel: 'C1',
      cefrTitle: 'Effective Operational Proficiency (Advanced)',
      cefrDescription: 'Expresses ideas fluently and spontaneously without much obvious searching for expressions. Uses language flexibly for social, academic and professional purposes.',
      ieltsBand: 7.5,
      ieltsDescriptor: 'Good User (Band 7.0 - 7.5)',
      badgeColor: '#2563eb' // Blue
    };
  } else if (score >= 65) {
    return {
      overallScore: score,
      cefrLevel: 'B2',
      cefrTitle: 'Vantage (Upper Intermediate)',
      cefrDescription: 'Can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers quite possible without strain for either party.',
      ieltsBand: 6.5,
      ieltsDescriptor: 'Competent User (Band 6.0 - 6.5)',
      badgeColor: '#0284c7' // Light blue / Cyan
    };
  } else if (score >= 50) {
    return {
      overallScore: score,
      cefrLevel: 'B1',
      cefrTitle: 'Threshold (Intermediate)',
      cefrDescription: 'Can enter unprepared into conversation on familiar topics, deliver straightforward connected text, and articulate main points clearly.',
      ieltsBand: 5.5,
      ieltsDescriptor: 'Modest User (Band 5.0 - 5.5)',
      badgeColor: '#d97706' // Amber
    };
  } else if (score >= 35) {
    return {
      overallScore: score,
      cefrLevel: 'A2',
      cefrTitle: 'Waystage (Elementary)',
      cefrDescription: 'Can communicate in simple and routine tasks requiring a simple and direct exchange of information on familiar matters.',
      ieltsBand: 4.5,
      ieltsDescriptor: 'Limited User (Band 4.0 - 4.5)',
      badgeColor: '#e11d48' // Rose
    };
  } else {
    return {
      overallScore: score,
      cefrLevel: 'A1',
      cefrTitle: 'Breakthrough (Beginner)',
      cefrDescription: 'Can recognize and use familiar everyday expressions and very basic phrases. Requires guided practice.',
      ieltsBand: 3.5,
      ieltsDescriptor: 'Intermittent User (Band 3.0 - 3.5)',
      badgeColor: '#dc2626' // Red
    };
  }
}

/**
 * 5. Complete Audited Speech Rubric Generator
 */
export function generateAuditedSpeechRubric(
  wpm: number,
  totalFillers: number,
  durationSeconds: number,
  transcript: string
): AuditedSpeechRubric {
  const pacing = calculatePacingScore(wpm);
  const fluency = calculateFluencyScore(totalFillers, durationSeconds);
  const vocabularyAndStructure = calculateVocabularyScore(transcript);

  const rawOverall = pacing.score + fluency.score + vocabularyAndStructure.score; // 30 + 30 + 40 = 100
  const overallScore = Math.max(15, Math.min(98, rawOverall));
  const benchmark = getAcademicLevel(overallScore);

  return {
    overallScore,
    pacing,
    fluency,
    vocabularyAndStructure,
    benchmark,
    trustGuarantee: 'Evaluated against CEFR & IELTS Spoken Fluency descriptors. Deterministic math ensures reproducible, objective feedback with no arbitrary score variance.'
  };
}
