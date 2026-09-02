import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request) {
  try {
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

    const secret = process.env.CONVERT_API_SECRET;
    
    if (!secret) {
      console.warn("No CONVERT_API_SECRET found. Please sign up for a free key at convertapi.com");
      return NextResponse.json({ error: "Conversion API Key Missing. Add CONVERT_API_SECRET to .env.local for PPTX auto-conversion." }, { status: 500 });
    }

    const convertFormData = new FormData();
    convertFormData.append('File', file);

    const convertRes = await fetch(`https://v2.convertapi.com/convert/pptx/to/pdf?Secret=${secret}`, {
      method: 'POST',
      body: convertFormData
    });

    if (!convertRes.ok) {
      const errorText = await convertRes.text();
      return NextResponse.json({ error: `Conversion failed: ${errorText}` }, { status: 500 });
    }

    const data = await convertRes.json();
    const pdfBase64 = data.Files[0].FileData;
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="converted.pdf"'
      }
    });

  } catch (error) {
    console.error("PPTX Conversion Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
