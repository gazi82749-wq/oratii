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

async function parsePdf(buffer) {
  const result = await pdfParse(buffer);
  const rawText = result.text || '';
  const pages = rawText.split(/\f/).map(p => p.trim()).filter(Boolean);
  return pages.length > 0 ? pages : [rawText.trim() || "PDF Slide Deck"];
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
    if (await hasUsedTrial(request)) {
      return NextResponse.json({ error: "Trial Expired", message: "You have used your free trial. Please sign in to continue." }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    const userIdHeader = request.headers.get('x-user-id');
    let presentationId;
    let slideTextContent;
    let fileBase64 = null;
    let isPdf = false;
    let userId = userIdHeader || null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      const source = formData.get('source');
      presentationId = formData.get('presentationId') || ('pres-' + Date.now());
      if (!userId && formData.get('userId')) {
        userId = formData.get('userId') as string;
      }

      if (!file) {
        return NextResponse.json({ error: "File missing!" }, { status: 400 });
      }

      if (userId) {
        const usageCheck = await checkAndDecrementUsage(userId, 'ppt_analysis_count');
        if (!usageCheck.allowed) {
          return NextResponse.json({
            error: "Limit Exceeded",
            message: "You have reached your monthly limit for Slide Deck Analyses. Please upgrade your plan."
          }, { status: 403 });
        }
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
    
    // Clean up: AI sometimes wraps JSON in markdown code fences
    const jsonMatch = aiTextResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON object found in Gemini response");
    const parsedAnalysis = JSON.parse(jsonMatch[0]);

    // If presentationId was provided, save results to Supabase for dashboard analytics
    if (presentationId) {
      await supabase
        .from('analysis_reports')
        .insert([{
          presentation_id: presentationId,
          overall_score: parsedAnalysis.overallScore,
          slide_analysis: parsedAnalysis
        }]);
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
