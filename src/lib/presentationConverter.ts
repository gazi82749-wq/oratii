// src/lib/presentationConverter.ts

/**
 * Dynamically loads pdf.js from CDN to avoid Next.js SSR and webpack worker bundling issues.
 */
function loadPdfJs() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('PDF processing is only supported in browser environment.'));
      return;
    }
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      try {
        const workerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const workerBlob = new Blob([`importScripts('${workerUrl}');`], { type: 'application/javascript' });
        (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(workerBlob);
      } catch {
        (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      resolve((window as any).pdfjsLib);
    };
    script.onerror = (err) => {
      reject(new Error('Failed to load pdf.js from CDN: ' + ((err as any)?.message || String(err))));
    };
    document.body.appendChild(script);
  });
}

/**
 * Converts a presentation file (PDF or PPT/PPTX) into a unified format:
 * Array of { slideNumber: number, text: string, image: string }
 *
 * @param {File} file - The file uploaded by the user.
 * @returns {Promise<Array<{slideNumber: number, text: string, image: string}>>}
 */
import { supabase } from './supabaseClient';

export async function convertPresentation(file: File) {
  const extension = file.name.split('.').pop().toLowerCase();

  if (extension === 'pdf') {
    const pdfjsLib = await loadPdfJs() as any;
    const arrayBuffer = await (file.slice ? file.slice(0) : file).arrayBuffer();
    
    // Load the document using the typed array with CMap support for complex fonts
    const loadingTask = pdfjsLib.getDocument({ 
      data: new Uint8Array(arrayBuffer),
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
      cMapPacked: true
    });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const slidePromises = Array.from({ length: numPages }, async (_, index) => {
      const i = index + 1;
      let extractedText = '';
      let base64Image = '';
      
      try {
        const page = await pdf.getPage(i);
      
        // 1. Render slide page to high-quality image on a hidden canvas (scale 1.0 is fast and crisp for thumbnails)
        const viewport = page.getViewport({ scale: 1.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        await page.render(renderContext).promise;
        base64Image = canvas.toDataURL('image/jpeg', 0.75); // fast optimized jpeg thumbnail

        // 2. Extract text content from the page
        const textContent = await page.getTextContent();
        const textItems = textContent.items.map((item: any) => item.str);
        extractedText = textItems.join(' ').replace(/\s+/g, ' ').trim();

      } catch (err: any) {
        console.warn(`Failed to render slide ${i}:`, err);
        // Fallback if rendering fails for a specific slide
        base64Image = ''; 
      }

      return {
        slideNumber: i,
        text: extractedText || `Slide ${i} (No text content)`,
        image: base64Image
      };
    });

    const slides = await Promise.all(slidePromises);
    // Ensure slides are sorted by slide number just in case Promise.all resolves them out of order (though it shouldn't)
    slides.sort((a, b) => a.slideNumber - b.slideNumber);

    return slides;
  } else if (extension === 'pptx' || extension === 'ppt') {
    const formData = new FormData();
    formData.append('file', file);
    
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = {};
    if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

    const res = await fetch('/api/convert-pptx', {
      method: 'POST',
      headers,
      body: formData
    });
    
    if (!res.ok) {
      let errorMessage = `Failed to convert PPTX to PDF (${res.status})`;
      try {
        const errorData = await res.json();
        if (errorData.error) errorMessage = errorData.error;
      } catch (e) {}
      throw new Error(errorMessage);
    }
    
    const pdfBlob = await res.blob();
    const pdfFile = new File([pdfBlob], file.name.replace(/\.pptx?$/i, '.pdf'), { type: 'application/pdf' });
    
    // Recursively call convertPresentation on the newly generated PDF file
    return convertPresentation(pdfFile);
  } else {
    throw new Error(`Unsupported file type: .${extension}`);
  }
}
