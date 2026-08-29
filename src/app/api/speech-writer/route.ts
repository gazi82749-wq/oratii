// src/app/api/speech-writer/route.ts
import { NextResponse } from 'next/server';
import { generateAIContent } from '../../../lib/aiFallback';
import { hasUsedTrial, setTrialUsed } from '../../../lib/trialManager';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    if (await hasUsedTrial(request)) {
      return NextResponse.json({ error: "Trial Expired", message: "You have used your free trial. Please sign in to continue." }, { status: 401 });
    }

    const body = await request.json();
    const { topic } = body;

    if (!topic || topic.trim().length === 0) {
      return NextResponse.json({ error: "Please provide a topic for the speech." }, { status: 400 });
    }

    if (topic.trim().length > 200) {
      return NextResponse.json({ error: "Topic is too long. Please keep it under 200 characters." }, { status: 400 });
    }

    const systemPrompt = `
      You are a kind and friendly English teacher for class 5 and class 6 students (age 10-12 years old).
      A student has asked you to write a simple speech on a topic they give you.

      YOUR RULES:
      1. Write a speech that is 150 to 200 words long â€” about one page when printed.
      2. Use VERY SIMPLE English â€” short sentences, easy words that a 10-12 year old child can read and understand.
      3. Do NOT use big or complex words. For example, say "important" instead of "significant", say "help" instead of "facilitate".
      4. The speech should sound natural â€” like a child is speaking in front of their class at school.
      5. Start with a greeting like "Good morning respected teachers and my dear friends" or similar.
      6. End with a polite closing like "Thank you for listening" or "Thank you".
      7. Break the speech into 3-4 short paragraphs.
      8. The tone should be warm, positive, and enthusiastic â€” a child who is happy to share.
      9. Give 3 simple tips on how to deliver this speech well (e.g. "Speak slowly", "Look at your audience", "Smile").

      Respond ONLY in this strict JSON format â€” no extra text, no code blocks:
      {
        "title": "Speech on [Topic]",
        "speech": "The full speech text here with paragraph breaks using \\n\\n between paragraphs.",
        "tips": [
          "Tip 1",
          "Tip 2",
          "Tip 3"
        ]
      }
    `;

    const userPrompt = `Write a simple speech for a class 5-6 student on the topic: "${topic.trim()}"`;

    const aiResponse = await generateAIContent({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
    });

    // Clean up: AI sometimes wraps JSON in markdown code fences
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse AI response as JSON");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate the response has required fields
    if (!parsed.title || !parsed.speech || !parsed.tips) {
      throw new Error("AI response missing required fields");
    }

    // After a successful generation, mark trial as used
    await setTrialUsed(request);

    return NextResponse.json({
      status: "success",
      data: {
        title: parsed.title,
        speech: parsed.speech,
        tips: Array.isArray(parsed.tips) ? parsed.tips : [],
      }
    });

  } catch (error) {
    console.error("Speech Writer Error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech. Please try again.", details: error.message },
      { status: 500 }
    );
  }
}
