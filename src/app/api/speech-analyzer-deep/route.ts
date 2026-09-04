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
    const reqLanguage = (formData.get('language') as string) || 'en-US';
    const isHindi = reqLanguage.toLowerCase().startsWith('hi');

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

    const numWpm = Number(wpm) || 0;
    const numFillers = Number(totalFillers) || 0;

    const tonePrompt = `
      You are an accredited Senior Speech & Communication Evaluator and IELTS/CEFR Speaking Assessor.
      You analyze real speech data and provide transparent, mathematically anchored feedback.

      SPEECH CONTEXT: "${situation}"
      SPEECH LANGUAGE: ${isHindi ? 'Hindi / Hinglish (Indian Hindi + English mix)' : 'English'}
      
      MEASURED AUDIO METRICS:
      - Words per minute: ${numWpm} (Optimal target: 130-155 WPM)
      - Total filler words: ${numFillers}
      - Fillers per minute: ${(numFillers / (numWpm > 0 ? (numWpm / 130) : 1)).toFixed(1)}
      
      OBJECTIVE SCORING FORMULA (CEFR/IELTS ALIGNED):
      Start at 100 points:
      1. Pacing: Deduct 1 pt per 5 WPM deviation outside 130-155. If outside 100-180, deduct 2 pts per 5 WPM beyond that.
      2. Fillers: Deduct 3 pts per detected filler word (fillers break listener retention).
      3. Repetition / Rambling: Deduct 4-10 pts if repetitive phrasing or lack of transitions.
      4. Structure: Add 5 pts bonus if clear intro, body, and conclusion or logical transition markers are observed.
      5. Clamp final score between 15 and 98.

      RESPONSE FORMAT RULES:
      1. Address the speaker as "you" (or respectful "aap" if Hinglish). Be direct, honest, and actionable.
      ${isHindi ? '2. LANGUAGE MANDATE: The user chose Hindi / Hinglish. Write feedback, strengths, weaknesses, and suggestions in natural, clear Hinglish (Hindi written in English/Latin alphabet with English tech terms). Example: "Aapka flow bohot accha tha, par 0:18 pe filler word \'basically\' ki jagah 1-second silence maintain karein."' : '2. Respond in clear, professional English.'}
      3. EVERY strength, weakness, and suggestion MUST start with an exact timestamp from the transcript in [M:SS] format.
      4. Suggest concrete vocal exercises they can do today (e.g. pause replacement drill, half-speed rehearsal).
      5. Align CEFR Level strictly with score: 88-98 = C2, 78-87 = C1, 65-77 = B2, 50-64 = B1, 35-49 = A2, <35 = A1.
      
      Respond STRICTLY in valid JSON:
      {
        "tone": "Confident / Nervous / Energetic / Monotone / Hesitant / Rushed / Articulate & Clear",
        "toneScore": <number 15-98 calculated strictly from formula>,
        "cefrBand": "C1",
        "ieltsBand": 7.5,
        "scoringRationale": "Pacing at ${numWpm} WPM and ${numFillers} filler words with clear structure.",
        "feedback": "2-3 sentence overall coaching feedback referencing specific transcript moments.",
        "strengths": [
          "[0:05] Clear opening — stated primary objective immediately",
          "[0:22] Effective structured reasoning supporting the core thesis"
        ],
        "weaknesses": [
          "[0:15] Used filler words in quick succession — breaks vocal momentum",
          "[0:32] Pacing accelerated abruptly — key takeaway felt slightly rushed"
        ],
        "suggestions": [
          "[0:15] Practice 2-second silent pauses where you normally say fillers — silence conveys authority",
          "[0:32] Slow down by 15 WPM on your conclusion to allow key points to resonate"
        ],
        "timeMarkers": [
          { "time": 5.0, "type": "strength", "feedback": "Clear, structured opening statement" },
          { "time": 15.0, "type": "weakness", "feedback": "Filler cluster detected — substitute with silence" },
          { "time": 32.0, "type": "suggestion", "feedback": "Pacing spike — decelerate on crucial data" }
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
