import { parseSlideXml, parseNotesXml } from '../pptxParser';

describe('PPTX Parser (fast-xml-parser)', () => {
  it('PASS: Parses normal text from a slide', async () => {
    const xml = `
      <p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
        <p:cSld>
          <p:spTree>
            <p:sp>
              <p:txBody>
                <a:p>
                  <a:r><a:t>Hello World</a:t></a:r>
                </a:p>
              </p:txBody>
            </p:sp>
          </p:spTree>
        </p:cSld>
      </p:sld>
    `;
    const result = await parseSlideXml(xml);
    expect(result.trim()).toBe('Hello World');
  });

  it('PASS: Merges text split across multiple runs', async () => {
    const xml = `
      <p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
        <p:cSld>
          <p:spTree>
            <p:sp>
              <p:txBody>
                <a:p>
                  <a:r><a:t>Hello </a:t></a:r>
                  <a:r><a:t>Split </a:t></a:r>
                  <a:r><a:t>World</a:t></a:r>
                </a:p>
              </p:txBody>
            </p:sp>
          </p:spTree>
        </p:cSld>
      </p:sld>
    `;
    const result = await parseSlideXml(xml);
    expect(result.trim()).toBe('Hello Split World');
  });

  it('PASS: Parses notes from notes slides without mixing into slide text', async () => {
    const notesXml = `
      <p:notes xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
        <p:cSld>
          <p:spTree>
            <p:sp>
              <p:txBody>
                <a:p>
                  <a:r><a:t>These are speaker notes</a:t></a:r>
                </a:p>
              </p:txBody>
            </p:sp>
          </p:spTree>
        </p:cSld>
      </p:notes>
    `;
    const result = await parseNotesXml(notesXml);
    expect(result.trim()).toBe('These are speaker notes');
  });

  it('PASS: Handles empty slides safely', async () => {
    const xml = `
      <p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
        <p:cSld><p:spTree></p:spTree></p:cSld>
      </p:sld>
    `;
    const result = await parseSlideXml(xml);
    expect(result.trim()).toBe('');
  });

  it('PASS: Parses tables (a:tbl)', async () => {
    const xml = `
      <p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
        <p:cSld>
          <p:spTree>
            <p:graphicFrame>
              <a:graphic>
                <a:graphicData>
                  <a:tbl>
                    <a:tr>
                      <a:tc><a:txBody><a:p><a:r><a:t>Cell 1</a:t></a:r></a:p></a:txBody></a:tc>
                      <a:tc><a:txBody><a:p><a:r><a:t>Cell 2</a:t></a:r></a:p></a:txBody></a:tc>
                    </a:tr>
                  </a:tbl>
                </a:graphicData>
              </a:graphic>
            </p:graphicFrame>
          </p:spTree>
        </p:cSld>
      </p:sld>
    `;
    const result = await parseSlideXml(xml);
    expect(result).toContain('Cell 1');
    expect(result).toContain('Cell 2');
  });
});
