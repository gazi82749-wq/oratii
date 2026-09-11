import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, CONVERT_RATE_LIMIT } from '../../../lib/rateLimit';
import { supabase } from '../../../lib/supabaseClient';
import { hasUsedTrial } from '../../../lib/trialManager';
import { execFile } from 'child_process';
import { writeFile, readFile, unlink, mkdtemp } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * ConvertAPI → LibreOffice fallback strategy:
 * 1. Try ConvertAPI first (fast, high quality, but limited free quota)
 * 2. If ConvertAPI fails (quota exhausted / error), fall back to LibreOffice headless (free, unlimited)
 */

async function convertWithConvertApi(file: Blob): Promise<Buffer | null> {
  const secret = process.env.CONVERT_API_SECRET;
  if (!secret) return null;

  try {
    const convertFormData = new FormData();
    convertFormData.append('File', file);

    const convertRes = await fetch(`https://v2.convertapi.com/convert/pptx/to/pdf?Secret=${secret}`, {
      method: 'POST',
      body: convertFormData
    });

    if (!convertRes.ok) {
      const errorText = await convertRes.text();
      console.warn('[ConvertAPI] Conversion failed, will try LibreOffice fallback:', errorText);
      return null;
    }

    const data = await convertRes.json();
    const pdfBase64 = data.Files[0].FileData;
    return Buffer.from(pdfBase64, 'base64');
  } catch (err: any) {
    console.warn('[ConvertAPI] Error, falling back to LibreOffice:', err.message);
    return null;
  }
}

async function convertWithLibreOffice(file: Blob, fileName: string): Promise<Buffer | null> {
  let tempDir: string | null = null;

  try {
    // Create a temp directory for the conversion
    tempDir = await mkdtemp(join(tmpdir(), 'oratii-convert-'));
    const inputPath = join(tempDir, fileName);
    
    // Write the uploaded file to disk
    const arrayBuffer = await file.arrayBuffer();
    await writeFile(inputPath, Buffer.from(arrayBuffer));

    // Run LibreOffice headless conversion
    // soffice command: converts PPTX to PDF in the same directory
    const sofficePath = process.platform === 'win32' 
      ? 'C:\\Program Files\\LibreOffice\\program\\soffice.exe'
      : 'soffice';

    await execFileAsync(sofficePath, [
      '--headless',
      '--convert-to', 'pdf',
      '--outdir', tempDir,
      inputPath
    ], { timeout: 45000 }); // 45 second timeout

    // Read the output PDF
    const pdfFileName = fileName.replace(/\.pptx?$/i, '.pdf');
    const pdfPath = join(tempDir, pdfFileName);
    const pdfBuffer = await readFile(pdfPath);

    return pdfBuffer;
  } catch (err: any) {
    console.error('[LibreOffice] Conversion failed:', err.message);
    return null;
  } finally {
    // Clean up temp files
    if (tempDir) {
      try {
        const fs = await import('fs/promises');
        const files = await fs.readdir(tempDir);
        for (const f of files) {
          await unlink(join(tempDir, f)).catch(() => {});
        }
        await fs.rmdir(tempDir).catch(() => {});
      } catch { /* ignore cleanup errors */ }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (3 conversions per minute)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.ip || 'unknown';
    const rateResult = checkRateLimit(`convert:${ip}`, CONVERT_RATE_LIMIT);
    if (!rateResult.allowed) {
      return NextResponse.json({
        error: "Too Many Requests",
        message: `Please wait ${rateResult.retryAfterSeconds} seconds before trying again. Limit: 3 conversions per minute.`
      }, { status: 429 });
    }

    // Authentication & Trial verification
    let userId: string | null = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.substring(7).trim());
      if (user) userId = user.id;
    }

    if (!userId) {
      if (await hasUsedTrial(request)) {
        return NextResponse.json({ 
          error: "Free trial limit reached. Please sign in to convert presentations.", 
          authRequired: true, 
          trialExpired: true 
        }, { status: 401 });
      }
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: "File missing!" }, { status: 400 });
    }

    // 25MB Max file size limit to prevent memory exhaustion / DoS
    const MAX_FILE_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 25MB limit." }, { status: 400 });
    }

    // Strategy: Try ConvertAPI first, fall back to LibreOffice
    let pdfBuffer = await convertWithConvertApi(file);

    if (!pdfBuffer) {
      // ConvertAPI failed — try LibreOffice headless
      pdfBuffer = await convertWithLibreOffice(file, file.name || 'presentation.pptx');
    }

    if (!pdfBuffer) {
      return NextResponse.json({ 
        error: "Conversion failed. Both ConvertAPI and LibreOffice were unable to process this file. Please try uploading a PDF instead." 
      }, { status: 500 });
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="converted.pdf"'
      }
    });

  } catch (error: any) {
    console.error("PPTX Conversion Error:", error);
    return NextResponse.json({ error: "Conversion failed. Please try uploading a PDF instead.", details: error.message }, { status: 500 });
  }
}
