// src/app/api/speech-writer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateAIContent } from '../../../lib/aiFallback';
import { getDynamicPrompt } from '../../../lib/getDynamicPrompt';
import { checkAndDecrementUsage, refundUsage } from '../../../lib/billing';
import { withAuthAndRateLimit } from '../../../lib/apiWrapper';
import { supabase } from '../../../lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export const POST = withAuthAndRateLimit(async (request, { user, ip }) => {
  let creditConsumed = false;
  let userIdForRefund: string | null = null;
  let idempotencyKey = '';
  try {
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
    idempotencyKey = `speech-writer:${user.id}:${fileHash}`;
    
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

      const usageCheck = await checkAndDecrementUsage(user.id, 'speech_analysis_count');
      if (!usageCheck.allowed) {
        await releaseLock(idempotencyKey);
        return NextResponse.json({
          error: "Credits Exhausted",
          message: "You've used all your credits. Purchase more credits to continue.",
          creditExhausted: true
        }, { status: 403 });
      }
      creditConsumed = true;
      userIdForRefund = user.id;

    const baseAdminPrompt = await getDynamicPrompt('speech_coach', 'You help people practice speaking naturally.');

    const systemPrompt = `
      ${baseAdminPrompt}
      Write a short, natural, conversational speech (120-160 words) on the given topic.

      RULES — follow all of them strictly:
      1. Write exactly how a real person would SPEAK OUT LOUD — not how someone writes an essay.
      2. Use SHORT, simple sentences. No long complex sentences.
      3. NO fancy vocabulary. Use everyday words a normal person uses.
      4. NO formal openers like "Good morning", "Today I stand before you", "It is my honor".
      5. Just start naturally — e.g. "So, when I think about..." or "Honestly, this topic is..." or directly with the point.
      6. NO bullet points or numbered lists in the speech text. Write it as flowing spoken words.
      7. Adapt to the context: "${audience}". If it's an HR/interview answer, make it sound like a genuine, relaxed verbal answer.
      8. The tips should be simple and practical — 1 sentence each, no jargon.

      Respond STRICTLY in valid JSON format:
      {
        "title": "${topic.trim()}",
        "speech": "<natural spoken speech here>",
        "tips": [
          "<short practical tip>",
          "<short practical tip>",
          "<short practical tip>"
        ]
      }
    `;

    const userPrompt = `Topic: "${topic.trim()}"\nContext: "${audience}"\nTone: "${tone}"`;

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
    console.error('Speech Writer Error:', error);
    if (creditConsumed && userIdForRefund) {
      console.warn(`[SpeechWriter] AI failed. Refunding credit for ${userIdForRefund}`);
      await refundUsage(userIdForRefund, 1);
    }
    return NextResponse.json(
      { error: 'Failed to generate speech', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
});
