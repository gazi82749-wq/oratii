// src/app/api/speech-writer/route.ts
import { NextResponse } from 'next/server';
import { generateAIContent } from '../../../lib/aiFallback';
import { hasUsedTrial, setTrialUsed } from '../../../lib/trialManager';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request) {
  try {
    const body = await request.json();
    const { topic } = body;

    if (!topic || topic.trim().length === 0) {
      return NextResponse.json({ error: "Please provide a topic for the speech." }, { status: 400 });
    }

    if (topic.trim().length > 200) {
      return NextResponse.json({ error: "Topic is too long. Please keep it under 200 characters." }, { status: 400 });
    }

    const systemPrompt = `
      You are a kind and friendly English speech writer.
      Write a simple, inspiring 150-200 word speech on the requested topic.

      Respond STRICTLY in valid JSON format:
      {
        "title": "Speech on ${topic.trim()}",
        "speech": "Good morning everyone. Today I am honored to speak about ${topic.trim()}...",
        "tips": [
          "Speak clearly and at a steady pace.",
          "Maintain good eye contact with your audience.",
          "Stand tall and speak with natural enthusiasm."
        ]
      }
    `;

    const userPrompt = `Write an engaging speech on the topic: "${topic.trim()}"`;

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

    return NextResponse.json({
      status: "success",
      data: {
        title,
        speech,
        tips,
      }
    });

  } catch (error) {
    console.error("Speech Writer Error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech. Please try again.", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
