import { NextRequest, NextResponse } from 'next/server';
import { generateAIContent } from '../../../lib/aiFallback';
import { checkAndDecrementUsage } from '../../../lib/billing';
import { supabase } from '../../../lib/supabaseClient';
import { checkRateLimit, AI_RATE_LIMIT } from '../../../lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.ip || 'unknown';
    const rateResult = await checkRateLimit(`ai:${ip}`, AI_RATE_LIMIT);
    if (!rateResult.allowed) {
      return NextResponse.json({
        error: "Too Many Requests",
        message: `Please wait ${rateResult.retryAfterSeconds} seconds before trying again.`
      }, { status: 429 });
    }

    // Mandatory authentication
    let userId: string | null = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        userId = user.id;
      }
    }

    const body = await request.json();
    const { 
      slideTextContent, 
      timedTranscript, 
      slideEventLog, 
      hasVideo = false, 
      bodyData = null,
      userId: bodyUserId
    } = body;

    if (!userId && bodyUserId) {
      userId = bodyUserId;
    }
    if (!userId) {
      return NextResponse.json({ error: "Authentication required. Please sign in to use Presentation Mode.", authRequired: true }, { status: 401 });
    }

    // Enforce server-side billing limits
    const usageCheck = await checkAndDecrementUsage(userId, 'ppt_analysis_count');
    if (!usageCheck.allowed) {
      return NextResponse.json({
        error: "Credits Exhausted",
        message: "You've used all your credits. Purchase more credits to continue.",
        creditExhausted: true
      }, { status: 403 });
    }

    if (!slideTextContent || !timedTranscript) {
      return NextResponse.json({ error: "Missing slide text content or transcript." }, { status: 400 });
    }

    const systemPrompt = `
      You are an expert executive communication coach and presentation evaluator.
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

    return NextResponse.json({
      status: "success",
      data: parsedAnalysis
    });

  } catch (error: any) {
    console.error("Presentation Mode Analysis Error:", error);
    return NextResponse.json({ 
      error: "Combined analysis failed", 
      details: error.message 
    }, { status: 500 });
  }
}
