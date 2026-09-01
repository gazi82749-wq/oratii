// scripts/test-model-slugs.ts
import fs from 'fs';
import path from 'path';

// Load .env.local
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

async function testCerebras() {
  console.log("\n--- Testing Cerebras Slugs ---");
  const slugs = ["llama3.3-70b", "llama3.1-8b", "llama-3.3-70b", "llama3-70b-8192"];
  for (const model of slugs) {
    try {
      const res = await fetch("https://api.cerebras.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.CEREBRAS_API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: "Hi" }],
          temperature: 0.1
        })
      });
      const data = await res.json();
      if (res.ok && data.choices?.[0]?.message?.content) {
        console.log(`✅ Cerebras SUCCESS with model: ${model}`);
        return model;
      } else {
        console.log(`❌ Cerebras failed (${model}): ${res.status} - ${JSON.stringify(data)}`);
      }
    } catch (e: any) {
      console.log(`❌ Cerebras error (${model}): ${e.message}`);
    }
  }
}

async function testGroq() {
  console.log("\n--- Testing Groq Slugs ---");
  const slugs = ["llama3-70b-8192", "llama3-8b-8192", "llama-3.3-70b-specdec", "gemma2-9b-it", "llama-3.2-11b-text-preview"];
  for (const model of slugs) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: "Hi" }],
          temperature: 0.1
        })
      });
      const data = await res.json();
      if (res.ok && data.choices?.[0]?.message?.content) {
        console.log(`✅ Groq SUCCESS with model: ${model}`);
        return model;
      } else {
        console.log(`❌ Groq failed (${model}): ${res.status} - ${JSON.stringify(data.error || data)}`);
      }
    } catch (e: any) {
      console.log(`❌ Groq error (${model}): ${e.message}`);
    }
  }
}

async function testGemini() {
  console.log("\n--- Testing Gemini Slugs ---");
  const slugs = ["gemini-1.5-flash-latest", "gemini-1.5-pro-latest", "gemini-2.0-flash-exp", "gemini-1.5-flash"];
  const apiKey = process.env.GEMINI_API_KEY;
  for (const model of slugs) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Hi" }] }]
        })
      });
      const data = await res.json();
      if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.log(`✅ Gemini SUCCESS with model: ${model}`);
        return model;
      } else {
        console.log(`❌ Gemini failed (${model}): ${res.status} - ${JSON.stringify(data.error || data)}`);
      }
    } catch (e: any) {
      console.log(`❌ Gemini error (${model}): ${e.message}`);
    }
  }
}

async function testOpenRouter() {
  console.log("\n--- Testing OpenRouter Slugs ---");
  const slugs = ["meta-llama/llama-3.3-70b-instruct", "qwen/qwen-2.5-72b-instruct", "deepseek/deepseek-r1", "google/gemini-2.0-flash-lite-001"];
  for (const model of slugs) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: "Hi" }],
          temperature: 0.1
        })
      });
      const data = await res.json();
      if (res.ok && data.choices?.[0]?.message?.content) {
        console.log(`✅ OpenRouter SUCCESS with model: ${model}`);
        return model;
      } else {
        console.log(`❌ OpenRouter failed (${model}): ${res.status} - ${JSON.stringify(data.error || data)}`);
      }
    } catch (e: any) {
      console.log(`❌ OpenRouter error (${model}): ${e.message}`);
    }
  }
}

async function runAll() {
  await testCerebras();
  await testGroq();
  await testGemini();
  await testOpenRouter();
}

runAll();
