import { XMLParser } from 'fast-xml-parser';

export async function parseSlideXml(xmlContent: string): Promise<string> {
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: false,
    processEntities: true,
    preserveOrder: true,
    htmlEntities: true,
    trimValues: false
  });

  let slideText = '';
  try {
    const parsed = parser.parse(xmlContent);
    slideText = extractText(parsed).replace(/\s+/g, ' ').trim();
  } catch(e) {
    console.warn("Failed to parse slide XML", e);
  }
  return slideText;
}

export async function parseNotesXml(xmlContent: string): Promise<string> {
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: false,
    processEntities: true,
    preserveOrder: true,
    htmlEntities: true,
    trimValues: false
  });

  let notesText = '';
  try {
    const parsed = parser.parse(xmlContent);
    notesText = extractText(parsed).replace(/\s+/g, ' ').trim();
  } catch(e) {
    console.warn("Failed to parse notes XML", e);
  }
  return notesText;
}

function extractText(node: any): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractText).join('');
  }
  if (typeof node === 'object' && node !== null) {
    let text = '';
    for (const key of Object.keys(node)) {
      if (key === ':@') continue;
      if (key === '#text') {
        text += node[key];
      } else {
        const childText = extractText(node[key]);
        if (childText) {
           text += (key === 'a:p' ? childText + ' ' : childText);
        }
      }
    }
    return text;
  }
  return '';
}
