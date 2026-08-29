const fs = require('fs');

const transcriptPath = 'C:/Users/Gazi Abbas/.gemini/antigravity-ide/brain/d07610ec-1451-48e7-970b-dd5316ce1e5e/.system_generated/logs/transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

let fullFileContent = '';

for (const line of lines) {
  if (!line) continue;
  try {
    const parsed = JSON.parse(line);
    // Look for tool execution results or responses
    if (parsed.type === 'TOOL_CALL_RESULT' || parsed.type === 'MODEL_RESPONSE' || parsed.content) {
      if (typeof parsed.content === 'string' && parsed.content.includes('Showing lines 1 to ') && parsed.content.includes('HomeClient.tsx')) {
        // Extract the code block
        const content = parsed.content;
        const startIdx = content.indexOf('1:');
        const endIdx = content.indexOf('The above content');
        
        if (startIdx !== -1) {
          const rawCode = content.substring(startIdx, endIdx !== -1 ? endIdx : undefined);
          
          // Remove the line numbers "1: ", "2: ", etc.
          const cleanedCode = rawCode.split('\n').map(l => {
            const match = l.match(/^\d+:\s?(.*)$/);
            return match ? match[1] : l;
          }).join('\n');
          
          fs.writeFileSync('C:/Users/Gazi Abbas/ppt-analyzer/src/app/HomeClient_restored.tsx', cleanedCode);
          console.log('Restored to HomeClient_restored.tsx');
          process.exit(0);
        }
      }
    }
  } catch(e) {
    // Ignore parsing errors for malformed lines
  }
}
console.log('Could not find the initial file state in transcript.');
