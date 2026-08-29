// scripts/test-fallback.ts
import fs from 'fs';
import path from 'path';
import { generateAIContent } from '../src/lib/aiFallback';

// 1. Manually load .env.local variables for the standalone script
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim();
        process.env[key] = val;
      }
    }
  });
}

console.log("\n==========================================");
console.log("🛠️  4-STAGE AI FALLBACK WATERFALL TESTER");
console.log("==========================================");
console.log("1st: Cerebras API Key   :", process.env.CEREBRAS_API_KEY ? `✅ Configured (${process.env.CEREBRAS_API_KEY.slice(0, 7)}...)` : "⚪ Empty (Will skip)");
console.log("2nd: Groq API Key       :", process.env.GROQ_API_KEY ? `✅ Configured (${process.env.GROQ_API_KEY.slice(0, 7)}...)` : "⚪ Empty (Will skip)");
console.log("3rd: Gemini API Key     :", process.env.GEMINI_API_KEY ? `✅ Configured (${process.env.GEMINI_API_KEY.slice(0, 7)}...)` : "⚪ Empty (Will skip)");
console.log("4th: OpenRouter API Key :", process.env.OPENROUTER_API_KEY ? `✅ Configured (${process.env.OPENROUTER_API_KEY.slice(0, 7)}...)` : "⚪ Empty (Will skip)");
console.log("==========================================\n");

async function runTest() {
  try {
    console.log("🚀 Testing 4-Stage Fallback Engine with sample JSON request...\n");
    const startTime = Date.now();

    const response = await generateAIContent({
      systemPrompt: "You are an AI assistant. Return your response ONLY as a valid JSON object with a single field 'status' set to 'success' and 'message' set to 'Fallback waterfall working perfectly!'",
      userPrompt: "Test request to confirm AI fallback waterfall.",
      temperature: 0.1
    });

    const elapsed = Date.now() - startTime;
    console.log(`\n🎉 SUCCESS in ${elapsed}ms! Response received:`);
    console.log("------------------------------------------");
    console.log(response);
    console.log("------------------------------------------\n");
  } catch (error: any) {
    console.error("\n❌ Test Failed with error:");
    console.error(error.message || error);
  }
}

runTest();
