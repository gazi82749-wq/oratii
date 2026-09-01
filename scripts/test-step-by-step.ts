// scripts/test-step-by-step.ts
import fs from 'fs';
import path from 'path';
import { generateAIContent } from '../src/lib/aiFallback';

// Load .env.local variables
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

console.log("\n==================================================");
console.log("🧪 STEP-BY-STEP AI MODEL PROVIDER VERIFICATION");
console.log("==================================================");
console.log("1. Cerebras Key   :", process.env.CEREBRAS_API_KEY ? `✅ Configured (${process.env.CEREBRAS_API_KEY.slice(0, 6)}...)` : "⚪ Not set");
console.log("2. Groq Key       :", process.env.GROQ_API_KEY ? `✅ Configured (${process.env.GROQ_API_KEY.slice(0, 6)}...)` : "⚪ Not set");
console.log("3. Gemini Key     :", process.env.GEMINI_API_KEY ? `✅ Configured (${process.env.GEMINI_API_KEY.slice(0, 6)}...)` : "⚪ Not set");
console.log("4. OpenRouter Key :", process.env.OPENROUTER_API_KEY ? `✅ Configured (${process.env.OPENROUTER_API_KEY.slice(0, 6)}...)` : "⚪ Not set");
console.log("==================================================\n");

async function runStepByStepTest() {
  const providers = [
    { name: "Cerebras (Llama-3.3-70b)", disable: ['groq', 'gemini', 'openrouter'] },
    { name: "Groq (Llama-3.3-70b-versatile)", disable: ['cerebras', 'gemini', 'openrouter'] },
    { name: "Gemini (Gemini-2.0-flash)", disable: ['cerebras', 'groq', 'openrouter'] },
    { name: "OpenRouter (Llama-3.3-70b-instruct:free)", disable: ['cerebras', 'groq', 'gemini'] },
    { name: "Full 4-Stage Fallback Waterfall", disable: [] }
  ];

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    console.log(`\n--------------------------------------------------`);
    console.log(`▶ STEP ${i + 1}: Testing ${provider.name}...`);
    console.log(`--------------------------------------------------`);

    const start = Date.now();
    try {
      const response = await generateAIContent({
        systemPrompt: "You are an AI model tester. Respond ONLY with valid JSON: {\"provider\": \"" + provider.name + "\", \"status\": \"working\"}",
        userPrompt: "Confirm model status.",
        temperature: 0.1,
        disableProviders: provider.disable as any
      });

      const duration = Date.now() - start;
      console.log(`✅ STEP ${i + 1} PASSED (${duration}ms)!`);
      console.log(`   Response Payload:`, response.trim().replace(/\n/g, ' '));
    } catch (err: any) {
      console.error(`❌ STEP ${i + 1} FAILED:`, err.message || err);
    }
  }

  console.log("\n==================================================");
  console.log("🎉 ALL STEP-BY-STEP TESTS COMPLETED!");
  console.log("==================================================\n");
}

runStepByStepTest();
