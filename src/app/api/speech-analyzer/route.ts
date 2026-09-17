// src/app/api/speech-analyzer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { fetchWithRetry } from '../../../lib/fetchWithRetry';
import { STANDARD_ENGLISH_FILLERS, HINGLISH_FILLERS, groupFillerWords } from '../../../lib/constants';
import { generateAuditedSpeechRubric } from '../../../lib/scoringRubric';
import { hasUsedTrial, setTrialUsed, isUserLoggedIn } from '../../../lib/trialManager';
import { checkRateLimit, AI_RATE_LIMIT } from '../../../lib/rateLimit';
import { checkAndDecrementUsage } from '../../../lib/billing';
import { supabase } from '../../../lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  let creditConsumed = false;
  let userIdForRefund: string | null = null;
  let isAnonymousTrial = false;

  try {
    // Rate limiting (by IP)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.ip || 'unknown';
    const rateResult = await checkRateLimit(`ai:${ip}`, AI_RATE_LIMIT);
    if (!rateResult.allowed) {
      return NextResponse.json({
        error: "Too Many Requests",
        message: `You're sending requests too quickly. Please wait ${rateResult.retryAfterSeconds} seconds before trying again.`
      }, { status: 429 });
    }

    // Authentication check — Speech Coach allows 2 anonymous sessions
    let userId: string | null = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      try {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) userId = user.id;
      } catch (e) {
        // Token decode failure — treat as anonymous
      }
    }

    // Receive raw audio blob from frontend
    const formData = await request.formData();
    const audioFile = formData.get('audio') as Blob | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio data received!" }, { status: 400 });
    }

    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Speech analysis service is temporarily unavailable. Please try again later." }, { status: 503 });
    }
    const reqLanguage = (formData.get('language') as string) || 'en-US';
    
    // Deepgram API URL using the specified language
    const deepgramUrl = `https://api.deepgram.com/v1/listen?model=nova-2&smart_formatting=true&filler_words=true&language=${reqLanguage}`;

    // Convert audio file to buffer for Deepgram API
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ── Idempotency Check ──
    const crypto = await import('crypto');
    const { acquireLock, releaseLock, checkCache, setCache } = await import('../../../lib/idempotency');
    const promptVersion = 'v1_speech_analyzer';
    const hashString = `${buffer.toString('base64')}|${reqLanguage}|${promptVersion}`;
    const fileHash = crypto.createHash('sha256').update(hashString).digest('hex');
    const idempotencyKey = `speech-analyzer:${userId || 'anon'}:${fileHash}`;
    
    // 1. Read-only fast cache check
    const fastCache = await checkCache<any>(`cache:${idempotencyKey}`);
    if (fastCache) {
      return NextResponse.json(fastCache);
    }

    const isLocked = await acquireLock(idempotencyKey);
    if (!isLocked) {
      return NextResponse.json({ error: "Request is already processing. Please wait a moment." }, { status: 429 });
    }

    try {
      // 2. Double-checked locking
      const redisCache = await checkCache<any>(`cache:${idempotencyKey}`);
      if (redisCache) {
        await releaseLock(idempotencyKey);
        return NextResponse.json(redisCache);
      }

      // 3. Billing & Trial deduction
      if (userId) {
        const usageCheck = await checkAndDecrementUsage(userId, 'speech_analysis_count');
        if (!usageCheck.allowed) {
          await releaseLock(idempotencyKey);
          return NextResponse.json({
            error: "Credits Exhausted",
            message: "You've used all your credits. Purchase more credits to continue using Speech Coach.",
            creditExhausted: true
          }, { status: 403 });
        }
        userIdForRefund = userId;
        creditConsumed = true;
      } else {
        if (await hasUsedTrial(request)) {
          await releaseLock(idempotencyKey);
          return NextResponse.json({
            error: "Free Trial Ended",
            message: "You've used your 2 free Speech Coach sessions! Sign up for a free account to get 20 more credits.",
            trialExpired: true
          }, { status: 401 });
        }
        isAnonymousTrial = true;
      }

    // Send to Deepgram REST API with retry
    const response = await fetchWithRetry(deepgramUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': audioFile.type || 'audio/wav',
      },
      body: buffer
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Deepgram API failed: ${errorData}`);
    }

    const data = await response.json();
    
    // Extract transcript
    const transcript = data.results?.channels[0]?.alternatives[0]?.transcript || "";
    
    // Extract words array containing filler word details
    const words = data.results?.channels[0]?.alternatives[0]?.words || [];
    const totalDuration = data.metadata?.duration || 1;

    // Deduplicated filler detection (prevents counting 'um'/'uh' twice)
    let englishFillerCount = 0;
    let hinglishFillerCount = 0;

    words.forEach(w => {
      const cleanWord = (w.word || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!cleanWord) return;

      const isNative = w.type === 'filler' || w.filler === true || STANDARD_ENGLISH_FILLERS.includes(cleanWord);
      const isHinglish = HINGLISH_FILLERS.includes(cleanWord);

      if (isNative) {
        englishFillerCount++;
      } else if (isHinglish) {
        hinglishFillerCount++;
      }
    });

    const totalFillers = englishFillerCount + hinglishFillerCount;
    const wpm = totalDuration > 0 ? Math.round((words.length / totalDuration) * 60) : 0;

    // Quality Guardrail Check
    const isSampleTooShort = totalDuration < 5 || words.length < 10;
    const guardrailWarning = isSampleTooShort 
      ? `Sample is too brief (${words.length} words, ${Math.round(totalDuration)}s). For an official benchmark, speak for at least 20-30 seconds.`
      : null;

    let timedTranscript = "";
    let currentSentence = "";
    let sentenceStart = words.length > 0 ? words[0].start : 0;

    words.forEach((w, index) => {
      currentSentence += (w.punctuated_word || w.word) + " ";
      if ((w.punctuated_word && w.punctuated_word.match(/[.!?]/)) || index === words.length - 1 || currentSentence.split(' ').length > 15) {
        timedTranscript += `[${sentenceStart.toFixed(1)}s]: ${currentSentence.trim()}\n`;
        currentSentence = "";
        if (index < words.length - 1) {
          sentenceStart = words[index + 1].start;
        }
      }
    });

    // Calculate per-segment WPM for pace graph (5-second windows)
    const segmentDuration = 5; // seconds per segment
    const paceData: { time: number; wpm: number; wordCount: number }[] = [];
    
    if (words.length > 0) {
      const numSegments = Math.ceil(totalDuration / segmentDuration);
      for (let i = 0; i < numSegments; i++) {
        const segStart = i * segmentDuration;
        const segEnd = (i + 1) * segmentDuration;
        const segWords = words.filter((w: any) => w.start >= segStart && w.start < segEnd);
        const segWordCount = segWords.length;
        const actualSegDuration = Math.min(segmentDuration, totalDuration - segStart);
        const segWpm = actualSegDuration > 0 ? Math.round((segWordCount / actualSegDuration) * 60) : 0;
        paceData.push({
          time: segStart + actualSegDuration / 2, // midpoint of segment
          wpm: segWpm,
          wordCount: segWordCount
        });
      }
    }

    // Generate Standardized Academic Rubric
    const auditedRubric = generateAuditedSpeechRubric(wpm, totalFillers, totalDuration, transcript);
    const topFillers = groupFillerWords(words);

    // After a successful analysis, mark trial as used (only affects anonymous users)
    if (isAnonymousTrial) {
      await setTrialUsed(request);
    }

    const responseData = {
      status: "success",
      transcript: transcript,
      words: words,
      analysis: {
        totalWords: words.length,
        nativeFillerCount: englishFillerCount,
        hinglishFillerCount: hinglishFillerCount,
        totalFillers: totalFillers,
        topFillers: topFillers,
        wpm: wpm,
        paceData: paceData,
        duration: totalDuration,
        timedTranscript: timedTranscript,
        tone: null,
        isSampleTooShort: isSampleTooShort,
        guardrailWarning: guardrailWarning,
        rubric: auditedRubric
      }
    };

    // Cache the result for 24 hours
    try {
      await setCache(`cache:${idempotencyKey}`, responseData, 86400);
    } catch(e) {}

    return NextResponse.json(responseData);
    
    } finally {
      await releaseLock(idempotencyKey);
    }

  } catch (error: any) {
    console.error("Speech Analyzer Error:", error);
    if (creditConsumed && userIdForRefund) {
      console.warn(`[SpeechAnalyzer] AI completely failed after deduction. Initiating atomic refund for ${userIdForRefund}...`);
      const { refundUsage } = await import('../../../lib/billing');
      await refundUsage(userIdForRefund, 1);
    }
    return NextResponse.json({ error: "Speech analysis failed. Please try again.", details: error?.message || 'Unknown error' }, { status: 500 });
  }
}
