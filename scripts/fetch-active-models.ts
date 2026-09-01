// scripts/fetch-active-models.ts
import fs from 'fs';
import path from 'path';

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

async function fetchCerebrasModels() {
  console.log("\n==========================================");
  console.log("🔍 FETCHING CEREBRAS ACTIVE MODELS");
  console.log("==========================================");
  try {
    const res = await fetch("https://api.cerebras.ai/v1/models", {
      headers: { "Authorization": `Bearer ${process.env.CEREBRAS_API_KEY}` }
    });
    const data = await res.json();
    if (data.data) {
      console.log("Active Cerebras Models:", data.data.map((m: any) => m.id));
    } else {
      console.log("Cerebras Models Response:", data);
    }
  } catch (e: any) {
    console.error("Cerebras Models Error:", e.message);
  }
}

async function fetchGroqModels() {
  console.log("\n==========================================");
  console.log("🔍 FETCHING GROQ ACTIVE MODELS");
  console.log("==========================================");
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}` }
    });
    const data = await res.json();
    if (data.data) {
      console.log("Active Groq Models:", data.data.map((m: any) => m.id));
    } else {
      console.log("Groq Models Response:", data);
    }
  } catch (e: any) {
    console.error("Groq Models Error:", e.message);
  }
}

async function fetchGeminiModels() {
  console.log("\n==========================================");
  console.log("🔍 FETCHING GEMINI ACTIVE MODELS");
  console.log("==========================================");
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await res.json();
    if (data.models) {
      console.log("Active Gemini Models:", data.models.map((m: any) => m.name.replace('models/', '')));
    } else {
      console.log("Gemini Models Response:", data);
    }
  } catch (e: any) {
    console.error("Gemini Models Error:", e.message);
  }
}

async function run() {
  await fetchCerebrasModels();
  await fetchGroqModels();
  await fetchGeminiModels();
}

run();
