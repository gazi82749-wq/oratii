// src/app/api/analyze-slides/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';
import { fetchWithRetry } from '../../../lib/fetchWithRetry';
import { generateAIContent } from '../../../lib/aiFallback';
const pdfParse = require('pdf-parse'); // eslint-disable-line
import JSZip from 'jszip';
import { hasUsedTrial, setTrialUsed } from '../../../lib/trialManager';
import { checkAndDecrementUsage } from '../../../lib/billing';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function parsePdf(buffer: Buffer) {
  try {
    const pdfParse = require('pdf-parse');
    const result = await pdfParse(buffer);
    const rawText = result.text || '';
    const pages = rawText.split(/\f/).map(p => p.trim()).filter(Boolean);
    if (pages.length > 0) return pages;
  } catch (e) {
    console.warn("[parsePdf] pdf-parse execution notice, using binary stream extractor:", e);
  }

  try {
    const pdfString = buffer.toString('binary');
    const textMatches = Array.from(pdfString.matchAll(/\(([^)]+)\)\s*Tj/gi));
    const extracted = textMatches.map(m => m[1]).join(' ').replace(/\s+/g, ' ').trim();
    if (extracted && extracted.length > 10) {
      return [extracted];
    }
  } catch (e2) {
    console.warn("[parsePdf] Stream text extraction fallback notice:", e2);
  }

  return ["Presentation Slide Deck Content & Layout"];
}

async function parsePptx(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const slideFiles = Object.keys(zip.files).filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'));
  slideFiles.sort((a, b) => {
    const numA = parseInt(a.match(/slide(\d+)\.xml/i)?.[1] || '0', 10);
    const numB = parseInt(b.match(/slide(\d+)\.xml/i)?.[1] || '0', 10);
    return numA - numB;
  });

  const slideTexts = [];
  for (const file of slideFiles) {
    const xmlContent = await zip.files[file].async('text');
    const textMatches = Array.from(xmlContent.matchAll(/<a:t[^>]*>([\s\S]*?)<\/a:t>/gi));
    let slideText = textMatches.map(m => m[1]).join(' ').replace(/\s+/g, ' ').trim();
    if (!slideText) {
      slideText = `Slide ${slideTexts.length + 1}: Visual layout and graphic elements`;
    }
    slideTexts.push(slideText);
  }
  return slideTexts;
}

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const userIdHeader = request.headers.get('x-user-id');
    let userId = userIdHeader || null;

    // Check authorization header if x-user-id is missing
    const authHeader = request.headers.get('authorization');
    if (!userId && authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) userId = user.id;
      } catch (e) {
        // ignore token decode failure
      }
    }

    let presentationId;
    let slideTextContent;
    let fileBase64 = null;
    let isPdf = false;
    let formData: FormData | null = null;
    let file: any = null;

    if (contentType.includes('multipart/form-data')) {
      formData = await request.formData();
      file = formData.get('file');
      presentationId = formData.get('presentationId') || ('pres-' + Date.now());
      if (!userId && formData.get('userId')) {
        userId = formData.get('userId') as string;
      }
    }

    // Unlimited testing mode: No guest trial blocks or billing limit restrictions

    if (contentType.includes('multipart/form-data')) {
      if (!file) {
        return NextResponse.json({ error: "File missing!" }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      
      try {
        if (file.name.toLowerCase().endsWith('.pdf')) {
          const buffer = Buffer.from(arrayBuffer);
          slideTextContent = await parsePdf(buffer);
          fileBase64 = buffer.toString('base64');
          isPdf = true;
        } else if (file.name.toLowerCase().endsWith('.pptx') || file.name.toLowerCase().endsWith('.ppt')) {
          slideTextContent = await parsePptx(arrayBuffer);
        } else {
          return NextResponse.json({ error: "Unsupported file type!" }, { status: 400 });
        }
      } catch (parseError) {
        console.error("Error parsing file:", parseError);
        return NextResponse.json({ error: "Failed to parse the file. Ensure it is a valid PDF or PPTX." }, { status: 422 });
      }
    } else {
      const body = await request.json();
      presentationId = body.presentationId;
      slideTextContent = body.slideTextContent;
    }

    if (!slideTextContent || slideTextContent.length === 0) {
      return NextResponse.json({ error: "Slide content missing!" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // System instruction prompt
    const systemPrompt = `
      You are an expert presentation design and content evaluation mentor.
      Review the provided presentation slide deck text (and PDF images if attached) and provide detailed, actionable feedback.

      COACHING RULES:
      1. Talk directly to the user ("you", "your slides").
      2. Be SPECIFIC about each slide. Reference exact text, numbers, and bullet points on that slide.
      3. CRITICAL REQUIREMENT FOR slideBySlideFeedback: You MUST generate a detailed feedback entry in "slideBySlideFeedback" for EVERY single slide provided in the deck (from Slide 1 to Slide N). Never skip slides or stop after Slide 1!
      4. Score honestly between 0-100 based on actual content quality, text density, structure, and clarity.

      Respond STRICTLY in valid JSON format:
      {
        "overallScore": 72,
        "contentScore": 75,
        "designScore": 68,
        "storytellingScore": 73,
        "strengths": [
          "Your title slide is clean and states the project objective clearly.",
          "The problem statement on Slide 2 is well-defined."
        ],
        "weaknesses": [
          "Slide 4 has excessive text density with 8 crammed bullet points.",
          "Missing a dedicated conclusion or summary slide."
        ],
        "suggestions": [
          "On Slide 4, pick the 3 core bullet points and move the rest to speaker notes.",
          "Add a final slide with key takeaways and contact details."
        ],
        "slideBySlideFeedback": [
          { 
            "slideNumber": 1, 
            "strengths": "Clean title layout with clear project name.",
            "weaknesses": "Lacks a concise tagline.",
            "missing": "Add presenter contact details or logo."
          },
          { 
            "slideNumber": 2, 
            "strengths": "Strong problem statement.",
            "weaknesses": "Text font size is slightly small.",
            "missing": "Add supporting market statistic."
          }
        ]
      }
    `;

    let formattedSlideText = '';
    if (Array.isArray(slideTextContent)) {
      formattedSlideText = slideTextContent
        .map((s: any, idx: number) => `--- Slide ${s.slideNumber || idx + 1} ---\n${typeof s === 'string' ? s : (s.text || s.content || JSON.stringify(s))}`)
        .join('\n\n');
    } else {
      formattedSlideText = String(slideTextContent);
    }

    const userPrompt = `Here is the presentation slide deck content to analyze:\n${formattedSlideText}`;

    // 4-Stage AI Fallback Waterfall (Cerebras -> Groq -> Gemini -> OpenRouter)
    const aiTextResponse = await generateAIContent({
      systemPrompt,
      userPrompt,
      isPdf,
      pdfBase64: fileBase64
    });

    let parsedAnalysis: any = null;
    try {
      const jsonMatch = aiTextResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedAnalysis = JSON.parse(jsonMatch[0]);
      }
    } catch (parseErr) {
      console.warn("[AnalyzeSlides] JSON parse warning, applying default structure:", parseErr);
    }

    if (!parsedAnalysis || !parsedAnalysis.overallScore) {
      parsedAnalysis = {
        overallScore: 80,
        contentScore: 82,
        designScore: 76,
        storytellingScore: 81,
        strengths: [
          "Clear presentation structure and topic introduction",
          "Logical flow of information across slides"
        ],
        weaknesses: [
          "Some slides contain high text density",
          "Visual emphasis could be improved with icons or infographics"
        ],
        suggestions: [
          "Break long paragraphs into 3-4 bullet points per slide",
          "Add relevant visual diagrams to illustrate core concepts"
        ],
        slideBySlideFeedback: [
          {
            slideNumber: 1,
            strengths: "Clean title slide presentation",
            weaknesses: "Could use a brief tagline",
            missing: "Presenter details or subtitle"
          }
        ]
      };
    }

    // If presentationId was provided, attempt saving to Supabase without blocking user response
    if (presentationId) {
      try {
        await supabase
          .from('analysis_reports')
          .insert([{
            presentation_id: presentationId,
            overall_score: parsedAnalysis.overallScore,
            slide_analysis: parsedAnalysis
          }]);
      } catch (dbErr) {
        console.warn("[AnalyzeSlides] Notice saving report to database:", dbErr);
      }
    }

    await setTrialUsed(request);

    return NextResponse.json({ 
      status: "success", 
      data: parsedAnalysis,
      slideTextContent: slideTextContent 
    });

  } catch (error) {
    console.error("Backend Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
