import { NextRequest, NextResponse } from 'next/server';
import { generateAIContent } from '../../../lib/aiFallback';
import { checkRateLimit, AI_RATE_LIMIT } from '../../../lib/rateLimit';
import { supabase } from '../../../lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.ip || 'unknown';
    const rateResult = checkRateLimit(`ai:${ip}`, AI_RATE_LIMIT);
    if (!rateResult.allowed) {
      return NextResponse.json({
        error: "Too Many Requests",
        message: `Please wait ${rateResult.retryAfterSeconds} seconds before trying again.`
      }, { status: 429 });
    }

    // 2. Authentication Check
    let userId: string | null = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      try {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) userId = user.id;
      } catch (e) { /* ignore */ }
    }

    if (!userId) {
      return NextResponse.json({ error: "Authentication required for AI interview evaluation." }, { status: 401 });
    }

    // 3. Parse Request Payload
    const {
      transcript = '',
      roleTitle = 'Professional Role',
      resumeText = '',
      difficultyLevel = 'Mid-Level'
    } = await request.json();

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json({
        error: "Missing transcript",
        message: "No candidate answers were recorded for evaluation."
      }, { status: 400 });
    }

    // 4. Construct AI Prompt for Dynamic Interview Evaluation
    const systemPrompt = `
      You are an expert Executive Hiring Manager and Senior Recruiter evaluating a mock job interview for the position: "${roleTitle}" (Level: ${difficultyLevel}).
      
      Your goal is to provide deep, authentic, non-generic, mathematically anchored feedback based SOLELY on what the candidate actually said in their transcript.

      CRITICAL DIRECTIVES:
      1. DO NOT return generic placeholder or template text!
      2. Quote or reference exact technical points, tools, project names, or phrases mentioned by the candidate in their answers.
      3. Rigorous Scoring Rules (15 to 98 scale):
         - Evasive / 1-5 word / empty answers: Score strictly between 15 and 35.
         - Generic / superficial answers missing specific technical details or metrics: Score between 45 and 68.
         - Well-structured, clear answers with specific tools, metrics, or STAR framework: Score between 72 and 88.
         - Exceptional, expert-level answers with clear trade-offs, architecture, and metrics: Score between 89 and 98.
         - "overall" score MUST equal the rounded average of (technical + communication + starAlignment + relevance) / 4.
      4. "strengths": 2-3 specific bullet points praising exact points, skills, or structured answers given by the candidate.
      5. "weaknesses": 2-3 specific bullet points calling out missing technical depth, missing STAR structure (Situation-Task-Action-Result), or weak explanations in their actual answers.
      6. "suggestions": 2-3 actionable, high-value coaching recommendations tailored to the candidate's answers.
      7. "whatToCut": 2-3 exact phrases, filler words, off-topic fluff, or vague generalities used by the candidate in their transcript that should be eliminated.
      8. "betterWayToSayIt": A polished, high-impact 2-3 sentence model response showing how the candidate SHOULD have answered their weakest question, incorporating their actual project background/tools.

      Respond STRICTLY in valid JSON format:
      {
        "scores": {
          "technical": <number 15-98>,
          "communication": <number 15-98>,
          "starAlignment": <number 15-98>,
          "relevance": <number 15-98>,
          "overall": <number 15-98>
        },
        "strengths": [
          "<Specific strength #1 referencing candidate's actual answer>",
          "<Specific strength #2 referencing candidate's actual answer>"
        ],
        "weaknesses": [
          "<Specific weakness #1 pointing out what candidate missed>",
          "<Specific weakness #2 pointing out STAR or depth issue>"
        ],
        "suggestions": [
          "<Actionable tip #1 customized for this candidate>",
          "<Actionable tip #2 customized for this candidate>"
        ],
        "whatToCut": [
          "<Specific filler phrase or vague statement candidate used>",
          "<Specific fluff or weak phrasing candidate used>"
        ],
        "betterWayToSayIt": "<Polished model answer tailored to candidate's background>"
      }
    `;

    const userPrompt = `
      JOB ROLE: ${roleTitle}
      DIFFICULTY LEVEL: ${difficultyLevel}
      ${resumeText ? `CANDIDATE RESUME / CV:\n${resumeText.slice(0, 1500)}\n` : ''}

      FULL INTERVIEW TRANSCRIPT:
      ${transcript.slice(0, 4000)}

      Evaluate the candidate's performance now and return JSON response matching the required schema.
    `;

    // 5. Call AI Fallback Engine
    const aiResponseText = await generateAIContent({
      systemPrompt,
      userPrompt,
      temperature: 0.2
    });

    // 6. Parse JSON Output
    const cleanJson = aiResponseText.replace(/```json|```/g, '').trim();
    let parsed: any;
    try {
      parsed = JSON.parse(cleanJson);
    } catch (e) {
      const match = cleanJson.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error("Failed to parse interview evaluation JSON: " + aiResponseText);
      }
    }

    // 7. Defensive Clamping on Scores
    if (parsed.scores && typeof parsed.scores === 'object') {
      const tech = Math.min(98, Math.max(15, Number(parsed.scores.technical) || 60));
      const comm = Math.min(98, Math.max(15, Number(parsed.scores.communication) || 60));
      const star = Math.min(98, Math.max(15, Number(parsed.scores.starAlignment) || 60));
      const rel  = Math.min(98, Math.max(15, Number(parsed.scores.relevance) || 60));
      const overall = Math.round((tech + comm + star + rel) / 4);

      parsed.scores = {
        technical: tech,
        communication: comm,
        starAlignment: star,
        relevance: rel,
        overall
      };
    }

    // 8. Sanitize Arrays
    if (!Array.isArray(parsed.strengths) || parsed.strengths.length === 0) {
      parsed.strengths = [
        `Responded directly to questions posed for the ${roleTitle} role.`,
        'Maintained structured communication across interview rounds.'
      ];
    }
    if (!Array.isArray(parsed.weaknesses) || parsed.weaknesses.length === 0) {
      parsed.weaknesses = [
        'Include more specific metrics (e.g. latency, team size, percentage gains) to validate achievements.'
      ];
    }
    if (!Array.isArray(parsed.suggestions) || parsed.suggestions.length === 0) {
      parsed.suggestions = [
        'Frame your technical contributions using the Situation, Task, Action, and Result (STAR) framework.'
      ];
    }
    if (!Array.isArray(parsed.whatToCut) || parsed.whatToCut.length === 0) {
      parsed.whatToCut = [
        'Cut open-ended closing phrases like "and so on" or "etc."',
        'Avoid filler transition words like "basically" or "actually" when explaining solutions.'
      ];
    }

    return NextResponse.json({ status: 'success', data: parsed });

  } catch (error: any) {
    console.error('Interview Evaluation Endpoint Error:', error);
    return NextResponse.json(
      { error: 'Evaluation failed', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
