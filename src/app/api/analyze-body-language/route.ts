import { NextRequest, NextResponse } from 'next/server';
import { fetchWithRetry } from '../../../lib/fetchWithRetry';
import { generateAIContent } from '../../../lib/aiFallback';
import { checkRateLimit, AI_RATE_LIMIT } from '../../../lib/rateLimit';
import { supabase } from '../../../lib/supabaseClient';

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
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Authentication required. Please sign in to use body language analysis.", authRequired: true }, { status: 401 });
    }
    const { data: { user } } = await supabase.auth.getUser(authHeader.substring(7).trim());
    if (!user) {
      return NextResponse.json({ error: "Invalid or expired session. Please sign in again.", authRequired: true }, { status: 401 });
    }

    const { frames } = await request.json();

    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return NextResponse.json({ error: "No video frames provided!" }, { status: 400 });
    }

    const systemPrompt = `
      You are a friendly body language coach — like a senior student who's been through dozens of presentations and knows what good stage presence looks like. You're looking at snapshots from a student's presentation video.

      YOUR COACHING RULES:
      1. Talk to them directly — say "you", not "the presenter". Be warm and encouraging but honest.
      2. Be SPECIFIC about what you see. Don't say "posture needs improvement" — say "You're leaning to one side in most of these frames — stand straight with equal weight on both feet, it makes you look way more confident."
      3. Point out the good stuff too! If they're making eye contact, tell them: "You're looking straight at the camera in most frames — that's great, it feels like you're actually talking to your audience."
      4. Suggestions should be things they can practice RIGHT NOW:
         - "Hold your hands at waist level when you're not gesturing — it looks way more natural than keeping them at your sides"
         - "Try smiling slightly when you start a new point — it makes you look relaxed and in control"
      5. Score honestly (0-100). Most students are 60-80. Only give 90+ if they genuinely have excellent presence.

      Return your analysis STRICTLY in valid JSON format:
      {
        "postureScore": 72,
        "eyeContactScore": 80,
        "confidenceScore": 75,
        "bodyLanguageFeedback": "You've got good eye contact — you're looking at the camera most of the time which is great. But you're standing a bit stiff with your hands at your sides. Try holding them at waist level and using natural gestures when making a point.",
        "visualStrengths": [
          "You're making consistent eye contact with the camera — that's one of the hardest things to do and you're nailing it",
          "You look calm and composed — no fidgeting or nervous movements, which makes you look confident"
        ],
        "visualWeaknesses": [
          "Your hands are hidden or stuck at your sides in most frames — it makes you look a bit stiff and nervous even though you're not",
          "You're leaning slightly to the left — try standing with equal weight on both feet"
        ],
        "visualSuggestions": [
          "Keep your hands visible at waist level and use them to emphasize key points — even small gestures make a big difference",
          "Try standing with your feet shoulder-width apart — it gives you a more stable, confident look on camera"
        ]
      }
    `;

    // Limit to max 4 evenly spaced frames to ensure ultra-fast processing
    const maxFrames = 4;
    const step = Math.max(1, Math.floor(frames.length / maxFrames));
    const selectedFrames = [];
    for (let i = 0; i < frames.length && selectedFrames.length < maxFrames; i += step) {
      selectedFrames.push(frames[i]);
    }

    // 4-Stage AI Fallback Waterfall (Cerebras -> Groq -> Gemini -> OpenRouter)
    const aiTextResponse = await generateAIContent({
      systemPrompt,
      userPrompt: "Analyze these visual presentation frames for body language, eye contact, and posture.",
      images: selectedFrames
    });
    
    // Robust JSON extraction
    const cleanJsonString = aiTextResponse.replace(/```json|```/g, '').trim();
    const jsonMatch = cleanJsonString.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI returned invalid JSON structure");
    }
    const parsedAnalysis = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ 
      status: "success", 
      data: parsedAnalysis 
    });

  } catch (error: any) {
    console.error("Body Language Analysis Error:", error);
    return NextResponse.json({ error: "Analysis failed", details: error.message }, { status: 500 });
  }
}
