import { NextRequest, NextResponse } from 'next/server';
import { generateAIContent } from '../../../lib/aiFallback';
import { getDynamicPrompt } from '../../../lib/getDynamicPrompt';
import { checkAndDecrementUsage } from '../../../lib/billing';
import { withAuthAndRateLimit } from '../../../lib/apiWrapper';
import { supabase } from '../../../lib/supabaseClient';

export const dynamic = 'force-dynamic';

export const POST = withAuthAndRateLimit(async (request, { user, ip }) => {
  let creditConsumed = false;
  let userIdForRefund: string | null = null;
  let idempotencyKey = '';
  try {
    const userId = user.id;
    const body = await request.json();
    const { 
      slideTextContent, 
      timedTranscript, 
      slideEventLog, 
      hasVideo = false, 
      bodyData = null
    } = body;

    // Validate payload size to prevent resource exhaustion
    const maxTextLength = 250000; // ~50k words max
    if (JSON.stringify(slideTextContent || []).length > maxTextLength || 
        (timedTranscript && timedTranscript.length > maxTextLength)) {
      return NextResponse.json({ error: "Payload exceeds maximum allowed length" }, { status: 413 });
    }

    const crypto = await import('crypto');
    const promptVersion = 'v1_presentation_mode';
    const hashString = `${JSON.stringify(slideTextContent || [])}|${timedTranscript || ''}|${hasVideo}|${promptVersion}`;
    const fileHash = crypto.createHash('sha256').update(hashString).digest('hex');
    idempotencyKey = `presentation-mode:${userId}:${fileHash}`;
    
    const { acquireLock, releaseLock, checkCache, setCache } = await import('../../../lib/idempotency');
    
    const fastCache = await checkCache<any>(`cache:${idempotencyKey}`);
    if (fastCache) return NextResponse.json(fastCache);

    const isLocked = await acquireLock(idempotencyKey);
    if (!isLocked) {
      return NextResponse.json({ error: "Request is already processing. Please wait a moment." }, { status: 429 });
    }

    const redisCache = await checkCache<any>(`cache:${idempotencyKey}`);
    if (redisCache) {
      await releaseLock(idempotencyKey);
      return NextResponse.json(redisCache);
    }

    // Enforce server-side billing limits
    const usageCheck = await checkAndDecrementUsage(userId, 'ppt_analysis_count');
    if (!usageCheck.allowed) {
      await releaseLock(idempotencyKey);
      return NextResponse.json({
        error: "Credits Exhausted",
        message: "You've used all your credits. Purchase more credits to continue.",
        creditExhausted: true
      }, { status: 403 });
    }
    creditConsumed = true;
    userIdForRefund = userId;

    if (!slideTextContent || !timedTranscript) {
      return NextResponse.json({ error: "Missing slide text content or transcript." }, { status: 400 });
    }

    const baseAdminPrompt = await getDynamicPrompt('presentation_mode', 'You are an expert executive communication coach and presentation evaluator.');

    const systemPrompt = `
      ${baseAdminPrompt}
      You are evaluating a live practice presentation where the user spoke while presenting a slide deck.

      INPUT DATA PROVIDED:
      1. Slide Deck Content (extracted text for each slide)
      2. Timed Speech Transcript (spoken words mapped to time markers)
      3. Slide Event Log (mappings of which slide was visible during which elapsed timeframe)
      4. Recording Mode Flag: hasVideo (${hasVideo ? 'true - Video Mode enabled' : 'false - Audio-only Mode enabled'})
      ${hasVideo ? '5. Visual Frame Data (webcam snapshot analysis for posture and eye contact)' : '5. Visual Frame Data: NONE (Audio-only mode — DO NOT evaluate camera posture or eye contact)'}

      YOUR EVALUATION TASKS:

      1. SLIDE-BY-SLIDE CONTENT COVERAGE ANALYSIS:
         - Cross-reference what was shown on each slide with what the presenter actually said during that slide's on-screen timeframe.
         - Identify "Missed Key Points": Critical bullet points/data on the slide that the speaker failed to mention.
         - Identify "Unsupported Claims / Verbal Additions": Verbal assertions made that are absent from or contradict the slide content.
         - Evaluate timing alignment (did they spend too much/too little time on key slides?).

      2. DELIVERY SCORING (Pacing, Fillers & Confidence):
         - Evaluate speech pacing (WPM), filler word rate, vocal confidence, and overall delivery flow.

      3. VISUAL BODY LANGUAGE & EYE CONTACT (Conditional on hasVideo):
         ${hasVideo 
           ? '- Score camera eye contact and body posture (0-100) based on visual frame snapshots.' 
           : '- CRITICAL: Do NOT evaluate or return body language / eye contact scores or keys. Omit all visual keys from the JSON output completely (do NOT return zeros or N/A).'}

      4. ONE COMBINED PRESENTATION READINESS SCORE (0-100):
         - Calculate ONE unified Overall Readiness Score (0-100) weighting Content Coverage (40%), Delivery & Pacing (40%), ${hasVideo ? 'and Visual Body Language (20%).' : 'and Structure/Flow (20%).'}

      Respond STRICTLY in valid JSON format:
      {
        "readinessScore": 82,
        "contentCoverageScore": 85,
        "deliveryScore": 78,
        ${hasVideo ? '"eyeContactScore": 80,\n  "postureScore": 84,' : ''}
        "summaryFeedback": "Overall strong presentation! You explained Slide 1 and 2 clearly, but rushed through Slide 4 without mentioning the key performance metrics listed on-screen.",
        "slideBySlideCoverage": [
          {
            "slideNumber": 1,
            "onScreenTime": "00:00 - 00:45",
            "coverageScore": 90,
            "keyPointsCovered": ["Stated primary problem statement", "Introduced team members"],
            "missedPoints": [],
            "unsupportedClaims": [],
            "coachingTip": "Great pace and clear introduction on Slide 1."
          }
        ],
        "deliveryAnalysis": {
          "pacingFeedback": "Average WPM was 142 (optimal range: 130-160 WPM).",
          "fillerWordFeedback": "Used 4 filler words ('um', 'like').",
          "strengths": ["Clear vocal tone", "Strong opening on Slide 1"],
          "weaknesses": ["Rushed Slide 4"]
        }
        ${hasVideo ? ',\n  "visualBodyLanguageAnalysis": {\n    "feedback": "Maintained steady posture and good eye contact with the lens.",\n    "strengths": ["Looking at camera 80%+ of time"],\n    "weaknesses": ["Slight leaning to left in frame 3"]\n  }' : ''}
      }
    `;

    const userPrompt = `
      Slide Deck Content:
      ${JSON.stringify(slideTextContent, null, 2)}

      Timed Transcript:
      ${timedTranscript}

      Slide Event Log:
      ${JSON.stringify(slideEventLog || [], null, 2)}

      ${hasVideo && bodyData ? `Visual Body Language Snapshot Data:\n${JSON.stringify(bodyData, null, 2)}` : ''}
    `;

    const aiTextResponse = await generateAIContent({
      systemPrompt,
      userPrompt
    });

    const jsonMatch = aiTextResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in AI response");
    }

    const parsedAnalysis = JSON.parse(jsonMatch[0]);

    const responseData = {
      status: "success",
      data: parsedAnalysis
    };
    
    try {
      await setCache(`cache:${idempotencyKey}`, responseData, 86400);
    } catch(e) {}

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Presentation Mode Analysis Error:', error);
    if (creditConsumed && userIdForRefund) {
      console.warn(`[AnalyzePresentation] AI failed. Refunding credit for ${userIdForRefund}`);
      const { refundUsage } = await import('../../../lib/billing');
      await refundUsage(userIdForRefund, 1);
    }
    return NextResponse.json(
      { error: 'Failed to analyze presentation', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  } finally {
    if (idempotencyKey) {
      const { releaseLock } = await import('../../../lib/idempotency');
      await releaseLock(idempotencyKey);
    }
  }
});
