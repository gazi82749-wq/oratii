// src/app/api/speech-writer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateAIContent } from '../../../lib/aiFallback';
import { checkRateLimit, AI_RATE_LIMIT } from '../../../lib/rateLimit';
import { supabase } from '../../../lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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
      return NextResponse.json({ error: "Authentication required. Please sign in to use Speech Writer.", authRequired: true }, { status: 401 });
    }
    const { data: { user } } = await supabase.auth.getUser(authHeader.substring(7).trim());
    if (!user) {
      return NextResponse.json({ error: "Invalid or expired session. Please sign in again.", authRequired: true }, { status: 401 });
    }

    const body = await request.json();
    const { topic, tone = 'Professional', audience = 'General Public' } = body;

    if (!topic || topic.trim().length === 0) {
      return NextResponse.json({ error: "Please provide a topic for the speech." }, { status: 400 });
    }

    if (topic.trim().length > 200) {
      return NextResponse.json({ error: "Topic is too long. Please keep it under 200 characters." }, { status: 400 });
    }

    // ── Idempotency Check ──
    const crypto = await import('crypto');
    const promptVersion = 'v2_speech_writer';
    const hashString = `${topic.trim()}|${tone}|${audience}|${promptVersion}`;
    const fileHash = crypto.createHash('sha256').update(hashString).digest('hex');
    const idempotencyKey = `speech-writer:${user.id}:${fileHash}`;
    
    const { acquireLock, releaseLock, checkCache, setCache } = await import('../../../lib/idempotency');
    
    // 1. Read-only fast cache check
    const fastCache = await checkCache<any>(`cache:${idempotencyKey}`);
    if (fastCache) {
      return NextResponse.json(fastCache);
    }

    // 2. Acquire lock
    const isLocked = await acquireLock(idempotencyKey);
    if (!isLocked) {
      return NextResponse.json({ error: "Request is already processing. Please wait a moment." }, { status: 429 });
    }

    try {
      // 3. Double-checked locking
      const redisCache = await checkCache<any>(`cache:${idempotencyKey}`);
      if (redisCache) {
        await releaseLock(idempotencyKey);
        return NextResponse.json(redisCache);
      }

    const systemPrompt = `
      You are an elite, highly adaptable speechwriter.
      Write a compelling 150-200 word speech on the requested topic.

      CRITICAL INSTRUCTIONS:
      1. Adapt the speech perfectly to the specified Audience context: "${audience}".
      2. Ensure the tone matches perfectly with: "${tone}".
      3. DO NOT use generic openings like "Good morning everyone" or "Today I am honored" unless it fits the audience perfectly.
      4. If the audience is an HR Interview or Viva Defense, structure it as a strong, concise answer script rather than a stage speech.

      Respond STRICTLY in valid JSON format:
      {
        "title": "Speech on ${topic.trim()}",
        "speech": "<The highly customized speech or answer script>",
        "tips": [
          "<Actionable tip for this specific tone/audience>",
          "<Actionable tip on body language or pacing>",
          "<Actionable tip on eye contact or confidence>"
        ]
      }
    `;

    const userPrompt = `Topic: "${topic.trim()}"\nAudience/Context: "${audience}"\nTone: "${tone}"`;

    const aiResponse = await generateAIContent({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
    });

    let title = `Speech on ${topic.trim()}`;
    let speech = "";
    let tips = [
      "Speak clearly and at a steady pace.",
      "Maintain good eye contact with your audience.",
      "Stand tall and speak with confidence."
    ];

    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.title) title = parsed.title;
        if (parsed.speech) speech = parsed.speech;
        if (Array.isArray(parsed.tips) && parsed.tips.length > 0) tips = parsed.tips;
      }
    } catch (e) {
      console.warn("JSON parse fallback used for speech writer");
    }

    if (!speech) {
      speech = aiResponse.replace(/```json|```/g, '').trim();
    }

    const responseData = {
      status: "success",
      data: {
        title,
        speech,
        tips,
      }
    };

    try {
      await setCache(`cache:${idempotencyKey}`, responseData, 86400);
    } catch(e) {}

    return NextResponse.json(responseData);

    } finally {
      await releaseLock(idempotencyKey);
    }

  } catch (error: any) {
    console.error("Speech Writer Error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech. Please try again.", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
