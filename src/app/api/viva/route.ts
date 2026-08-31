import { NextRequest, NextResponse } from 'next/server';
import { generateAIContent } from '../../../lib/aiFallback';
import { hasUsedTrial, setTrialUsed } from '../../../lib/trialManager';
import { checkAndDecrementUsage } from '../../../lib/billing';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (await hasUsedTrial(request)) {
      return NextResponse.json(
        { error: 'Trial Expired', message: 'You have used your free trial. Please sign in to continue.' },
        { status: 401 }
      );
    }

    const {
      chatHistory,
      currentAnswer,
      userId: bodyUserId,
      examinerTone = 'friendly',
      slideAnalysisData = null,
      topic: bodyTopic = null,
      language = 'en',
      interviewType = 'job_interview', // 'job_interview' | 'academic_viva' | 'presentation_defense'
      documentContext = '', // Extracted resume/CV or question paper text
      mode = 'text' // 'text' | 'voice'
    } = await request.json();
    const userId = request.headers.get('x-user-id') || bodyUserId;

    // Determine current question turn count (excluding initial context prompt)
    const validTurns = (chatHistory || []).filter(
      (h: any) => h.question && !h.question.startsWith('Provide Context:')
    );
    const currentQuestionIndex = validTurns.length + 1;

    // Deduct usage session credit only on the first turn of a viva session
    if (userId && userId !== 'guest-viva-user' && currentQuestionIndex === 1) {
      const usageCheck = await checkAndDecrementUsage(userId, 'viva_sessions_count');
      if (!usageCheck.allowed) {
        return NextResponse.json({
          error: "Limit Exceeded",
          message: "You have reached your monthly limit for Viva Sessions. Please upgrade your plan."
        }, { status: 403 });
      }
    }

    // Extract topic name or candidate role
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

    const hasDocument = Boolean(documentContext && documentContext.trim().length > 0);
    const hasSlides = Boolean(slideAnalysisData);

    let documentInstruction = '';
    if (hasDocument) {
      documentInstruction = `CANDIDATE DOCUMENT CONTEXT (Resume / CV / Exam Syllabus):\n${documentContext.slice(0, 3000)}\n
CRITICAL DIRECTIVE: You MUST reference specific projects, technical skills, job titles, or exam topics mentioned in the candidate's document during the interview discussion.`;
    } else if (hasSlides) {
      documentInstruction = `SLIDE-AWARE MODE: Presentation slide data provided:\n${JSON.stringify(slideAnalysisData, null, 2)}`;
    }

    let targetStage = 'icebreaker';
    let stageInstructions = '';

    if (interviewType === 'job_interview') {
      if (currentQuestionIndex === 1) {
        targetStage = 'icebreaker';
        stageInstructions = `
          STAGE 1: ICEBREAKER & INTRODUCTION (Turn 1)
          - Role: You are a Senior Engineering Hiring Manager / Lead Recruiter interviewing the candidate for a "${topicName}" role.
          - Task: Greet the candidate professionally and ask them to introduce themselves: "Welcome to the interview! To get started, please tell me about yourself, your background, and key projects you have worked on."
          - Format: Warm, professional opening question.
          - Set "currentStage": "icebreaker"
          - Set "stageLabel": "Round 1: Candidate Introduction"
          - Set "answerFormatHint": "Give a 1 to 2 minute overview of your background and key skills."
        `;
      } else if (currentQuestionIndex === 2) {
        targetStage = 'specialization';
        stageInstructions = `
          STAGE 2: SPECIALIZATION & MOTIVATION (Turn 2)
          - Parse the candidate's previous response for specific technical skills, domains, or projects mentioned.
          - Ask why they chose this specific specialization or tech stack, and what drives their passion for it.
          - Example: "You mentioned working extensively with React and Node.js. Why did you choose this specialization, and what attracts you to building scalable web platforms?"
          - Set "currentStage": "specialization"
          - Set "stageLabel": "Round 2: Specialization & Motivation"
          - Set "answerFormatHint": "Explain your choice of field, core strengths, and passion."
        `;
      } else if (currentQuestionIndex <= 4) {
        targetStage = 'technical_discussion';
        stageInstructions = `
          STAGE 3: TECHNICAL & PRACTICAL DEEP-DIVE (Turn ${currentQuestionIndex})
          - Pick a specific technical claim, architecture choice, or project detail mentioned in the candidate's previous answer or resume document.
          - Pose an unscripted technical discussion question: challenge them on technical trade-offs, state management, database schema design, API security, or handling edge-case bugs under load.
          - Do NOT ask canned textbook definitions. Conduct a real engineering discussion.
          - Set "currentStage": "technical_discussion"
          - Set "stageLabel": "Round 3: Deep Technical Discussion"
          - Set "answerFormatHint": "Discuss your technical solution, trade-offs, and architecture."
        `;
      } else {
        targetStage = 'behavioral_star';
        stageInstructions = `
          STAGE 4: BEHAVIORAL & STAR METHOD PROBE (Turn ${currentQuestionIndex})
          - Ask a situational behavioral question to test resilience, teamwork, or resolving high-stakes bugs under deadline pressure.
          - Example: "Tell me about a time when a critical production bug occurred right before a launch deadline. How did you diagnose it and work with your team to fix it?"
          - Evaluate their response against the STAR method (Situation, Task, Action, Result).
          - Set "currentStage": "behavioral_star"
          - Set "stageLabel": "Round 4: Behavioral & STAR Challenge"
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

    const systemPrompt = `
      You are an expert Viva university examiner conducting an official defense session for the candidate on topic: "${topicName}".

      ${languageInstruction}

      ${toneInstruction}

      ${modeInstruction}

      ${documentInstruction}

      PROGRESSION CURVE RULES:
      ${stageInstructions}

      FEEDBACK RULES:
      1. Ask ONE clear question at a time. Never ask multiple questions at once.
      2. Ground every question strictly in "${topicName}" and any provided slides.
      3. If the student previously answered:
         - Give specific, constructive feedback FIRST before introducing the next question.
         - If in Level 1 (Basic) and the student gave an overly long response, kindly remind them that examiners appreciate sharp 1-word or 1-sentence conciseness.
         - Good answer? Praise their clarity, then point out 1 nuanced detail they can add.
         - Weak answer? Explain clearly what a top-scoring response looks like.
      4. Tips should be actionable, high-value advice for viva candidates.
      5. Score honestly from 0 to 100 based on adherence to requested length and accuracy.

      Respond STRICTLY in valid JSON format:
      {
        "feedbackToPreviousAnswer": "<Constructive evaluation of candidate response, strictly adhering to ${mode.toUpperCase()} DEFENSE MODE directives>",
        "scores": ${mode === 'text' ? `{
          "accuracy": 85,
          "reasoning": 82,
          "clarity": 88,
          "overall": 85
        }` : `{
          "accuracy": 85,
          "confidence": 82,
          "delivery": 84,
          "communication": 86,
          "overall": 84
        }`},
        "currentStage": "${targetStage}",
        "stageLabel": "Level 1: Basic Warmup",
        "answerFormatHint": "Answer in 1 word or 1 single sentence.",
        "nextQuestion": "<Your dynamically generated question tailored strictly to ${topicName}>",
        "tip": "<Actionable tip for answering this specific defense question>"
      }
    `;

    let userPrompt = `Start or continue the Viva Voce defense session for topic: "${topicName}".`;
    if (chatHistory && chatHistory.length > 0) {
      const condensedHistory = chatHistory
        .map((h: any) => {
          if (h.role === 'examiner' && h.question) return `Host Question: ${h.question}`;
          if (h.role === 'candidate' && h.text) return `Candidate Answer: ${h.text}`;
          if (h.question && h.question.startsWith('Provide Context:')) return h.question;
          return null;
        })
        .filter(Boolean)
        .join('\n');
      userPrompt += `\n\nViva History Summary:\n${condensedHistory}`;
    }
    if (currentAnswer) {
      userPrompt += `\n\nLatest Candidate Answer: ${currentAnswer}`;
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

    await setTrialUsed(request);

    return NextResponse.json({ status: 'success', data: parsedResponse, viva: parsedResponse });
  } catch (error: any) {
    console.error('Viva Simulator Error:', error);
    return NextResponse.json(
      { error: 'Viva simulation failed', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
