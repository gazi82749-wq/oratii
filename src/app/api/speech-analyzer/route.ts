// src/app/api/speech-analyzer/route.ts
import { NextResponse } from 'next/server';
import { fetchWithRetry } from '../../../lib/fetchWithRetry';
import { HINGLISH_FILLERS } from '../../../lib/constants';
import { hasUsedTrial, setTrialUsed } from '../../../lib/trialManager';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request) {
  try {
    if (await hasUsedTrial(request)) {
      return NextResponse.json({ error: "Trial Expired", message: "You have used your free trial. Please sign in to continue." }, { status: 401 });
    }

    // Receive raw audio blob from frontend
    const formData = await request.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      return NextResponse.json({ error: "No audio data received!" }, { status: 400 });
    }

    const apiKey = process.env.DEEPGRAM_API_KEY;
    const reqLanguage = formData.get('language') || 'en-US';
    
    // Deepgram API URL using the specified language
    const deepgramUrl = `https://api.deepgram.com/v1/listen?model=nova-2&smart_formatting=true&filler_words=true&language=${reqLanguage}`;

    // Convert audio file to buffer for Deepgram API
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Send to Deepgram REST API with retry
    const response = await fetchWithRetry(deepgramUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': audioFile.type || 'audio/wav',
      },
      body: buffer
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Deepgram API failed: ${errorData}`);
    }

    const data = await response.json();
    
    // Extract transcript
    const transcript = data.results?.channels[0]?.alternatives[0]?.transcript || "";
    
    // Extract words array containing filler word details
    const words = data.results?.channels[0]?.alternatives[0]?.words || [];

    // Filter and count filler words
    // Deepgram marks "uh", "um", "mm", "ah" etc. with filler labels
    const detectedFillers = words.filter(w => w.vowel_confidence || w.word === "um" || w.word === "uh" || w.word === "ah");
    
    // Total filler word count
    const fillerCount = detectedFillers.length;

    // Hinglish-specific manual checks for common Indian conversational fillers
    let hinglishFillerCount = 0;
    
    words.forEach(w => {
      if (HINGLISH_FILLERS.includes(w.word.toLowerCase())) {
        hinglishFillerCount++;
      }
    });
    const totalFillers = fillerCount + hinglishFillerCount;
    const wpm = Math.round((words.length / (data.metadata?.duration || 1)) * 60);

    let timedTranscript = "";
    let currentSentence = "";
    let sentenceStart = words.length > 0 ? words[0].start : 0;

    words.forEach((w, index) => {
      currentSentence += (w.punctuated_word || w.word) + " ";
      if ((w.punctuated_word && w.punctuated_word.match(/[.!?]/)) || index === words.length - 1 || currentSentence.split(' ').length > 15) {
        timedTranscript += `[${sentenceStart.toFixed(1)}s]: ${currentSentence.trim()}\n`;
        currentSentence = "";
        if (index < words.length - 1) {
          sentenceStart = words[index + 1].start;
        }
      }
    });

    let toneAnalysis = null;

    // Calculate per-segment WPM for pace graph (5-second windows)
    const totalDuration = data.metadata?.duration || 1;
    const segmentDuration = 5; // seconds per segment
    const paceData: { time: number; wpm: number; wordCount: number }[] = [];
    
    if (words.length > 0) {
      const numSegments = Math.ceil(totalDuration / segmentDuration);
      for (let i = 0; i < numSegments; i++) {
        const segStart = i * segmentDuration;
        const segEnd = (i + 1) * segmentDuration;
        const segWords = words.filter((w: any) => w.start >= segStart && w.start < segEnd);
        const segWordCount = segWords.length;
        // WPM = words in segment / segment duration in minutes
        const actualSegDuration = Math.min(segmentDuration, totalDuration - segStart);
        const segWpm = actualSegDuration > 0 ? Math.round((segWordCount / actualSegDuration) * 60) : 0;
        paceData.push({
          time: segStart + actualSegDuration / 2, // midpoint of segment
          wpm: segWpm,
          wordCount: segWordCount
        });
      }
    }

    // After a successful analysis, mark trial as used (only affects anonymous users)
    await setTrialUsed(request);

    return NextResponse.json({
      status: "success",
      transcript: transcript,
      words: words,
      analysis: {
        totalWords: words.length,
        nativeFillerCount: fillerCount,
        hinglishFillerCount: hinglishFillerCount,
        totalFillers: totalFillers,
        wpm: wpm,
        paceData: paceData,
        duration: totalDuration,
        timedTranscript: timedTranscript,
        tone: toneAnalysis
      }
    });

  } catch (error) {
    console.error("Speech Analyzer Error:", error);
    return NextResponse.json({ error: "Speech analysis failed", details: error.message }, { status: 500 });
  }
}
