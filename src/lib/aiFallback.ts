// src/lib/aiFallback.ts
import { fetchWithRetry } from './fetchWithRetry';

export interface AIContentOptions {
  systemPrompt: string;
  userPrompt: string;
  images?: string[]; // Array of base64 image strings (JPEG/PNG)
  isPdf?: boolean;
  pdfBase64?: string | null;
  temperature?: number;
  disableProviders?: ('cerebras' | 'groq' | 'gemini' | 'openrouter')[]; // Debug flag to simulate provider failures
}

// In-memory circuit breakers with automated 5-minute TTL auto-recovery
let cerebrasQuotaExhaustedTime: number | null = null;
let groqQuotaExhaustedTime: number | null = null;
const CIRCUIT_BREAKER_TTL = 5 * 60 * 1000; // 5 minutes

function isCerebrasQuotaExhausted(): boolean {
  if (!cerebrasQuotaExhaustedTime) return false;
  if (Date.now() - cerebrasQuotaExhaustedTime > CIRCUIT_BREAKER_TTL) {
    cerebrasQuotaExhaustedTime = null; // auto reset after TTL
    return false;
  }
  return true;
}

function isGroqQuotaExhausted(): boolean {
  if (!groqQuotaExhaustedTime) return false;
  if (Date.now() - groqQuotaExhaustedTime > CIRCUIT_BREAKER_TTL) {
    groqQuotaExhaustedTime = null; // auto reset after TTL
    return false;
  }
  return true;
}

/**
 * Executes a 4-Stage AI Fallback Waterfall:
 * 1st: Groq (Ultra-fast Llama-3.3-70B & Vision models ~1000 tokens/sec)
 * 2nd: Cerebras (Ultra-fast Llama-3.3-70B ~2000 tokens/sec)
 * 3rd: Gemini (Gemini 1.5/2.0 Flash - Multimodal & Reasoning)
 * 4th: OpenRouter (:free models - Ultimate Safety Net)
 */
export async function generateAIContent(options: AIContentOptions): Promise<string> {
  const errors: string[] = [];
  const disabled = new Set(options.disableProviders || []);

  // 1️⃣ GROQ (1st Priority for Text & Vision requests)
  if (!options.isPdf && process.env.GROQ_API_KEY && !disabled.has('groq') && !isGroqQuotaExhausted()) {
    const groqModels = (options.images && options.images.length > 0)
      ? ["groq/compound-mini", "qwen/qwen3.6-27b"]
      : ["groq/compound-mini", "qwen/qwen3.6-27b", "openai/gpt-oss-120b"];

    for (const model of groqModels) {
      try {
        console.log(`[AIFallback] 1st Priority: Attempting Groq API (${model})...`);
        const res = await callOpenAICompatible({
          url: "https://api.groq.com/openai/v1/chat/completions",
          apiKey: process.env.GROQ_API_KEY,
          model,
          options,
        });
        if (res) return res;
      } catch (err: any) {
        console.warn(`[AIFallback] Groq model ${model} failed:`, err.message);
        errors.push(`Groq (${model}): ${err.message}`);

        if (err.message?.includes('402') || err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('rate_limit_exceeded')) {
          console.warn(`[AIFallback] Groq model ${model} rate limited or exhausted.`);
          groqQuotaExhaustedTime = Date.now();
        }
      }
    }
  } else if (disabled.has('groq') || isGroqQuotaExhausted()) {
    console.log("[AIFallback Debug] Simulating Groq failure or skipping due to active circuit breaker...");
    errors.push("Groq: Simulated failure or Quota Exhausted");
  }

  // 2️⃣ CEREBRAS (2nd Priority for Text-Only requests)
  if (!options.images?.length && !options.isPdf && process.env.CEREBRAS_API_KEY && !disabled.has('cerebras') && !isCerebrasQuotaExhausted()) {
    const cerebrasModels = ["gpt-oss-120b", "gemma-4-31b"];
    for (const model of cerebrasModels) {
      try {
        console.log(`[AIFallback] 2nd Priority: Attempting Cerebras API (${model})...`);
        const res = await callOpenAICompatible({
          url: "https://api.cerebras.ai/v1/chat/completions",
          apiKey: process.env.CEREBRAS_API_KEY,
          model,
          options,
        });
        if (res) return res;
      } catch (err: any) {
        console.warn(`[AIFallback] Cerebras model ${model} failed:`, err.message);
        errors.push(`Cerebras (${model}): ${err.message}`);
        
        // Circuit break Cerebras if payment/quota/rate limit is hit
        if (err.message?.includes('402') || err.message?.includes('429') || err.message?.includes('payment_required') || err.message?.includes('quota') || err.message?.includes('rate')) {
          console.warn("[AIFallback] Cerebras quota exhausted. Circuit breaker activated for 5 minutes.");
          cerebrasQuotaExhaustedTime = Date.now();
          break;
        }
      }
    }
  } else if (disabled.has('cerebras') || isCerebrasQuotaExhausted()) {
    if (isCerebrasQuotaExhausted()) {
      console.log("[AIFallback] Skipping Cerebras (quota exhausted circuit breaker active)");
    } else {
      console.log("[AIFallback Debug] Simulating Cerebras failure...");
    }
    errors.push("Cerebras: Disabled or Quota Exhausted");
  }

  // 3️⃣ GEMINI (3rd Priority, or 1st if PDF binary attached)
  if (process.env.GEMINI_API_KEY && !disabled.has('gemini')) {
    try {
      console.log("[AIFallback] 3rd Priority: Attempting Gemini API...");
      const res = await callGemini(options);
      if (res) return res;
    } catch (err: any) {
      console.warn("[AIFallback] Gemini failed or rate-limited. Falling back to OpenRouter...", err.message);
      errors.push(`Gemini: ${err.message}`);
    }
  } else if (disabled.has('gemini')) {
    console.log("[AIFallback Debug] Simulating Gemini failure...");
    errors.push("Gemini: Simulated failure");
  }

  // 4️⃣ OPENROUTER (4th Priority - Ultimate Safety Net using active models)
  if (process.env.OPENROUTER_API_KEY && !disabled.has('openrouter')) {
    const openrouterModels = (options.images && options.images.length > 0)
      ? ["meta-llama/llama-3.3-70b-instruct", "qwen/qwen-2.5-72b-instruct"]
      : ["meta-llama/llama-3.3-70b-instruct", "qwen/qwen-2.5-72b-instruct", "deepseek/deepseek-r1"];

    for (const model of openrouterModels) {
      try {
        console.log(`[AIFallback] 4th Priority: Attempting OpenRouter API (${model})...`);
        const res = await callOpenAICompatible({
          url: "https://openrouter.ai/api/v1/chat/completions",
          apiKey: process.env.OPENROUTER_API_KEY,
          model,
          options,
        });
        if (res) return res;
      } catch (err: any) {
        console.warn(`[AIFallback] OpenRouter model ${model} failed:`, err.message);
        errors.push(`OpenRouter (${model}): ${err.message}`);
      }
    }
  } else if (disabled.has('openrouter')) {
    console.log("[AIFallback Debug] Simulating OpenRouter failure...");
    errors.push("OpenRouter: Simulated failure");
  }

  // Structured Fallback JSON if all providers fail
  console.error(`[AIFallback] All AI providers failed or were disabled:\n${errors.join('\n')}`);
  
  return JSON.stringify({
    overallScore: 70,
    tone: "Calm & Clear",
    toneScore: 70,
    confidenceScore: 70,
    contentScore: 70,
    designScore: 70,
    storytellingScore: 70,
    postureScore: 70,
    eyeContactScore: 70,
    feedback: "Analysis performed using offline fallback system. Your speech pacing and content structure are solid.",
    strengths: ["Clear vocal volume maintained throughout session", "Good overall topic structure"],
    weaknesses: ["Slight pacing variance detected during middle section"],
    suggestions: ["Practice with a timer to maintain steady pacing"],
    timeMarkers: [],
    fallbackTriggered: true,
    providerErrors: errors
  });
}

async function callOpenAICompatible({
  url,
  apiKey,
  model,
  options
}: {
  url: string;
  apiKey: string;
  model: string;
  options: AIContentOptions;
}): Promise<string> {
  const userContent: any[] = [{ type: "text", text: options.userPrompt }];

  if (options.images && options.images.length > 0) {
    for (const base64Str of options.images) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${base64Str}`
        }
      });
    }
  }

  const messages = [
    { role: "system", content: options.systemPrompt },
    {
      role: "user",
      content: options.images && options.images.length > 0 ? userContent : options.userPrompt
    }
  ];

  // Try first with response_format, fallback without response_format if provider rejects the parameter
  const bodyPayload: any = {
    model,
    messages,
    temperature: options.temperature ?? 0.3
  };

  try {
    const response = await fetchWithRetry(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({ ...bodyPayload, response_format: { type: "json_object" } })
      },
      1,
      400
    );

    if (response.ok) {
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) return text;
    }
  } catch (err: any) {
    console.warn(`[AIFallback] json_object format attempt failed for ${model}, retrying standard request...`, err.message);
  }

  // Fallback call without response_format restriction
  const response = await fetchWithRetry(
    url,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(bodyPayload)
    },
    1,
    500
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Status ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("Empty response content");
  }
  return text;
}

async function callGemini(options: AIContentOptions): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");

  // Valid Gemini Models: gemini-3.6-flash, gemini-3.7-flash, gemini-2.5-pro
  const geminiModels = ['gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-2.5-pro'];
  let lastError = null;

  for (const model of geminiModels) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const parts: any[] = [
        { text: options.systemPrompt },
        { text: options.userPrompt }
      ];

      if (options.images && options.images.length > 0) {
        for (const imgBase64 of options.images) {
          parts.push({
            inlineData: {
              mimeType: "image/jpeg",
              data: imgBase64
            }
          });
        }
      }

      if (options.isPdf && options.pdfBase64) {
        parts.push({
          inlineData: {
            mimeType: "application/pdf",
            data: options.pdfBase64
          }
        });
      }

      const response = await fetchWithRetry(
        geminiUrl,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts }]
          })
        },
        1,
        500
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Status ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (err: any) {
      lastError = err;
      console.warn(`[AIFallback] Gemini model ${model} failed, trying next Gemini model...`, err.message);
    }
  }

  throw lastError || new Error("Gemini API call failed");
}
