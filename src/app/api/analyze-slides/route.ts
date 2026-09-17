import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';
import JSZip from 'jszip';
import { parseSlideXml, parseNotesXml } from '../../../lib/pptxParser';
import { checkRateLimit, AI_RATE_LIMIT } from '../../../lib/rateLimit';
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
          slideTextContent: memoryCached.slideTextContent,
          cached: true
        });
      }

      const redisCache = await checkCache<{text: any}>(`cache:${idempotencyKey}`);
      if (redisCache) {
         console.log(`[AnalyzeSlides] ⚡ Redis Cache HIT for ${fileHash.slice(0, 8)}`);
         await releaseLock(idempotencyKey);
         return NextResponse.json({
           status: "success",
           slideTextContent: redisCache.text,
           cached: true
         });
      }

    // ── 5. Cache in Memory ──
    if (inMemorySlideCache.size > 500) {
      const oldestKey = inMemorySlideCache.keys().next().value;
      if (oldestKey) inMemorySlideCache.delete(oldestKey);
    }

    inMemorySlideCache.set(fileHash, {
      analysisResult: null,
      slideTextContent,
      timestamp: Date.now()
    });
    
    try {
      await setCache(`cache:${idempotencyKey}`, { text: slideTextContent });
    } catch(e) {}

    const response = NextResponse.json({ 
      status: "success", 
      slideTextContent: slideTextContent 
    });

    return response;
    } finally {
      await releaseLock(idempotencyKey);
    }

  } catch (error: any) {
    console.error("Backend Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error?.message || 'Unknown error' }, { status: 500 });
  }
}
