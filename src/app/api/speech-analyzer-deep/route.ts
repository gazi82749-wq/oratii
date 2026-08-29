import { NextResponse } from 'next/server';
import { generateAIContent } from '../../../lib/aiFallback';
import { checkAndDecrementUsage } from '../../../lib/billing';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const userId = (request.headers.get('x-user-id') || formData.get('userId')) as string | null;
    const wpm = formData.get('wpm') || '0';
    const totalFillers = formData.get('totalFillers') || '0';
    const timedTranscript = formData.get('timedTranscript');
    const situation = formData.get('situation') || 'a general presentation';

    if (!timedTranscript) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (userId) {
      const usageCheck = await checkAndDecrementUsage(userId, 'speech_analysis_count');
      if (!usageCheck.allowed) {
        return NextResponse.json({
          error: "Limit Exceeded",
          message: "You have reached your monthly limit for Speech Analyses. Please upgrade your plan."
        }, { status: 403 });
      }
    }

    const tonePrompt = `
      You are a direct, no-nonsense speech coach. You analyze real speech data and give brutally honest scores. You NEVER give generic or default scores.

      CONTEXT: The student was speaking for "${situation}".
      
      MEASURED STATS:
      - Words per minute: ${wpm}
      - Total filler words: ${totalFillers}
      - Fillers per minute: ${(Number(totalFillers) / (Number(wpm) > 0 ? (Number(wpm) / 130) : 1)).toFixed(1)}
      
      SCORING RULES â€” YOU MUST FOLLOW THIS FORMULA:
      Start at 100 and subtract:
      - WPM penalty: If WPM is outside 120-160 range, subtract 1 point per 5 WPM deviation. If outside 100-180, subtract 2 points per 5 WPM deviation beyond that.
      - Filler penalty: Subtract 3 points per filler word (fillers destroy credibility).
      - If transcript shows repetition/rambling, subtract 5-15 points.
      - If structure is clear (intro/body/conclusion visible), ADD 5 points.
      - Minimum score is 15, maximum is 98.
      
      CRITICAL: Do NOT default to 65-75 range. A speech with 0 fillers and perfect pacing should score 90+. A speech with 10+ fillers should score below 50. CALCULATE HONESTLY based on the formula above.

      RESPONSE FORMAT RULES:
      1. Address the speaker as "you". Be warm but honest.
      2. Hinglish (Hindi+English mix) is fine â€” don't penalize language mixing.
      3. EVERY strength/weakness/suggestion MUST start with a timestamp in format [M:SS]. Reference the EXACT timestamp from the transcript.
      4. Give 2-4 strengths, 2-4 weaknesses, and 2-4 actionable suggestions.
      5. Suggestions must be specific actions they can do TODAY, not vague advice.
      6. For timeMarkers, use REAL timestamps from the transcript data.
      
      Respond in valid JSON:
      {
        "tone": "One or two word tone label (e.g. Confident, Nervous, Monotone, Energetic, Hesitant, Rushed, Calm & Clear)",
        "toneScore": <number 15-98 calculated from formula above>,
        "feedback": "2-3 sentence overall coaching feedback referencing specific moments from the transcript",
        "strengths": [
          "[0:05] Your opening was clear and confident â€” you stated the topic immediately",
          "[0:22] Good use of examples to support your argument"
        ],
        "weaknesses": [
          "[0:15] You said 'um' and 'basically' back-to-back 3 times here â€” lost momentum",
          "[0:35] Pacing sped up significantly â€” felt rushed through your main point"
        ],
        "suggestions": [
          "[0:15] Replace the 'um basically' habit with a 2-second silent pause â€” silence sounds more confident than fillers",
          "[0:35] Practice the middle section separately at half speed, then gradually increase"
        ],
        "timeMarkers": [
          { "time": 5.0, "type": "strength", "feedback": "Clear confident opening â€” got straight to the point" },
          { "time": 15.0, "type": "weakness", "feedback": "Triple filler words here â€” pause instead of saying 'um basically'" },
          { "time": 35.0, "type": "suggestion", "feedback": "You rushed your key takeaway â€” slow down and let it land" }
        ]
      }
    `;


    // 4-Stage AI Fallback Waterfall (Cerebras -> Groq -> Gemini -> OpenRouter)
    const toneText = await generateAIContent({
      systemPrompt: tonePrompt,
      userPrompt: `Timed Transcript:\n${timedTranscript}`
    });

    const jsonMatch = toneText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in AI response");
    }
    const toneAnalysis = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      status: "success",
      tone: toneAnalysis
    });

  } catch (error: any) {
    console.error("Deep Tone Analysis Error:", error);
    return NextResponse.json({ 
      error: "Tone analysis failed", 
      details: error.message 
    }, { status: 500 });
  }
}
