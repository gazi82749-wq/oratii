import { NextRequest, NextResponse } from 'next/server';
import { generateAIContent } from '../../../lib/aiFallback';
import { getDynamicPrompt } from '../../../lib/getDynamicPrompt';
import { checkAndDecrementUsage } from '../../../lib/billing';
import { withAuthAndRateLimit } from '../../../lib/apiWrapper';
import { supabase } from '../../../lib/supabaseClient';

export const dynamic = 'force-dynamic';

export const POST = withAuthAndRateLimit(async (request, { user, ip }) => {
  let creditConsumed = false;
  let userIdForRefund: string | null = null;
  let idempotencyKey = '';
  const userId = user.id;

  try {
    const {
      chatHistory,
      currentAnswer,
      userId: bodyUserId,
      examinerTone = 'friendly',
      slideAnalysisData = null,
      topic: bodyTopic = null,
      language = 'en',
      interviewType = 'academic_viva', // 'academic_viva' | 'presentation_defense' | 'job_interview'
      difficultyLevel = 'fresher', // 'fresher' | 'pro'
      documentContext = '', // Extracted resume/CV or question paper text
      mode = 'text' // 'text' | 'voice'
    } = await request.json();

    // Extract topic name or candidate role FIRST to use in hash
    let topicName = (bodyTopic || '').trim();
    if (!topicName && chatHistory && chatHistory.length > 0) {
      const firstQ = chatHistory[0]?.question || '';
      if (firstQ.includes('Provide Context:')) {
        topicName = firstQ
          .replace(/^Provide Context:\s*(Official Viva Voce defense topic:|General viva defense for topic:|Here is the presentation deck summary to ground your viva defense questions:)?\s*/i, '')
          .trim();
      }
    }
    if (!topicName) {
      topicName = interviewType === 'job_interview' ? 'General Tech/Professional Role' : 'General Presentation Topic';
    }

    // Determine current question turn count (excluding initial context prompt)
    const validTurns = (chatHistory || []).filter(
      (h: any) => h.question && !h.question.startsWith('Provide Context:')
    );
    const currentQuestionIndex = validTurns.length + 1;

    const crypto = await import('crypto');
    const promptVersion = 'v1_viva';
    // Hash includes the exact chat history and current answer to prevent double-submitting a turn
    const hashString = `${JSON.stringify(chatHistory || [])}|${currentAnswer || ''}|${topicName}|${promptVersion}`;
    const fileHash = crypto.createHash('sha256').update(hashString).digest('hex');
    idempotencyKey = `viva:${userId}:${fileHash}`;
    
    const { acquireLock, releaseLock, checkCache, setCache } = await import('../../../lib/idempotency');
    
    // 1. Read-only fast cache check
    const fastCache = await checkCache<any>(`cache:${idempotencyKey}`);
    if (fastCache) {
      return NextResponse.json(fastCache);
    }

    // 2. Acquire lock
    const isLocked = await acquireLock(idempotencyKey);
    if (!isLocked) {
      return NextResponse.json({ error: "Request is already processing. Please wait a moment." }, { status: 429 });
    }

    try {
      // 3. Double-checked locking
      const redisCache = await checkCache<any>(`cache:${idempotencyKey}`);
      if (redisCache) {
        await releaseLock(idempotencyKey);
        return NextResponse.json(redisCache);
      }

      // Deduct usage session credit only on the first turn of a viva session
      if (currentQuestionIndex === 1) {
        const usageCheck = await checkAndDecrementUsage(userId, 'viva_sessions_count');
        if (!usageCheck.allowed) {
          await releaseLock(idempotencyKey);
          return NextResponse.json({
            error: "Credits Exhausted",
            message: "You've used all your credits. Purchase more credits to continue.",
            creditExhausted: true
          }, { status: 403 });
        }
        creditConsumed = true;
        userIdForRefund = userId;
      }



    const hasDocument = Boolean(documentContext && documentContext.trim().length > 0);
    const hasSlides = Boolean(slideAnalysisData);

    let documentInstruction = '';
    if (hasDocument) {
      documentInstruction = `CANDIDATE DOCUMENT CONTEXT (Resume / CV / Exam Syllabus):\n${documentContext.slice(0, 3000)}\n
CRITICAL DIRECTIVE: You MUST reference specific projects, technical skills, job titles, or exam topics mentioned in the candidate's document during the interview discussion.`;
    } else if (hasSlides) {
      documentInstruction = `SLIDE-AWARE MODE: Presentation slide data provided:\n${JSON.stringify(slideAnalysisData, null, 2)}`;
    }

    const isFresher = difficultyLevel === 'fresher' || difficultyLevel === 'junior';
    const isBpoOrVoice = /bpo|customer|voice/i.test(topicName);
    const isIelts = /ielts|speaking/i.test(topicName);
    const isMba = /mba|consulting|strategy/i.test(topicName);

    let targetStage = 'icebreaker';
    let stageInstructions = '';

    if (interviewType === 'job_interview') {
      if (currentQuestionIndex === 1) {
        targetStage = 'icebreaker';
        stageInstructions = `
          STAGE 1: ICEBREAKER & TECH STACK DISCOVERY (Turn 1)
          - Role: You are a Hiring Manager interviewing the candidate for "${topicName}".
          - Task: Greet the candidate warmly and ask them to introduce themselves: "Welcome! To get started, please introduce yourself, your educational background, primary technical skills or tools you are most comfortable with, and key projects you have built."
          - Format: Warm, encouraging opening question asking for candidate's primary tech stack.
          - Set "currentStage": "icebreaker"
          - Set "stageLabel": "Round 1: Candidate Intro & Skill Discovery"
          - Set "answerFormatHint": "Introduce yourself and state your primary technical stack, tools, and key projects."
        `;
      } else if (currentQuestionIndex === 2) {
        targetStage = 'specialization';
        stageInstructions = `
          STAGE 2: DECLARED TECH STACK & SPECIALIZATION (Turn 2)
          - DYNAMIC TECH STACK DIRECTIVE (MANDATORY):
            1. Parse the candidate's Turn 1 answer and resume for the exact programming languages, frameworks, databases, or domain tools they explicitly claimed knowledge in (e.g. Python, React, Java, Node.js, SQL, Excel).
            2. Formulate your follow-up question STRICTLY grounded in the technologies/tools they explicitly mentioned!
            3. Ask why they chose this specific tech stack and how they applied it in their projects.
            4. DO NOT ask about unmentioned or random frameworks outside their declared knowledge!
          - Set "currentStage": "specialization"
          - Set "stageLabel": "Round 2: Declared Tech Stack & Motivation"
          - Set "answerFormatHint": "Explain your choice of tech stack, core strengths, and passion."
        `;
      } else if (currentQuestionIndex === 3) {
        targetStage = 'technical_discussion';
        if (isBpoOrVoice) {
          stageInstructions = `
            STAGE 3: CUSTOMER HANDLING & VOICE DRILL (Turn 3)
            - Pose a practical customer service situation: handling an upset caller, de-escalating an SLA delay, or displaying active listening.
            - DO NOT ask any software programming questions.
            - Set "currentStage": "technical_discussion"
            - Set "stageLabel": "Round 3: Customer De-escalation & Voice Drill"
            - Set "answerFormatHint": "Demonstrate empathy, clarity, and your problem-solving steps."
          `;
        } else if (isIelts) {
          stageInstructions = `
            STAGE 3: IELTS CUE CARD & ABSTRACT DISCUSSION (Turn 3)
            - Ask a Part 2 / Part 3 IELTS prompt tailored to "${topicName}" testing vocabulary range and structured opinion expression.
            - DO NOT ask technical programming questions.
            - Set "currentStage": "technical_discussion"
            - Set "stageLabel": "Round 3: IELTS Cue Card & Abstract Probe"
            - Set "answerFormatHint": "Express your opinion clearly with varied vocabulary and smooth transitions."
          `;
        } else if (isMba) {
          stageInstructions = `
            STAGE 3: CASE STUDY & BUSINESS FRAMEWORK (Turn 3)
            - Pose a practical business scenario or trade-off question testing logical market estimation or strategic decision-making.
            - Set "currentStage": "technical_discussion"
            - Set "stageLabel": "Round 3: Business Case & Strategic Reasoning"
            - Set "answerFormatHint": "Structure your analysis using a clear business framework."
          `;
        } else if (isFresher) {
          stageInstructions = `
            STAGE 3: TAILORED TECH CONCEPT & PROJECT CHECK (Turn 3)
            - Candidate is a CAMPUS FRESHER. Keep questions fair and grounded strictly in the candidate's declared tech stack!
            - Pick a specific tool or language they mentioned (e.g. React or Python or SQL) and ask how they used it in their project, or ask a practical fundamental concept check.
            - DO NOT ask unmentioned technologies, complex database internals, or high-load architecture questions!
            - Set "currentStage": "technical_discussion"
            - Set "stageLabel": "Round 3: Declared Tech Project Discussion"
            - Set "answerFormatHint": "Explain how you used your declared tech stack in your project."
          `;
        } else {
          stageInstructions = `
            STAGE 3: TECHNICAL & PRACTICAL DEEP-DIVE (Turn 3)
            - Candidate is a PLACEMENT PRO. Pick a technical claim or architecture choice from their declared tech stack.
            - Ask an unscripted technical question probing trade-offs, scalability, or resolving edge-case bugs within their domain.
            - Set "currentStage": "technical_discussion"
            - Set "stageLabel": "Round 3: Deep Technical Discussion"
            - Set "answerFormatHint": "Discuss your technical solution, trade-offs, and architecture."
          `;
        }
      } else {
        targetStage = 'behavioral_star';
        stageInstructions = `
          STAGE 4: BEHAVIORAL & STAR METHOD PROBE (Turn 4 - Final Round)
          - Ask a situational behavioral question (e.g. working under deadline pressure, resolving team conflict, or learning from a past mistake).
          - Evaluate their answer using the STAR framework (Situation, Task, Action, Result).
          - Set "currentStage": "behavioral_star"
          - Set "stageLabel": "Round 4: Behavioral & STAR Challenge (Final Round)"
          - Set "answerFormatHint": "Structure your answer using Situation, Task, Action, and Result."
        `;
      }
    } else {
      // Academic Viva Progression
      if (currentQuestionIndex <= 2) {
        targetStage = 'basic';
        stageInstructions = `
          CURRENT LEVEL: LEVEL 1 (BASIC WARMUP - Question ${currentQuestionIndex} of 2)
          - Ask a basic, foundational warmup question specifically tailored to "${topicName}".
          - Set "currentStage": "basic"
          - Set "stageLabel": "Level 1: Basic Warmup"
          - Set "answerFormatHint": "Answer concisely in 1 to 2 sentences."
        `;
      } else if (currentQuestionIndex <= 4) {
        targetStage = 'intermediate';
        stageInstructions = `
          CURRENT LEVEL: LEVEL 2 (INTERMEDIATE EXPLANATION - Question ${currentQuestionIndex} of 4)
          - Ask an intermediate explanation question probing HOW or WHY a specific core aspect of "${topicName}" works.
          - Set "currentStage": "intermediate"
          - Set "stageLabel": "Level 2: Intermediate Explanation"
          - Set "answerFormatHint": "Explain clearly in 2 to 3 sentences."
        `;
      } else {
        targetStage = 'advanced';
        stageInstructions = `
          CURRENT LEVEL: LEVEL 3 (ADVANCED COMMITTEE DEFENSE - Question ${currentQuestionIndex})
          - Ask a rigorous, challenging committee defense question probing edge cases, technical trade-offs, or real-world risks regarding "${topicName}".
          - Set "currentStage": "advanced"
          - Set "stageLabel": "Level 3: Advanced Committee Defense"
          - Set "answerFormatHint": "Defend your position with comprehensive reasoning."
        `;
      }
    }

    const modeInstruction = mode === 'text'
      ? `CRITICAL MODE DIRECTIVE — TEXT DEFENSE MODE:
The candidate is TYPING their defense answer as text. They are NOT speaking or using a microphone.
1. DO NOT comment on, evaluate, or score spoken delivery, vocal confidence, voice tone, speaking rate, mic clarity, or oral presentation skills. Spoken delivery evaluation is UNNECESSARY and INVALID in Text Mode.
2. Evaluate strictly on: Content & Technical Accuracy, Depth of Logic & Reasoning, and Written Structure & Clarity.
3. In your JSON output, return scores strictly for text mode using these metric keys:
   "scores": {
     "accuracy": <0-100 score for technical and content accuracy>,
     "reasoning": <0-100 score for depth of logic and reasoning>,
     "clarity": <0-100 score for written structure and clarity>,
     "overall": <0-100 overall defense score>
   }`
      : `CRITICAL MODE DIRECTIVE — VOICE DEFENSE MODE:
The candidate is SPEAKING their defense answer orally using speech-to-text.
1. Evaluate spoken delivery, vocal confidence, speech pacing, technical accuracy, and spoken communication clarity.
2. In your JSON output, return scores strictly for voice mode using these metric keys:
   "scores": {
     "accuracy": <0-100 score for technical accuracy>,
     "confidence": <0-100 score for vocal & delivery confidence>,
     "delivery": <0-100 score for spoken delivery & pacing>,
     "communication": <0-100 score for spoken communication clarity>,
     "overall": <0-100 overall defense score>
   }`;

    const toneInstruction = examinerTone === 'hostile'
      ? `EXAMINER PERSONALITY: HOSTILE & SKEPTICAL EXAMINER. Be sharp, demanding, and uncompromising. Press hard on weak points, challenge unverified assumptions aggressively, and maintain a strict defense committee tone.`
      : `EXAMINER PERSONALITY: FRIENDLY & SUPPORTIVE PANEL. Be encouraging, warm, and constructive. Ask clarifying questions that guide the candidate to showcase their knowledge.`;

    const languageInstruction = language === 'hinglish'
      ? `CRITICAL LANGUAGE INSTRUCTION (100% MANDATORY):
You MUST formulate every single "nextQuestion", "feedbackToPreviousAnswer", and "tip" strictly in conversational Roman Hinglish (Hindi written in English script, naturally mixed with English technical terms).
Example Hinglish Question Formats:
- "Aapka topic '${topicName}' bohot interesting hai. In short, aapka main objective kya hai?"
- "Aapne is specific concept ko kis prospective se samjha hai?"
- "Is methodology ko use karne ka main reason kya tha, aur real-world me yeh kaise kaam karega?"
CRITICAL DIRECTIVE: Under NO circumstances should you output pure English for nextQuestion or feedback when Hinglish is selected. You MUST write in natural, friendly Roman Hinglish!`
      : `CRITICAL LANGUAGE INSTRUCTION: Generate all nextQuestions, feedbackToPreviousAnswer, and tips in clear, natural English.`;
    const baseAdminPrompt = await getDynamicPrompt('viva_voce', 'You are an expert Viva university examiner conducting an official defense session for the candidate');

    const systemPrompt = `
      ${baseAdminPrompt} on topic: "${topicName}".

      ${languageInstruction}

      ${toneInstruction}

      ${modeInstruction}

      ${documentInstruction}

      PROGRESSION CURVE RULES:
      ${stageInstructions}

      EVASIVE / ONE-WORD CANDIDATE ANSWER DIRECTIVE (HUMAN INTERVIEWER DIRECTIVE):
      - Check the candidate's latest response.
      - IF TURN 1 (Session Start / Question 1): Candidate has NOT answered yet. Greet candidate warmly with a standard opening question ("Welcome! To get started, please introduce yourself, your educational background, primary technical skills, and key projects."). DO NOT say "Let's try that again"!
      - IF TURN > 1 AND the candidate provided a 1-word, non-committal, lazy, or evasive response (such as "yes", "no", "ok", "yep", "sure", "idk", "maybe", or fewer than 4 words without technical content):
        1. CONFRONT THEM IMMEDIATELY IN "feedbackToPreviousAnswer": Act like a real, serious interviewer calling them out firmly. Example: "Simply answering 'yes' is not acceptable in a real job interview. It gives me zero technical or professional information to evaluate."
        2. INCLUDE CONFRONTATION + RE-PROMPT IN "nextQuestion": Formulate "nextQuestion" as a full human interviewer response that starts with the confrontation before re-asking the question! Example: "That's just a 'yes'! In a real interview, a one-word answer gives me zero information to evaluate. Let's try that again: Please tell me about your degree, primary programming languages, and a key project."
        3. ASSIGN VERY LOW SCORES: Set scores strictly between 15 and 25 for accuracy, reasoning, and clarity/confidence.

      FEEDBACK RULES:
      1. Ask ONE clear question at a time. Never ask multiple questions at once.
      2. Ground every question strictly in "${topicName}" and any provided slides.
      3. If the student previously answered:
         - Give specific, constructive feedback FIRST before introducing the next question.
         - Good answer? Praise their clarity, then point out 1 nuanced detail they can add.
         - Weak answer? Explain clearly what a top-scoring response looks like.
      4. Tips should be actionable, high-value advice for viva candidates.
      RIGOROUS ACADEMIC SCORING DIRECTIVE (MANDATORY FOR TRUST):
      - DO NOT default to the 80-85 range! Every score must reflect the actual quality of the candidate's latest answer.
      - Insufficient / Evasive / 1-3 word answers ("yes", "idk", "maybe"): Score strictly between 15 and 25. Explain what is missing.
      - Superficial / Partially correct answers: Score between 45 and 65.
      - Competent, clear, accurate answers: Score between 70 and 82.
      - Outstanding, detailed answers with trade-offs / examples: Score between 85 and 96.
      - "overall" MUST equal the rounded average of the subscores.

      Respond STRICTLY in valid JSON format:
      {
        "feedbackToPreviousAnswer": "<Objective evaluation of candidate response, strictly adhering to ${mode.toUpperCase()} DEFENSE MODE directives>",
        "scores": ${mode === 'text' ? `{
          "accuracy": <number 15-98 based on technical correctness>,
          "reasoning": <number 15-98 based on depth of logic>,
          "clarity": <number 15-98 based on written articulation>,
          "overall": <number 15-98 average of the above>
        }` : `{
          "accuracy": <number 15-98 based on factual correctness>,
          "confidence": <number 15-98 based on vocal certainty>,
          "delivery": <number 15-98 based on pacing and pause discipline>,
          "communication": <number 15-98 based on clarity of explanation>,
          "overall": <number 15-98 average of the above>
        }`},
        "currentStage": "${targetStage}",
        "stageLabel": "Level 1: Basic Warmup",
        "answerFormatHint": "Answer in 1 word or 1 single sentence.",
        "nextQuestion": "<Your dynamically generated question tailored strictly to ${topicName}>",
        "tip": "<Actionable tip for answering this specific defense question>"
      }
    `;

    // Defensive Input Truncation: Prevent token exhaustion & cost inflation attacks
    const sanitizedAnswer = typeof currentAnswer === 'string' ? currentAnswer.slice(0, 2000).trim() : '';

    let userPrompt = '';
    if (currentQuestionIndex === 1) {
      userPrompt = `Initialize Turn 1 of the mock job interview session for role: "${topicName.slice(0, 200)}".
Candidate is ready to begin. Greet them warmly and ask them to introduce themselves, state their degree/educational background, primary programming languages/tools, and key projects. DO NOT evaluate any answer yet.`;
    } else {
      userPrompt = `Continue the Viva Voce defense session for topic: "${topicName.slice(0, 200)}". (Turn ${currentQuestionIndex})`;
      if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
        const recentHistory = chatHistory.slice(-8);
        const condensedHistory = recentHistory
          .map((h: any) => {
            if (h.role === 'examiner' && h.question) return `Host Question: ${String(h.question).slice(0, 400)}`;
            if (h.role === 'candidate' && h.text) return `Candidate Answer: ${String(h.text).slice(0, 1000)}`;
            if (h.question && h.question.startsWith('Provide Context:')) return String(h.question).slice(0, 1000);
            return null;
          })
          .filter(Boolean)
          .join('\n');
        userPrompt += `\n\nViva History Summary:\n${condensedHistory}`;
      }
      if (sanitizedAnswer) {
        userPrompt += `\n\nLatest Candidate Answer: ${sanitizedAnswer}`;
      }
    }

    const aiTextResponse = await generateAIContent({
      systemPrompt,
      userPrompt,
    });

    const cleanJsonString = aiTextResponse.replace(/```json|```/g, '').trim();
    let parsedResponse: any;
    try {
      parsedResponse = JSON.parse(cleanJsonString);
    } catch (e) {
      const jsonMatch = cleanJsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI JSON response: ' + aiTextResponse);
      }
    }

    // Defensive Output Clamping: Ensure all score fields are safely bounded numbers (15-98)
    if (parsedResponse && typeof parsedResponse === 'object') {
      if (parsedResponse.scores && typeof parsedResponse.scores === 'object') {
        for (const key of Object.keys(parsedResponse.scores)) {
          const rawVal = Number(parsedResponse.scores[key]);
          if (!isNaN(rawVal)) {
            parsedResponse.scores[key] = Math.min(98, Math.max(15, Math.round(rawVal)));
          }
        }
      }
    }

    const responseData = { status: 'success', data: parsedResponse, viva: parsedResponse };

    try {
      await setCache(`cache:${idempotencyKey}`, responseData, 86400);
    } catch(e) {}

    return NextResponse.json(responseData);

    } finally {
      if (idempotencyKey) {
        await releaseLock(idempotencyKey);
      }
    }

  } catch (error: any) {
    console.error("[Viva Route] Fatal Error:", error);
    if (typeof creditConsumed !== 'undefined' && creditConsumed && userIdForRefund) {
      console.warn(`[Viva] AI completely failed after deduction. Initiating atomic refund for ${userIdForRefund}...`);
      const { refundUsage } = await import('../../../lib/billing');
      await refundUsage(userIdForRefund, 1);
    }
    return NextResponse.json(
      { error: 'Viva simulation failed', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
});
