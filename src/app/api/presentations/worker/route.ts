import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import JSZip from 'jszip';
import { parseSlideXml, parseNotesXml } from '@/lib/pptxParser';
import { setCache } from '@/lib/idempotency';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

async function parsePdf(buffer: Buffer) {
  try {
    const pdfParse = require('pdf-parse');
    const result = await pdfParse(buffer);
    const rawText = result.text || '';
    const pages = rawText.split(/\f/).map((p: string) => p.trim()).filter(Boolean);
    if (pages.length > 0) return pages;
  } catch (e) {
    console.warn("[parsePdf] pdf-parse fallback:", e);
  }

  try {
    const pdfString = buffer.toString('binary');
    const textMatches = Array.from(pdfString.matchAll(/\(([^)]+)\)\s*Tj/gi));
    const extracted = textMatches.map(m => m[1]).join(' ').replace(/\s+/g, ' ').trim();
    if (extracted && extracted.length > 10) return [extracted];
  } catch (e2) {}

  return ["Presentation Slide Deck Content & Layout"];
}

async function parsePptx(buffer: Buffer) {
  const zip = await JSZip.loadAsync(buffer);
  
  if (!zip.files['[Content_Types].xml'] && !zip.files['ppt/presentation.xml']) {
    throw new Error('Invalid PPTX structure. Missing essential XML components.');
  }

  const slideFiles = Object.keys(zip.files).filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'));
  
  if (slideFiles.length === 0) {
    throw new Error('No slides found in the presentation.');
  }
  
  if (slideFiles.length > 200) {
    throw new Error('Presentation exceeds maximum limit of 200 slides.');
  }

  slideFiles.sort((a, b) => {
    const numA = parseInt(a.match(/slide(\d+)\.xml/i)?.[1] || '0', 10);
    const numB = parseInt(b.match(/slide(\d+)\.xml/i)?.[1] || '0', 10);
    return numA - numB;
  });

  const slideTexts = [];
  let totalExtractedLength = 0;
  const MAX_EXTRACTED_SIZE = 50 * 1024 * 1024; // 50MB max uncompressed XML text limit

  for (const file of slideFiles) {
    const xmlContent = await zip.files[file].async('text');
    totalExtractedLength += xmlContent.length;
    if (totalExtractedLength > MAX_EXTRACTED_SIZE) {
      throw new Error('ZIP Bomb detected: Extracted XML exceeds memory safety limits.');
    }

    let slideText = await parseSlideXml(xmlContent);
    
    const slideNumberMatch = file.match(/slide(\d+)\.xml/i);
    if (slideNumberMatch) {
      const slideNum = slideNumberMatch[1];
      const notesFile = `ppt/notesSlides/notesSlide${slideNum}.xml`;
      const notesFileEntry = zip.files[notesFile];
      if (notesFileEntry) {
        try {
          const notesXmlContent = await notesFileEntry.async('text');
          const notesText = await parseNotesXml(notesXmlContent);
          if (notesText) slideText += `\n[SPEAKER NOTES: ${notesText}]`;
        } catch (e) {}
      }
    }
    if (!slideText) slideText = `Slide ${slideTexts.length + 1}: Visual layout and graphic elements`;
    slideTexts.push(slideText);
  }
  return slideTexts;
}

export async function POST(request: NextRequest) {
  let presentationId = '';
  let userId = '';
  try {
    const secret = request.headers.get('x-worker-secret');
    const expectedSecret = process.env.WORKER_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    presentationId = body.presentationId;
    userId = body.userId;
    const path = body.path;

    if (!path || !presentationId) {
      return NextResponse.json({ error: 'Missing path or presentationId' }, { status: 400 });
    }

    // Download from Supabase
    const { data, error } = await supabase.storage.from('presentations').download(path);
    if (error || !data) {
      await setCache(`job:${presentationId}`, { status: 'failed', error: 'Could not download file.', ownerId: userId }, 3600);
      return NextResponse.json({ error: 'Download failed' }, { status: 500 });
    }

    if (data.size > 15 * 1024 * 1024) {
      await setCache(`job:${presentationId}`, { status: 'failed', error: 'File exceeds maximum allowed size for processing.', ownerId: userId }, 3600);
      return NextResponse.json({ error: 'File too large' }, { status: 413 });
    }

    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Magic Bytes Validation
    const hexSignature = buffer.toString('hex', 0, 4).toUpperCase();
    let isPdf = false;
    let isPpt = false;

    if (hexSignature.startsWith('25504446')) { // %PDF
      isPdf = true;
    } else if (hexSignature.startsWith('504B0304')) { // PK zip format (pptx)
      isPpt = true;
    } else if (hexSignature.startsWith('D0CF11E0')) { // OLE format (older ppt)
      isPpt = true;
    } else {
      await setCache(`job:${presentationId}`, { status: 'failed', error: 'Invalid file signature. Not a valid PDF or PPT.', ownerId: userId }, 3600);
      return NextResponse.json({ error: 'Invalid file format' }, { status: 400 });
    }

    let slideTextContent;
    if (isPdf) {
      slideTextContent = await parsePdf(buffer);
    } else {
      slideTextContent = await parsePptx(buffer);
    }

    // Success
    await setCache(`job:${presentationId}`, { 
      status: 'completed',
      ownerId: userId,
      slideTextContent,
      fileBase64: isPdf ? buffer.toString('base64') : null,
      isPdf
    }, 86400);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Worker error:', error);
    if (presentationId) {
      await setCache(`job:${presentationId}`, { status: 'failed', error: error.message, ownerId: userId }, 3600).catch(()=>{});
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
