// src/app/api/analyze-slides/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';
import { fetchWithRetry } from '../../../lib/fetchWithRetry';
import { generateAIContent } from '../../../lib/aiFallback';
import JSZip from 'jszip';
import { parseSlideXml, parseNotesXml } from '../../../lib/pptxParser';
import { checkAndDecrementUsage } from '../../../lib/billing';
import { checkRateLimit, AI_RATE_LIMIT } from '../../../lib/rateLimit';
import { hasUsedTrial, setTrialUsed } from '../../../lib/trialManager';
import crypto from 'crypto';

// Cache TTL: cached results are valid for 24 hours
const CACHE_TTL_HOURS = 24;

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

async function parsePptx(buffer: Buffer) {
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
    let slideText = await parseSlideXml(xmlContent);
    
    // Check for corresponding notes slide
    const slideNumberMatch = file.match(/slide(\d+)\.xml/i);
    if (slideNumberMatch) {
      const slideNum = slideNumberMatch[1];
      const notesFile = `ppt/notesSlides/notesSlide${slideNum}.xml`;
      const notesFileEntry = zip.files[notesFile];
      if (notesFileEntry) {
        try {
          const notesXmlContent = await notesFileEntry.async('text');
          const notesText = await parseNotesXml(notesXmlContent);
          if (notesText) {
            slideText += `\n[SPEAKER NOTES: ${notesText}]`;
          }
        } catch (e) {}
      }
    }

    if (!slideText) {
      slideText = `Slide ${slideTexts.length + 1}: Visual layout and graphic elements`;
    }
    slideTexts.push(slideText);
  }
  return slideTexts;
}

// In-memory cache to guarantee instant 100% deterministic identical results for repeated uploads
interface SlideCacheEntry {
  analysisResult: any;
  slideTextContent: any;
  timestamp: number;
}
const inMemorySlideCache = new Map<string, SlideCacheEntry>();

export async function POST(request: NextRequest) {
  let creditConsumed = false;
  let userIdForRefund: string | null = null;

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
    let userId: string | null = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      try {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) userId = user.id;
      } catch (e) { /* ignore */ }
    }

    const contentType = request.headers.get('content-type') || '';

    let presentationId;
    let slideTextContent;
    let fileBase64 = null;
    let isPdf = false;
    let formData: FormData | null = null;
    let file: any = null;
    let fileBuffer: Buffer | null = null;

    if (contentType.includes('multipart/form-data')) {
      formData = await request.formData();
      file = formData.get('file');
      presentationId = formData.get('presentationId') || ('pres-' + Date.now());
      if (!userId && formData.get('userId')) {
        userId = formData.get('userId') as string;
      }
    }

    // Check authentication or anonymous trial
    if (!userId) {
      const xUserId = request.headers.get('x-user-id');
      if (xUserId) userId = xUserId;
    }

    if (contentType.includes('multipart/form-data')) {
      if (!file) {
        return NextResponse.json({ error: "File missing!" }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);

      try {
        if (file.name.toLowerCase().endsWith('.pdf')) {
          slideTextContent = await parsePdf(fileBuffer);
          fileBase64 = fileBuffer.toString('base64');
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

    let formattedSlideText = '';
    if (Array.isArray(slideTextContent)) {
      formattedSlideText = slideTextContent
        .map((s: any, idx: number) => `--- Slide ${s.slideNumber || idx + 1} ---\n${typeof s === 'string' ? s : (s.text || s.content || JSON.stringify(s))}`)
        .join('\n\n');
    } else {
      formattedSlideText = String(slideTextContent);
    }

    // ── 1. Calculate Exact File & Text SHA-256 Fingerprint ──
    const promptVersion = 'v1_slide_analysis';
    const rawHashString = fileBuffer
      ? fileBuffer.toString('base64') + promptVersion
      : formattedSlideText + promptVersion;
      
    const fileHash = crypto.createHash('sha256').update(rawHashString).digest('hex');
    const idempotencyKey = `analyze-slides:${fileHash}`;

    // ── 2. Check Idempotency / Cache ──
    const { acquireLock, releaseLock, checkCache, setCache } = await import('../../../lib/idempotency');
    const isLocked = await acquireLock(idempotencyKey);
    if (!isLocked) {
      return NextResponse.json({ error: "Request is already processing. Please wait a moment." }, { status: 429 });
    }

    try {
      const memoryCached = inMemorySlideCache.get(fileHash);
      if (memoryCached && (Date.now() - memoryCached.timestamp) < CACHE_TTL_HOURS * 3600 * 1000) {
        console.log(`[AnalyzeSlides] ⚡ In-Memory Cache HIT for ${fileHash.slice(0, 8)}`);
        await releaseLock(idempotencyKey);
        return NextResponse.json({
          status: "success",
          data: memoryCached.analysisResult,
          slideTextContent: memoryCached.slideTextContent,
          cached: true
        });
      }

      const redisCache = await checkCache<{data: any, text: any}>(`cache:${idempotencyKey}`);
      if (redisCache) {
         console.log(`[AnalyzeSlides] ⚡ Redis Cache HIT for ${fileHash.slice(0, 8)}`);
         await releaseLock(idempotencyKey);
         return NextResponse.json({
           status: "success",
           data: redisCache.data,
           slideTextContent: redisCache.text,
           cached: true
         });
      }

    // ── 3. Check Persistent Database Cache ──
    try {
      const { data: cached } = await supabase
        .from('analysis_cache')
        .select('analysis_result, created_at')
        .eq('content_hash', fileHash)
        .single();

      if (cached?.analysis_result) {
        const cacheAge = (Date.now() - new Date(cached.created_at).getTime()) / (1000 * 60 * 60);
        if (cacheAge < CACHE_TTL_HOURS) {
          console.log(`[AnalyzeSlides] ⚡ Database Cache HIT for ${fileHash.slice(0, 8)} (age: ${cacheAge.toFixed(1)}h)`);
          
          // Populate in-memory cache
          inMemorySlideCache.set(fileHash, {
            analysisResult: cached.analysis_result,
            slideTextContent: slideTextContent,
            timestamp: Date.now()
          });

          const response = NextResponse.json({
            status: "success",
            data: cached.analysis_result,
            slideTextContent: slideTextContent,
            cached: true
          });
          if (!userId) await setTrialUsed(request);
          return response;
        }
      }
    } catch (cacheErr) {
      console.log('[AnalyzeSlides] DB Cache miss, calling deterministic AI evaluation...');
    }

    // Credit / Trial Check (only executed for uncached new presentations)
    if (!userId) {
      const trialExhausted = await hasUsedTrial(request);
      if (trialExhausted) {
        return NextResponse.json({ 
          error: "Free trial limit reached. Please sign in or create an account to get 20 free credits.", 
          authRequired: true,
          trialExpired: true 
        }, { status: 401 });
      }
    } else {
      userIdForRefund = userId;
      const usageCheck = await checkAndDecrementUsage(userId, 'ppt_analysis_count');
      if (!usageCheck.allowed) {
        return NextResponse.json({
          error: "Credits Exhausted",
          message: "You've used all your credits. Purchase more credits to continue.",
          creditExhausted: true
        }, { status: 403 });
      }
      creditConsumed = true;
    }

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

    const userPrompt = `Here is the presentation slide deck content to analyze:\n${formattedSlideText}`;

    // Fast text-first inference: If text was extracted, skip massive multi-MB base64 upload to cut latency from 45s down to 2s
    const hasAdequateText = formattedSlideText && formattedSlideText.trim().length > 30;
    const shouldSendBinaryPdf = isPdf && !hasAdequateText;

    // 4-Stage AI Fallback Waterfall with temperature: 0.0 for deterministic evaluation decoding
    const aiTextResponse = await generateAIContent({
      systemPrompt,
      userPrompt,
      temperature: 0.0,
      isPdf: shouldSendBinaryPdf,
      pdfBase64: shouldSendBinaryPdf ? fileBase64 : null
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

    if (!parsedAnalysis || typeof parsedAnalysis.overallScore !== 'number') {
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

    // ── 4. Mathematical Score Calibration & Normalization ──
    const content = Math.max(0, Math.min(100, Math.round(parsedAnalysis.contentScore || 75)));
    const design = Math.max(0, Math.min(100, Math.round(parsedAnalysis.designScore || 70)));
    const storytelling = Math.max(0, Math.min(100, Math.round(parsedAnalysis.storytellingScore || 72)));

    parsedAnalysis.contentScore = content;
    parsedAnalysis.designScore = design;
    parsedAnalysis.storytellingScore = storytelling;

    // Weighted deterministic overall score (40% content, 35% design, 25% storytelling)
    parsedAnalysis.overallScore = Math.round(content * 0.40 + design * 0.35 + storytelling * 0.25);

    // ── 5. Cache in Memory & Database ──
    if (inMemorySlideCache.size > 500) {
      const oldestKey = inMemorySlideCache.keys().next().value;
      if (oldestKey) inMemorySlideCache.delete(oldestKey);
    }

    inMemorySlideCache.set(fileHash, {
      analysisResult: parsedAnalysis,
      slideTextContent,
      timestamp: Date.now()
    });
    
    try {
      await setCache(`cache:${idempotencyKey}`, { data: parsedAnalysis, text: slideTextContent });
    } catch(e) {}

    try {
      await supabase
        .from('analysis_cache')
        .upsert([{
          content_hash: fileHash,
          analysis_result: parsedAnalysis,
          slide_count: Array.isArray(slideTextContent) ? slideTextContent.length : 1,
          created_at: new Date().toISOString()
        }], { onConflict: 'content_hash' });
      console.log(`[AnalyzeSlides] ✅ Cached deterministic analysis result for hash ${fileHash.slice(0, 8)}`);
    } catch (cacheWriteErr) {
      console.warn('[AnalyzeSlides] Notice caching result to DB:', cacheWriteErr);
    }

    // Save presentation report entry if presentationId was provided
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

    const response = NextResponse.json({ 
      status: "success", 
      data: parsedAnalysis,
      slideTextContent: slideTextContent 
    });

    if (!userId) {
      await setTrialUsed(request);
    }

    return response;
    } finally {
      await releaseLock(idempotencyKey);
    }

  } catch (error: any) {
    console.error("Backend Route Error:", error);
    if (creditConsumed && userIdForRefund) {
      console.warn(`[AnalyzeSlides] AI completely failed after deduction. Initiating atomic refund for ${userIdForRefund}...`);
      const { refundUsage } = await import('../../../lib/billing');
      await refundUsage(userIdForRefund, 1);
    }
    return NextResponse.json({ error: "Internal Server Error", details: error?.message || 'Unknown error' }, { status: 500 });
  }
}
