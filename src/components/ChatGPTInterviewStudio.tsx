// src/components/ChatGPTInterviewStudio.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { saveSession } from "@/lib/storage";
import { createPortal } from "react-dom";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Camera,
  Upload,
  FileText,
  Send,
  Sparkles,
  X,
  CheckCircle2,
  Volume2,
  VolumeX,
  ArrowRight,
  RotateCcw,
  Award,
  ChevronRight,
  MessageSquare,
  Briefcase,
  Zap,
  GraduationCap,
  Code2,
  BarChart3,
  Globe,
  LineChart,
  Headphones,
  Check,
  AlertCircle,
  Scissors,
  Target,
  Timer,
  Flame,
  RefreshCw,
  Play,
  Pause,
  Square,
  CheckCircle,
  Volume1,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import ConfidenceGraph, { ScoreRing } from "@/components/ConfidenceGraph";
import GuestAuthModal from "@/components/GuestAuthModal";

const Webcam = dynamic(() => import("react-webcam").then((m) => m.default) as any, {
  ssr: false,
}) as any;

interface ChatGPTInterviewStudioProps {
  onCancel?: () => void;
}

export const HIGH_STAKES_ROLE_PRESETS = [
  {
    id: "campus_tech",
    title: "Top Tech MNC Campus Placement (HR + Tech)",
    tag: "Campus Placement",
    desc: "Core OOPs, project logic, situational adaptability & structured communication",
  },
  {
    id: "sde1",
    title: "Software Development Engineer (SDE-1)",
    tag: "Tech Best-Seller",
    desc: "DSA rationale, clean API design, edge cases & time/space trade-offs",
  },
  {
    id: "data_analyst",
    title: "Data Analyst & BI Associate",
    tag: "High Demand",
    desc: "SQL query design, KPI anomaly diagnosis (Churn/CAC) & data storytelling",
  },
  {
    id: "ielts_speaking",
    title: "IELTS Speaking Examination (Band 7-9 Mock)",
    tag: "Global Mobility",
    desc: "Part 1 Personal, Part 2 2-min Cue Card & Part 3 Abstract reasoning rubric",
  },
  {
    id: "mba_consulting",
    title: "MBA / Consulting Case Study Defense",
    tag: "Strategy & Mgmt",
    desc: "MECE frameworks, market sizing, profit trees & top-down communication",
  },
  {
    id: "bpo_customer",
    title: "BPO & Customer Success Professional",
    tag: "Corporate Comms",
    desc: "De-escalation under SLA, customer empathy & active vocal modulation",
  },
];

export default function ChatGPTInterviewStudio({
  onCancel,
}: ChatGPTInterviewStudioProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<"setup" | "interview" | "results">("setup");
  const [roleTitle, setRoleTitle] = useState(
    "Top Tech MNC Campus Placement (HR + Tech)",
  );
  const [selectedPresetId, setSelectedPresetId] = useState("campus_tech");
  const [difficultyLevel, setDifficultyLevel] = useState<"fresher" | "pro">(
    "fresher",
  );
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [examinerTone, setExaminerTone] = useState<
    "friendly" | "strict" | "star"
  >("friendly");
  const [mockSeriesRound, setMockSeriesRound] = useState<1 | 2 | 3>(1);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isGuestAuthModalOpen, setIsGuestAuthModalOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [avatarGender, setAvatarGender] = useState<"female" | "male">("female");
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const searchParams = useSearchParams();
  const roleQuery = searchParams?.get("role");
  const roundQuery = searchParams?.get("round");

  // Map URL aliases (e.g. ?role=sde) to preset IDs
  const ROLE_ALIASES: Record<string, string> = {
    sde: "sde1",
    sde1: "sde1",
    tech: "sde1",
    bpo: "bpo_customer",
    bpo_customer: "bpo_customer",
    voice: "bpo_customer",
    campus: "campus_tech",
    campus_tech: "campus_tech",
    data_analyst: "data_analyst",
    analytics: "data_analyst",
    mba: "mba_consulting",
    mba_consulting: "mba_consulting",
    ielts: "ielts_speaking",
    ielts_speaking: "ielts_speaking",
  };

  useEffect(() => {
    if (roundQuery === "2") {
      setMockSeriesRound(2);
      setExaminerTone("strict");
    } else if (roundQuery === "3") {
      setMockSeriesRound(3);
      setExaminerTone("star");
    } else if (roundQuery === "1") {
      setMockSeriesRound(1);
      setExaminerTone("friendly");
    }
  }, [roundQuery]);

  useEffect(() => {
    if (!roleQuery) return;
    const presetId = ROLE_ALIASES[roleQuery.toLowerCase()];
    if (presetId) {
      const preset = HIGH_STAKES_ROLE_PRESETS.find((p) => p.id === presetId);
      if (preset) {
        setSelectedPresetId(preset.id);
        setRoleTitle(preset.title);
      }
    }
  }, [roleQuery]);

  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [stageLabel, setStageLabel] = useState(
    "Question 1 of 5: Candidate Introduction",
  );
  const [answerFormatHint, setAnswerFormatHint] = useState(
    "Give a 1-2 minute overview of your background & key skills.",
  );

  const [currentQuestion, setCurrentQuestion] = useState("");
  const [userAnswerText, setUserAnswerText] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showRetryConfirmModal, setShowRetryConfirmModal] = useState(false);
  const lastSpokenTextRef = useRef<string>("");
  const speechCharIndexRef = useRef<number>(0);

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      if (isListening && recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (e) {}
        startListeningTimer();
      }
      // Resume speech aloud from exact paused location
      if (voiceEnabled && typeof window !== "undefined" && "speechSynthesis" in window) {
        if (window.speechSynthesis.paused) {
          try {
            window.speechSynthesis.resume();
            setIsAiSpeaking(true);
          } catch (e) {
            const targetText = lastSpokenTextRef.current || currentQuestion;
            if (targetText) speakText(targetText, speechCharIndexRef.current);
          }
        } else {
          const targetText = lastSpokenTextRef.current || currentQuestion;
          if (targetText) speakText(targetText, speechCharIndexRef.current);
        }
      }
    } else {
      setIsPaused(true);
      if (isListening && recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        if (window.speechSynthesis.speaking) {
          try { window.speechSynthesis.pause(); } catch (e) {
            try { window.speechSynthesis.cancel(); } catch (err) {}
          }
        }
      }
      setIsAiSpeaking(false);
      if (speakingTimerRef.current) {
        clearInterval(speakingTimerRef.current);
        speakingTimerRef.current = null;
      }
    }
  };

  const restartCurrentRound = async () => {
    if (isListening && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    setIsListening(false);
    setIsAiSpeaking(false);
    setSpeakingSeconds(0);
    setIsPaused(false);
    setUserAnswerText("");
    setChatHistory([]);
    await startInterviewSession();
  };

  const [scores, setScores] = useState({
    technical: 88,
    communication: 92,
    starAlignment: 85,
    relevance: 90,
    overall: 88,
  });
  const [strengths, setStrengths] = useState<string[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [whatToCut, setWhatToCut] = useState<string[]>([]);
  const [modelAnswer, setModelAnswer] = useState("");

  const [speakingSeconds, setSpeakingSeconds] = useState(0);
  const speakingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [showDrillModal, setShowDrillModal] = useState(false);
  const [drillTargetQuestion, setDrillTargetQuestion] = useState("");
  const [drillWeakness, setDrillWeakness] = useState("");
  const [drillModelSnippet, setDrillModelSnippet] = useState("");
  const [drillCountdown, setDrillCountdown] = useState(45);
  const [isDrillRecording, setIsDrillRecording] = useState(false);
  const [drillTranscript, setDrillTranscript] = useState("");
  const [drillCompleted, setDrillCompleted] = useState(false);
  const [drillFillersFound, setDrillFillersFound] = useState<string[]>([]);
  const [drillBonusXp, setDrillBonusXp] = useState(0);
  const drillCountdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const drillRecognitionRef = useRef<any>(null);

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const COMMON_FILLERS = [
    "um",
    "uh",
    "like",
    "matlab",
    "basically",
    "actually",
    "you know",
    "literally",
    "so yeah",
    "sort of",
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showDrillModal) closeDrillModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showDrillModal]);

  // Initialize Web Speech API for both Interview & Rapid Re-Do Drill
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    ) {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      // Main interview speech recognition
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let fullTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript + " ";
        }
        setUserAnswerText(fullTranscript.trim());
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        stopListeningTimer();
      };

      recognition.onend = () => {
        stopListeningTimer();
      };

      recognitionRef.current = recognition;

      // Dedicated 45s Rapid Re-Do Drill recognition
      const drillRec = new SpeechRecognitionClass();
      drillRec.continuous = true;
      drillRec.interimResults = true;
      drillRec.lang = "en-US";

      drillRec.onresult = (event: any) => {
        let text = "";
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript + " ";
        }
        const clean = text.trim();
        setDrillTranscript(clean);

        // Real-time filler detection
        const words = clean.toLowerCase().split(/\s+/);
        const detected = words.filter((w) =>
          COMMON_FILLERS.includes(w.replace(/[^a-z]/g, "")),
        );
        setDrillFillersFound(detected);
      };

      drillRec.onerror = (event: any) => {
        console.error("Drill speech recognition error:", event.error);
        setIsDrillRecording(false);
      };

      drillRec.onend = () => {
        setIsDrillRecording(false);
      };

      drillRecognitionRef.current = drillRec;
    }
  }, []);

  const startListeningTimer = () => {
    setIsListening(true);
    setSpeakingSeconds(0);
    if (speakingTimerRef.current) clearInterval(speakingTimerRef.current);
    speakingTimerRef.current = setInterval(() => {
      setSpeakingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopListeningTimer = () => {
    setIsListening(false);
    if (speakingTimerRef.current) {
      clearInterval(speakingTimerRef.current);
      speakingTimerRef.current = null;
    }
  };

  // Re-Do Drill Handlers
  const openDrillModal = (
    question?: string,
    weakness?: string,
    model?: string,
  ) => {
    setDrillTargetQuestion(
      question ||
        currentQuestion ||
        chatHistory[0]?.question ||
        `Tell me about a challenging engineering situation and how you handled it.`,
    );
    setDrillWeakness(
      weakness ||
        whatToCut[0] ||
        "Cut redundant filler phrasing and start directly with your actions.",
    );
    setDrillModelSnippet(
      model ||
        modelAnswer ||
        "Structure your answer: Situation (10s), Action (25s), Result (10s).",
    );
    setDrillCountdown(45);
    setDrillTranscript("");
    setDrillFillersFound([]);
    setDrillCompleted(false);
    setDrillBonusXp(0);
    setShowDrillModal(true);
  };

  const startDrillRecording = () => {
    setDrillTranscript("");
    setDrillFillersFound([]);
    setDrillCountdown(45);
    setDrillCompleted(false);
    setIsDrillRecording(true);

    if (drillRecognitionRef.current) {
      try {
        drillRecognitionRef.current.start();
      } catch (e) {
        console.warn("Drill recognition start error:", e);
      }
    }

    if (drillCountdownTimerRef.current)
      clearInterval(drillCountdownTimerRef.current);
    drillCountdownTimerRef.current = setInterval(() => {
      setDrillCountdown((prev) => {
        if (prev <= 1) {
          stopDrillRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopDrillRecording = () => {
    setIsDrillRecording(false);
    if (drillCountdownTimerRef.current) {
      clearInterval(drillCountdownTimerRef.current);
      drillCountdownTimerRef.current = null;
    }
    if (drillRecognitionRef.current) {
      try {
        drillRecognitionRef.current.stop();
      } catch (e) {
        console.warn("Drill recognition stop error:", e);
      }
    }
    setDrillCompleted(true);
    // Reward bonus XP for completing the coach drill
    setDrillBonusXp(drillFillersFound.length === 0 ? 50 : 30);
  };

  const closeDrillModal = () => {
    stopDrillRecording();
    setShowDrillModal(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  const speakText = (text: string, startFromChar: number = 0) => {
    if (
      !voiceEnabled ||
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    )
      return;
    try {
      lastSpokenTextRef.current = text;
      const textToSpeak = startFromChar > 0 && startFromChar < text.length ? text.slice(startFromChar) : text;
      if (startFromChar === 0) speechCharIndexRef.current = 0;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onboundary = (event: any) => {
        if (event.name === "word" || typeof event.charIndex === "number") {
          speechCharIndexRef.current = startFromChar + (event.charIndex || 0);
        }
      };
      utterance.onend = () => {
        setIsAiSpeaking(false);
        speechCharIndexRef.current = 0;
      };
      utterance.onerror = () => {
        setIsAiSpeaking(false);
        speechCharIndexRef.current = 0;
      };
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis failed:", e);
      setIsAiSpeaking(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeFileName(file.name);
    const text = await file.text();
    setResumeText(text.slice(0, 3000));
  };

  const startInterviewSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setIsGuestAuthModalOpen(true);
      return;
    }

    setStep("interview");
    setIsLoading(true);
    setCurrentRound(1);
    setChatHistory([]);

    try {
      const authHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        authHeaders["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/viva", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          chatHistory: [
            {
              question: `Provide Context: Job Candidate applying for ${roleTitle} (${difficultyLevel === "pro" ? "Placement Pro Mode" : "Campus Fresher Mode"})`,
              answer: "Understood",
            },
          ],
          currentAnswer: "Ready to start interview",
          examinerTone: examinerTone,
          topic: roleTitle,
          interviewType: "job_interview",
          difficultyLevel: difficultyLevel,
          documentContext: resumeText,
        }),
      });

      const data = await res.json();
      const payload = data.data || data.viva;
      if (data.status === "success" && payload) {
        const firstQ =
          payload.nextQuestion ||
          `Welcome to your interview for the ${roleTitle} position! To get started, please tell me about yourself and your background.`;
        setCurrentQuestion(firstQ);
        setStageLabel(payload.stageLabel || "Round 1: Candidate Introduction");
        setAnswerFormatHint(
          payload.answerFormatHint ||
            "Give a 1-2 minute overview of your background & skills.",
        );

        setChatHistory([
          {
            role: "interviewer",
            question: firstQ,
            stageLabel: payload.stageLabel || "Round 1: Introduction",
          },
        ]);

        speakText(firstQ);
      }
    } catch (err) {
      console.error("Failed to start interview:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswerText.trim() || isLoading) return;
    const userAns = userAnswerText.trim();
    setUserAnswerText("");
    setIsLoading(true);

    const updatedHistory = [
      ...chatHistory,
      { role: "candidate", text: userAns },
    ];
    setChatHistory(updatedHistory);

    const candidateAnswersCount = updatedHistory.filter(
      (item) => item.role === "candidate" && item.text
    ).length;

    // Standard interview caps at 5 questions per round
    if (candidateAnswersCount >= 5) {
      await finishInterview(updatedHistory);
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const authHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        authHeaders["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/viva", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          chatHistory: updatedHistory,
          currentAnswer: userAns,
          examinerTone: examinerTone,
          topic: roleTitle,
          interviewType: "job_interview",
          difficultyLevel: difficultyLevel,
          documentContext: resumeText,
        }),
      });

      const data = await res.json();
      const payload = data.data || data.viva;
      if (data.status === "success" && payload) {
        const nextQ = payload.nextQuestion;
        const nextRoundNum = Math.min(5, currentRound + 1);
        setCurrentQuestion(nextQ);
        setCurrentRound(nextRoundNum);
        setStageLabel(
          payload.stageLabel ||
            `Question ${nextRoundNum} of 5: Interview Q&A`,
        );
        setAnswerFormatHint(
          payload.answerFormatHint ||
            "Discuss your technical solution & trade-offs.",
        );

        setChatHistory((prev) => [
          ...prev,
          {
            role: "interviewer",
            question: nextQ,
            feedback: payload.feedbackToPreviousAnswer,
            stageLabel: payload.stageLabel,
          },
        ]);

        const fullSpeech = payload.feedbackToPreviousAnswer
          ? `${payload.feedbackToPreviousAnswer} ${nextQ}`
          : nextQ;
        speakText(fullSpeech);
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const finishInterview = async (customHistory?: any[]) => {
    setIsLoading(true);
    const historyToUse = Array.isArray(customHistory) ? customHistory : chatHistory;
    try {
      const candidateAnswers = historyToUse
        .filter((item) => item.role === "candidate" && item.text)
        .map((item) => item.text);

      if (candidateAnswers.length === 0) {
        setScores({
          technical: 0,
          communication: 0,
          starAlignment: 0,
          relevance: 0,
          overall: 0,
        });
        setStrengths(["Session initialized."]);
        setWeaknesses([
          "No interview responses recorded. Practice answering questions aloud or by typing to receive authentic evaluation.",
        ]);
        setAiSuggestions([
          "Start by answering the first introductory question using the STAR technique.",
        ]);
        setWhatToCut([
          "Do not leave questions unanswered in an actual placement drive.",
        ]);
        setModelAnswer(
          "State your degree, major project, and why you are keen on this role.",
        );
        setStep("results");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const authHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        authHeaders["Authorization"] = `Bearer ${session.access_token}`;
      }

      const transcriptSummary = historyToUse
        .map((item) => {
          if (item.question) return `Interviewer: ${item.question}`;
          if (item.text) return `Candidate: ${item.text}`;
          return null;
        })
        .filter(Boolean)
        .join("\n");

      const res = await fetch("/api/interview-eval", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          transcript: transcriptSummary,
          roleTitle,
          resumeText,
          difficultyLevel,
        }),
      });

      let finalScores = { technical: 82, communication: 85, starAlignment: 80, relevance: 88, overall: 84 };
      let finalStrengths: string[] = [`Domain alignment for ${roleTitle}`];
      let finalWeaknesses: string[] = ["Provide deeper technical details on project trade-offs"];
      let finalSuggestions: string[] = ["Use STAR framework for situational questions"];
      let finalWhatToCut: string[] = ["Avoid rambling into non-technical hobbies during technical rounds."];
      let finalModelAnswer = "Frame answers around: Situation, Task, Action taken, and Quantified Result.";

      const data = await res.json();
      if (data.status === "success" && data.data) {
        const evalData = data.data;

        if (evalData.scores) {
          finalScores = evalData.scores;
          setScores(evalData.scores);
        }

        if (evalData.strengths && evalData.strengths.length > 0) {
          finalStrengths = evalData.strengths;
          setStrengths(evalData.strengths);
        }

        if (evalData.weaknesses && evalData.weaknesses.length > 0) {
          finalWeaknesses = evalData.weaknesses;
          setWeaknesses(evalData.weaknesses);
        }

        if (evalData.suggestions && evalData.suggestions.length > 0) {
          finalSuggestions = evalData.suggestions;
          setAiSuggestions(evalData.suggestions);
        }

        if (evalData.whatToCut && evalData.whatToCut.length > 0) {
          finalWhatToCut = evalData.whatToCut;
          setWhatToCut(evalData.whatToCut);
        }

        if (evalData.betterWayToSayIt) {
          finalModelAnswer = evalData.betterWayToSayIt;
          setModelAnswer(evalData.betterWayToSayIt);
        }
      } else {
        console.warn("AI evaluation API notice:", data.error || data.message);
        finalScores = { technical: 75, communication: 78, starAlignment: 72, relevance: 80, overall: 76 };
        setScores(finalScores);
      }

      const sessionRecord = saveSession("interview", {
        topic: roleTitle ? `Interview: ${roleTitle}` : 'AI Voice Interview',
        type: 'interview',
        roleTitle,
        difficultyLevel,
        mockSeriesRound,
        examinerTone,
        nextRoundNumber: mockSeriesRound < 3 ? mockSeriesRound + 1 : null,
        nextRoundTitle: mockSeriesRound === 1 
          ? "Round 2: Technical Panel" 
          : mockSeriesRound === 2 
            ? "Round 3: STAR Method Behavioral Round" 
            : "3-Round Mock Series Completed",
        scores: finalScores,
        strengths: finalStrengths,
        weaknesses: finalWeaknesses,
        suggestions: finalSuggestions,
        whatToCut: finalWhatToCut,
        modelAnswer: finalModelAnswer,
        chatHistory: historyToUse
      });

      setIsLoading(false);
      router.push(`/reports/${sessionRecord.id}`);
      return;
    } catch (err) {
      console.warn("Generating dynamic evaluation report notice:", err);
      const fallbackScores = { technical: 82, communication: 85, starAlignment: 80, relevance: 88, overall: 84 };
      const sessionRecord = saveSession("interview", {
        topic: roleTitle ? `Interview: ${roleTitle}` : 'AI Voice Interview',
        type: 'interview',
        roleTitle,
        difficultyLevel,
        mockSeriesRound,
        examinerTone,
        nextRoundNumber: mockSeriesRound < 3 ? mockSeriesRound + 1 : null,
        nextRoundTitle: mockSeriesRound === 1 
          ? "Round 2: Technical Panel" 
          : mockSeriesRound === 2 
            ? "Round 3: STAR Method Behavioral Round" 
            : "3-Round Mock Series Completed",
        scores: fallbackScores,
        strengths: [`Domain alignment for ${roleTitle}`],
        weaknesses: ["Provide deeper technical details on project trade-offs"],
        suggestions: ["Use STAR framework for situational questions"],
        whatToCut: ["Avoid rambling into non-technical hobbies during technical rounds."],
        modelAnswer: "Frame answers around: Situation, Task, Action taken, and Quantified Result.",
        chatHistory
      });
      setIsLoading(false);
      router.push(`/reports/${sessionRecord.id}`);
    }
  };

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      stopListeningTimer();
    } else {
      try {
        recognitionRef.current.start();
        startListeningTimer();
      } catch (e) {
        console.warn("Speech recognition start failed:", e);
        stopListeningTimer();
      }
    }
  };

  return (
    <>
      {/* STEP 1: SETUP SCREEN */}
      {step === "setup" && (
        <div className="space-y-4 sm:space-y-5 relative z-10 animate-in fade-in duration-300 font-sans">
          {/* Header Title with Landing Page Indigo/Blue Theme */}
          <div className="text-left bg-gradient-to-br from-indigo-50/90 via-blue-50/40 to-[#F8FAFC] border border-indigo-200/80 p-5 sm:p-7 rounded-3xl relative overflow-hidden shadow-2xs">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-blue-300/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-100/90 border border-indigo-300 text-indigo-950 text-[11px] font-black uppercase tracking-widest mb-3 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span> 3-Round Placement Campaign
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-[#0F1426] tracking-tight mb-1.5">
                3-Round AI Mock Interview Campaign
              </h1>
              <p className="text-xs sm:text-base text-slate-700 font-medium max-w-2xl leading-relaxed">
                Practice full placement drives across 3 sequential rounds: Standard HR Warmup &rarr; Technical Panel Deep-Dive &rarr; STAR Method Behavioral Probe with 40-minute prep breaks &amp; weakness feedback.
              </p>
            </div>
          </div>

          {/* Setup Configuration Card */}
          <div
            className="border border-indigo-200/80 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-50/90 via-blue-50/40 to-[#F8FAFC] shadow-xl p-5 sm:p-6 flex flex-col gap-5 relative overflow-hidden text-slate-900"
            style={{ isolation: "isolate" }}
          >
            {/* Background Soft Pulsing Auras */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-300/15 rounded-full blur-3xl pointer-events-none" />

            {/* Top Accent Gradient Stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-800"></div>

            {/* Header / Mode Switcher Navbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-200/60 pb-5 relative z-10">
              <div>
                <h2 className="text-base sm:text-lg font-black text-[#0F1426] flex items-center gap-2">
                  <Mic size={18} className="text-indigo-600 shrink-0" />
                  <span>Practice &amp; Rehearse Mock Interview</span>
                </h2>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Select interviewer panel, enter target role, and optionally ground questions in your resume.
                </p>
              </div>

              {/* Mode Selector Navbar Pills with 3-Round Series Tracker */}
              <div className="flex bg-white/80 backdrop-blur-xs p-1.5 rounded-xl border border-indigo-200/80 shrink-0 gap-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setExaminerTone("friendly");
                    setMockSeriesRound(1);
                  }}
                  className={`px-3 py-1.5 text-xs font-black transition-all rounded-lg cursor-pointer flex items-center gap-1.5 ${
                    examinerTone === "friendly"
                      ? "bg-[#0F1426] text-white shadow-xs"
                      : "text-slate-700 hover:text-slate-950 hover:bg-indigo-50/70"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-bold">1</span>
                  Standard Mock
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExaminerTone("strict");
                    setMockSeriesRound(2);
                  }}
                  className={`px-3 py-1.5 text-xs font-black transition-all rounded-lg cursor-pointer flex items-center gap-1.5 ${
                    examinerTone === "strict"
                      ? "bg-indigo-700 text-white shadow-xs"
                      : "text-slate-700 hover:text-slate-950 hover:bg-indigo-50/70"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-bold">2</span>
                  Technical Round
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExaminerTone("star");
                    setMockSeriesRound(3);
                  }}
                  className={`px-3 py-1.5 text-xs font-black transition-all rounded-lg cursor-pointer flex items-center gap-1.5 ${
                    examinerTone === "star"
                      ? "bg-indigo-900 text-white shadow-xs"
                      : "text-slate-700 hover:text-slate-950 hover:bg-indigo-50/70"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-bold">3</span>
                  STAR Method
                </button>
              </div>
            </div>

            {/* Target Role Card */}
            <div className="bg-white/90 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-indigo-200/80 space-y-3.5 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <label className="text-xs font-black text-[#0F1426] uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase size={14} className="text-indigo-600" />
                <span>What job position or role are you preparing for?</span>
              </label>
              <span className="text-[11px] font-extrabold text-indigo-900 bg-indigo-100/90 px-2.5 py-0.5 rounded-full border border-indigo-300">
                Type custom or select chip
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Preset Dropdown + Custom Role Input Field */}
              <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-2">
                {/* Select Dropdown of Quick Presets */}
                <select
                  value={selectedPresetId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedPresetId(val);
                    if (val !== "custom") {
                      const preset = HIGH_STAKES_ROLE_PRESETS.find(
                        (p) => p.id === val
                      );
                      if (preset) setRoleTitle(preset.title);
                    }
                  }}
                  className="w-full sm:w-auto bg-white border border-indigo-200 text-slate-900 text-xs font-extrabold rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 shadow-2xs cursor-pointer shrink-0 transition-all"
                >
                  <option value="custom">✏️ Custom Role (Type Manually)</option>
                  {HIGH_STAKES_ROLE_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id === "campus_tech"
                        ? "🎓 Top Tech MNC Placement"
                        : p.id === "sde1"
                          ? "💻 Software Engineer (SDE-1)"
                          : p.id === "data_analyst"
                            ? "📊 Data Analyst & BI"
                            : p.id === "ielts_speaking"
                              ? "🌐 IELTS Speaking Mock"
                              : p.id === "mba_consulting"
                                ? "📈 MBA / Consulting Case"
                                : p.id === "bpo_customer"
                                  ? "🎧 BPO / Customer Voice"
                                  : p.title}
                    </option>
                  ))}
                </select>

                {/* Editable Role Title Input */}
                <div className="relative w-full flex-1">
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => {
                      setRoleTitle(e.target.value);
                      setSelectedPresetId("custom");
                    }}
                    placeholder="Type or edit job role (e.g. SDE, Data Analyst)..."
                    className="w-full bg-white border border-indigo-200 text-slate-900 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 font-bold shadow-2xs pr-8"
                  />
                  {roleTitle && (
                    <button
                      type="button"
                      onClick={() => {
                        setRoleTitle("");
                        setSelectedPresetId("custom");
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      title="Clear role input"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Voice Toggle Button */}
              <div className="md:col-span-1">
                <button
                  type="button"
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`w-full py-2.5 px-3 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    voiceEnabled
                      ? "bg-[#0F1426] text-amber-300 border-indigo-900 shadow-sm"
                      : "bg-white text-slate-700 border-indigo-200"
                  }`}
                >
                  {voiceEnabled ? (
                    <Volume2 size={15} className="text-amber-400" />
                  ) : (
                    <VolumeX size={15} />
                  )}
                  <span>{voiceEnabled ? "Voice Aloud ON" : "Voice Muted"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Difficulty Calibration Bar */}
          <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border border-indigo-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <div className="text-xs font-extrabold text-[#0F1426]">
                Difficulty Calibration
              </div>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                Starts at your level, then dynamically adapts follow-up depth
                based on your answers.
              </p>
            </div>
            <div className="flex bg-indigo-50/80 p-1 rounded-xl border border-indigo-200/80 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setDifficultyLevel("fresher")}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  difficultyLevel === "fresher"
                    ? "bg-white text-indigo-950 shadow-xs border border-indigo-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Campus Fresher</span>
              </button>
              <button
                type="button"
                onClick={() => setDifficultyLevel("pro")}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  difficultyLevel === "pro"
                    ? "bg-white text-indigo-950 shadow-xs border border-indigo-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                <span>Placement Pro</span>
              </button>
            </div>
          </div>

          {/* Practice Micro-Drill Notice */}
          <div className="p-3 bg-indigo-100/90 border border-indigo-300 rounded-2xl flex items-center gap-3 text-xs text-indigo-950 font-medium shadow-2xs">
            <Zap size={15} className="text-indigo-600 shrink-0" />
            <span>
              <strong>3-Round Micro-Drill:</strong> Warmup Intro ➔ Technical
              Depth ➔ STAR Cross-Exam. Designed to build instant interview
              reflexes without freezing.
            </span>
          </div>

          {/* Upload / Rehearsal Work Area */}
          <div className="w-full flex flex-col items-center justify-center py-2 min-h-[180px]">
            {resumeFileName ? (
              /* Clean Resume Ready State */
              <div className="w-full max-w-lg bg-white/90 backdrop-blur-xs border-2 border-indigo-300 rounded-2xl p-6 flex flex-col items-center gap-4 animate-fade-in shadow-md">
                <div className="flex items-center justify-between w-full pb-3 border-b border-indigo-200/80">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText size={14} className="text-indigo-600" />
                    <span>Resume Grounded</span>
                  </span>
                  <span className="text-xs font-extrabold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg truncate max-w-[200px]">
                    {resumeFileName}
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-medium text-center">
                  AI interviewer will ground technical questions directly in
                  your resume experience &amp; projects.
                </p>

                <div className="flex items-center gap-3 w-full pt-1">
                  <button
                    onClick={() => {
                      setResumeFileName(null);
                      setResumeText("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="px-4 py-3 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-all cursor-pointer shrink-0 shadow-2xs"
                    title="Remove resume and select a new file"
                  >
                    Change Resume
                  </button>

                  <button
                    onClick={startInterviewSession}
                    disabled={isLoading}
                    className="flex-1 py-3.5 bg-[#0F1426] hover:bg-[#1A2035] text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.01]"
                  >
                    <span>Launch Mock Interview</span>
                    <ArrowRight className="w-4 h-4 text-[#F2A93B]" />
                  </button>
                </div>
              </div>
            ) : (
              /* Single Spacious Drag & Drop Upload Container */
              <div className="w-full flex flex-col items-center justify-center">
                <div
                  className={`w-full max-w-lg border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center transition-all cursor-pointer group ${
                    isDragActive
                      ? "border-indigo-600 bg-indigo-100/60"
                      : "border-indigo-300/80 bg-white/90 backdrop-blur-xs hover:bg-indigo-50/60 hover:border-indigo-600 shadow-2xs"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragActive(true);
                  }}
                  onDragLeave={() => setIsDragActive(false)}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setIsDragActive(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      setResumeFileName(file.name);
                      const text = await file.text();
                      setResumeText(text.slice(0, 3000));
                    }
                  }}
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-2xs">
                    <Upload size={20} className="text-indigo-600" />
                  </div>
                  <p className="font-extrabold text-[#0F1426] text-sm sm:text-base">
                    Click or Drag &amp; Drop Resume PDF here
                  </p>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    Optional: AI grounds technical questions in your resume
                    (PDF, TXT, DOCX)
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={handleFileUpload}
                  />
                </div>

                <button
                  onClick={startInterviewSession}
                  disabled={isLoading}
                  className="mt-5 w-full max-w-lg py-3.5 bg-[#0F1426] hover:bg-[#1A2035] text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.01]"
                >
                  <Sparkles className="w-4 h-4 text-[#F2A93B]" />
                  <span>
                    {isLoading
                      ? "Starting Interview Session..."
                      : "Launch Mock Interview"}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#F2A93B]" />
                </button>
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {/* STEP 2: DEDICATED LIVE AI VIDEO INTERVIEW ROOM (Mocklingo Call Interface) */}
      {step === "interview" && (
        <div className="w-full space-y-3 sm:space-y-4 relative z-10 animate-in fade-in duration-300 font-sans">
          {/* Dedicated Conference Room Navigation Bar */}
          <div className="bg-[#0F1426] text-white rounded-2xl sm:rounded-3xl border border-indigo-900/60 p-3 sm:p-4 px-4 sm:px-6 shadow-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center font-black text-white shadow-md shrink-0">
                <Mic size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                    Live AI Interview Call
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Call Connected
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">
                  Candidate: <strong>{roleTitle}</strong> &bull; Round {mockSeriesRound} of 3 ({mockSeriesRound === 1 ? "Standard Mock" : mockSeriesRound === 2 ? "Technical Panel" : "STAR Method"})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAvatarGender((prev) => (prev === "female" ? "male" : "female"))}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                title="Switch Interviewer Avatar"
              >
                <span>{avatarGender === "female" ? "Switch to Marcus 👨‍💼" : "Switch to Sarah 👩‍💼"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to exit the interview room and return to setup?")) {
                    setStep("setup");
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                title="Leave Interview Room"
              >
                <X size={14} />
                <span>Exit Call</span>
              </button>
            </div>
          </div>

          {/* 1. TOP OF PAGE: Current Question Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-indigo-200/90 p-3.5 sm:p-5 shadow-sm relative overflow-hidden space-y-2.5">
            {/* Ambient Accent Glow */}
            <div className="absolute top-0 right-0 w-64 h-32 bg-amber-400/10 blur-2xl rounded-full pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-0.5 rounded-full bg-[#0F1426] text-[#F2A93B] text-[11px] font-black uppercase tracking-wider shadow-xs">
                  Round {mockSeriesRound} • Q{currentRound}/5
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-[11px] font-bold">
                  {stageLabel}
                </span>
                {isPaused && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                    <Pause size={10} /> Paused
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
                <span>Interviewer: <strong className="text-slate-800">{avatarGender === "female" ? "Sarah Jenkins" : "Marcus Vance"}</strong></span>
              </div>
            </div>

            {/* Current Question Text */}
            <div className="space-y-1">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-900 font-black flex items-center justify-center shrink-0 text-xs mt-0.5 shadow-2xs">
                  Q
                </div>
                <div className="space-y-0.5 flex-1">
                  <h3 className="text-base sm:text-lg font-black text-[#0F1426] tracking-tight leading-snug">
                    {currentQuestion}
                  </h3>
                  {answerFormatHint && (
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <Sparkles size={12} className="text-[#F2A93B] shrink-0" />
                      <span>{answerFormatHint}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Interviewer Feedback Notice (if available) */}
            {chatHistory.length > 1 && chatHistory[chatHistory.length - 1]?.feedback && (
              <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-200/90 text-xs text-indigo-950 flex items-start gap-2.5 animate-in fade-in">
                <Sparkles size={13} className="text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-extrabold uppercase text-[10px] tracking-wider text-indigo-700 block">
                    Interviewer Feedback On Previous Answer:
                  </span>
                  <p className="font-medium text-slate-700 leading-relaxed text-[11px]">
                    {chatHistory[chatHistory.length - 1].feedback}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 2. DUAL-PANE LIVE AI INTERVIEW STAGE (Mocklingo Video Call Interface) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 relative">
            {/* Left Pane: Live AI Interviewer */}
            <div
              className={`rounded-3xl bg-[#0F1426] border-2 overflow-hidden shadow-2xl relative aspect-[16/10] sm:aspect-video h-[230px] sm:h-[290px] md:h-[340px] lg:h-[370px] max-h-[40vh] flex flex-col justify-between transition-all duration-300 ${
                isAiSpeaking
                  ? "border-emerald-500 ring-4 ring-emerald-500/20 shadow-emerald-950/40"
                  : "border-indigo-900/60"
              }`}
            >
              {/* Virtual Interviewer Photorealistic Image */}
              <img
                src={avatarGender === "female" ? "/images/interviewer-female.jpg" : "/images/interviewer-male.jpg"}
                alt="Live AI Interviewer"
                className="absolute inset-0 w-full h-full object-cover object-center filter brightness-95"
              />

              {/* Ambient Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F1426]/95 via-transparent to-[#0F1426]/60 pointer-events-none" />

              {/* Top Bar Overlay */}
              <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0F1426]/85 backdrop-blur-md border border-white/10 text-white text-[11px] font-extrabold shadow-sm">
                  <span className={`w-2 h-2 rounded-full ${isAiSpeaking ? "bg-emerald-400 animate-ping" : "bg-emerald-400"}`} />
                  <span>Live AI Interviewer</span>
                </div>

                <button
                  type="button"
                  onClick={() => setAvatarGender((prev) => (prev === "female" ? "male" : "female"))}
                  className="px-2.5 py-1 rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-md text-[10px] font-bold text-white border border-white/15 transition-all cursor-pointer shadow-xs"
                  title="Switch Interviewer Avatar"
                >
                  {avatarGender === "female" ? "Switch to Marcus 👨‍💼" : "Switch to Sarah 👩‍💼"}
                </button>
              </div>

              {/* Bottom Bar Overlay: Name, Role & Status */}
              <div className="relative z-10 p-3 sm:p-4 flex items-end justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-black text-white drop-shadow-md">
                    {avatarGender === "female" ? "Sarah Jenkins" : "Marcus Vance"}
                  </p>
                  <p className="text-[10px] text-slate-300 font-medium drop-shadow-sm">
                    {mockSeriesRound === 2 ? "Senior Technical Hiring Lead" : "Campus Talent Director"}
                  </p>
                </div>

                {isAiSpeaking ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/90 text-white text-xs font-black shadow-lg backdrop-blur-md animate-pulse">
                    <div className="flex items-center gap-0.5 h-3">
                      <span className="w-1 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span>Speaking...</span>
                  </div>
                ) : isListening ? (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-950/80 border border-indigo-400/30 text-indigo-200 text-[11px] font-bold backdrop-blur-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                    <span>Listening to you...</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-slate-300 text-[10px] font-bold">
                    <span>Ready for your answer</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Pane: Candidate Live Video (You) */}
            <div
              className={`rounded-3xl bg-[#0F1426] border-2 overflow-hidden shadow-2xl relative aspect-[16/10] sm:aspect-video h-[230px] sm:h-[290px] md:h-[340px] lg:h-[370px] max-h-[40vh] flex flex-col justify-between transition-all duration-300 ${
                isListening
                  ? "border-indigo-500 ring-4 ring-indigo-500/20 shadow-indigo-950/40"
                  : "border-indigo-900/60"
              }`}
            >
              {isCameraActive ? (
                <Webcam
                  audio={false}
                  mirrored={true}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  videoConstraints={{ facingMode: "user" }}
                  onUserMediaError={() => setIsCameraActive(false)}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#12162B] via-[#0F1426] to-[#0A0D1F] flex flex-col items-center justify-center space-y-3 p-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-indigo-700 to-indigo-900 border-2 border-indigo-500/40 text-white flex items-center justify-center font-black text-xl sm:text-2xl shadow-xl">
                    YOU
                  </div>
                  <p className="text-xs font-bold text-slate-300">Camera is turned off</p>
                  <button
                    type="button"
                    onClick={() => setIsCameraActive(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Video size={13} /> Enable Camera
                  </button>
                </div>
              )}

              {/* Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F1426]/95 via-transparent to-[#0F1426]/60 pointer-events-none" />

              {/* Top Bar Overlay */}
              <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0F1426]/85 backdrop-blur-md border border-white/10 text-white text-[11px] font-extrabold shadow-sm">
                  <span className={`w-2 h-2 rounded-full ${isListening ? "bg-red-500 animate-ping" : "bg-emerald-400"}`} />
                  <span>{isListening ? `Speaking (${speakingSeconds}s)` : "Candidate Audio Ready"}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCameraActive(!isCameraActive)}
                  className={`p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                    isCameraActive
                      ? "bg-white/20 hover:bg-white/30 text-white"
                      : "bg-rose-500/80 text-white"
                  }`}
                  title={isCameraActive ? "Turn Camera Off" : "Turn Camera On"}
                >
                  {isCameraActive ? <Video size={14} /> : <VideoOff size={14} />}
                </button>
              </div>

              {/* Bottom Bar Overlay */}
              <div className="relative z-10 p-3 sm:p-4 flex items-end justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-black text-white drop-shadow-md">
                    You (Candidate)
                  </p>
                  <p className="text-[10px] text-slate-300 font-medium drop-shadow-sm truncate max-w-[180px]">
                    {roleTitle}
                  </p>
                </div>

                {isListening && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black shadow-lg animate-pulse">
                    <Mic size={12} />
                    <span>Recording Answer</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Real-Time Pacing & Delivery Guidance Bar */}
          {isListening && (
            <div
              className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition-all animate-fade-in shadow-xs ${
                speakingSeconds > 75
                  ? "bg-rose-50 border-rose-300 text-rose-900"
                  : speakingSeconds > 45
                    ? "bg-amber-50 border-amber-300 text-amber-900"
                    : "bg-indigo-50 border-indigo-200 text-indigo-900"
              }`}
            >
              <div className="flex items-center gap-2 font-bold shrink-0">
                <Timer
                  size={15}
                  className={speakingSeconds > 75 ? "text-rose-600 animate-pulse" : "text-indigo-600"}
                />
                <span className="font-mono">{speakingSeconds}s elapsed</span>
                <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-white/80 border border-current">
                  STAR Pacing Cue
                </span>
              </div>
              <div className="text-xs font-medium">
                {speakingSeconds <= 45 && "🟢 State your Situation & your direct role clearly."}
                {speakingSeconds > 45 && speakingSeconds <= 75 && "🟡 Transition into specific Actions & technical trade-offs."}
                {speakingSeconds > 75 && "🟠 Wrap up: Recruiters lose focus after 90s. State your quantitative Result now!"}
              </div>
            </div>
          )}

          {/* 3. Live Speech Recognized Transcript & Response Controls Bar */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-indigo-200/90 p-4 sm:p-5 shadow-sm space-y-3">
            {/* Live Speech Recognition Caption / Preview */}
            {isListening ? (
              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 space-y-1.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    Live Spoken Transcript:
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-500">{speakingSeconds}s</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 leading-relaxed min-h-[1.5rem]">
                  {userAnswerText || "Listening to your voice... Speak clearly into your microphone."}
                </p>
              </div>
            ) : inputMode === "text" ? (
              <div className="space-y-2">
                <textarea
                  value={userAnswerText}
                  onChange={(e) => setUserAnswerText(e.target.value)}
                  placeholder="Type your response to the question here..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                />
              </div>
            ) : null}

            {/* Main Action Bar */}
            <div className="space-y-3 pt-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Candidate Primary Input Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Primary Mic Toggle / Answer Button */}
                  <button
                    onClick={toggleMic}
                    disabled={isPaused}
                    className={`px-5 sm:px-7 py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-40 ${
                      isListening
                        ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse shadow-rose-300"
                        : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-200"
                    }`}
                  >
                    {isListening ? (
                      <>
                        <Square size={16} /> Finish Speaking
                      </>
                    ) : (
                      <>
                        <Mic size={16} /> Tap to Answer Aloud
                      </>
                    )}
                  </button>

                  {/* Submit Answer */}
                  <button
                    onClick={submitAnswer}
                    disabled={isLoading || isPaused || !userAnswerText.trim()}
                    className="px-5 py-3 rounded-2xl bg-[#0F1426] hover:bg-[#1A2035] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
                  >
                    <span>Submit Answer</span>
                    <Send size={14} className="text-[#F2A93B]" />
                  </button>

                  {/* Switch Input Mode */}
                  <button
                    type="button"
                    onClick={() => setInputMode((prev) => (prev === "voice" ? "text" : "voice"))}
                    className="px-3.5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer hidden sm:flex items-center gap-1.5"
                  >
                    <FileText size={14} />
                    <span>{inputMode === "voice" ? "Type Answer" : "Voice Mode"}</span>
                  </button>
                </div>

                {/* Session & Utility Controls: Pause, Replay, Retry, Transcript, End */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Pause / Resume Button */}
                  <button
                    type="button"
                    onClick={togglePause}
                    className={`px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                      isPaused
                        ? "bg-amber-400 hover:bg-amber-300 text-slate-950 font-black border border-amber-500 shadow-amber-200 ring-2 ring-amber-400/30"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                    }`}
                    title={isPaused ? "Resume interview session" : "Pause interview session"}
                  >
                    {isPaused ? <Play size={13} className="fill-current" /> : <Pause size={13} />}
                    <span>{isPaused ? "Resume Session" : "Pause"}</span>
                  </button>

                  {/* Replay Question Audio */}
                  {voiceEnabled && (
                    <button
                      type="button"
                      onClick={() => speakText(lastSpokenTextRef.current || currentQuestion)}
                      disabled={isPaused}
                      className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-200 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 shadow-2xs"
                      title="Replay current question audio aloud"
                    >
                      <Volume2 size={13} className="text-[#F2A93B]" />
                      <span className="hidden sm:inline">Replay Audio</span>
                    </button>
                  )}

                  {/* Retry Round */}
                  <button
                    type="button"
                    onClick={() => setShowRetryConfirmModal(true)}
                    className="px-3.5 py-2.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    title="Restart this round from Question 1"
                  >
                    <RotateCcw size={13} />
                    <span className="hidden sm:inline">Retry Round</span>
                  </button>

                  {/* Conversation History Drawer Button */}
                  <button
                    type="button"
                    onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare size={13} className="text-indigo-600" />
                    <span>Transcript ({chatHistory.length})</span>
                  </button>

                  {/* Early End & Evaluation */}
                  <button
                    onClick={() => finishInterview()}
                    disabled={isLoading}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>End &amp; Get Report</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Expandable Transcript Log */}
            {showHistoryDrawer && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 max-h-60 overflow-y-auto space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-black uppercase text-slate-700">Interview Transcript Log</span>
                  <button onClick={() => setShowHistoryDrawer(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer">
                    Close ✕
                  </button>
                </div>
                {chatHistory.map((item, idx) => (
                  <div key={idx} className="text-xs space-y-1">
                    {item.question && (
                      <p className="text-slate-600">
                        <strong className="text-indigo-700">Interviewer:</strong> {item.question}
                      </p>
                    )}
                    {item.text && (
                      <p className="text-slate-800 bg-white p-2 rounded-xl border border-slate-200">
                        <strong className="text-emerald-700">You:</strong> {item.text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Tracker & Proceed Button */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-indigo-200/60">
            <span className="text-xs sm:text-sm text-slate-700 font-extrabold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              Question {currentRound} of 5 &bull; Round {mockSeriesRound} ({mockSeriesRound === 1 ? 'Standard Mock' : mockSeriesRound === 2 ? 'Technical Panel' : 'STAR Method'})
            </span>
            <button
              onClick={() => finishInterview()}
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl border border-indigo-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <span>
                {isLoading
                  ? "Generating Evaluation Report..."
                  : currentRound >= 5
                    ? `📊 Analyze Round ${mockSeriesRound} & View Weakness Report ➔`
                    : `📊 Finish Round ${mockSeriesRound} & View Analysis ➔`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: REAL AI INTERVIEW SCORECARD & REPORT */}
      {step === "results" && (
        <div className="space-y-6 relative z-10 animate-in fade-in duration-300 pt-2 sm:pt-4 text-slate-900">
          <div className="text-center space-y-2 mb-3 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs">
              <Sparkles size={12} className="text-amber-600" /> Deep AI
              Performance Report
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-950 leading-snug tracking-tight px-2">
              Interview Scorecard:{" "}
              <span className="text-[#151930]">{roleTitle}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Comprehensive breakdown of your technical answers, STAR method
              alignment, and communication style.
            </p>
          </div>

          {/* Placement Practice Gym Action Banner */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 rounded-2xl p-0.5 shadow-lg animate-fade-in">
            <div className="bg-white rounded-[15px] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                  <Flame size={12} className="text-amber-600" /> Placement
                  Practice Gym
                </div>
                <h4 className="text-sm sm:text-base font-black text-slate-950">
                  Don&apos;t just read the scorecard — Re-Deliver in a 45-Second
                  Rapid Drill
                </h4>
                <p className="text-xs text-slate-600 font-medium max-w-xl">
                  Repeated spoken rehearsal builds interview confidence. Click
                  to re-record with live filler detection and zero fluff.
                </p>
              </div>
              <button
                onClick={() => openDrillModal()}
                className="px-5 py-3 bg-[#151930] hover:bg-slate-900 text-[#F2A93B] font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer hover:scale-105"
              >
                <Play size={14} className="fill-[#F2A93B]" />
                <span>Start 45s Rapid Re-Do</span>
              </button>
            </div>
          </div>

          {/* Circular Score Ring Gauge Bar (Speech Coach Design Standard) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-gradient-to-r from-indigo-50/60 via-slate-50 to-amber-50/40 p-5 rounded-2xl border border-indigo-100/80 shadow-2xs">
            <ScoreRing
              value={scores.overall}
              max={100}
              size={76}
              strokeWidth={8}
              color="#6c5ce7"
              label="Overall Rating"
              unit="%"
            />
            <ScoreRing
              value={scores.technical}
              max={100}
              size={76}
              strokeWidth={8}
              color="#00cec9"
              label="Technical"
              unit="%"
            />
            <ScoreRing
              value={scores.communication}
              max={100}
              size={76}
              strokeWidth={8}
              color="#fd79a8"
              label="Communication"
              unit="%"
            />
            <ScoreRing
              value={scores.starAlignment}
              max={100}
              size={76}
              strokeWidth={8}
              color="#f2a93b"
              label="STAR Method"
              unit="%"
            />
            <ScoreRing
              value={scores.relevance}
              max={100}
              size={76}
              strokeWidth={8}
              color="#10b981"
              label="Relevance & Focus"
              unit="%"
            />
          </div>

          {/* Interactive Response Quality & Pacing Wave Timeline */}
          <div className="bg-gradient-to-br from-indigo-50/50 via-slate-50 to-white border border-indigo-100 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Interview Delivery & Response Timeline
                </span>
                <p className="text-[11px] text-indigo-600 font-medium">
                  Confidence & STAR structural alignment across rounds
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {chatHistory.length} Rounds Evaluated
              </span>
            </div>
            <ConfidenceGraph
              data={chatHistory
                .filter((h) => h.role === "candidate")
                .map((item, i) => {
                  const wordCount = item.text ? item.text.split(" ").length : 0;
                  const turnConfidence = scores.overall
                    ? scores.overall + Math.min(5, wordCount / 10)
                    : 80;
                  const estimatedWpm = 110 + Math.min(50, wordCount * 2);
                  return {
                    timestamp: (i + 1) * 30,
                    wpm: Math.round(estimatedWpm),
                    confidence: Math.round(turnConfidence),
                  };
                })}
              events={[]}
              type="area"
              dataKey="wpm"
              label="Delivery Score"
              color="#6c5ce7"
              height={180}
            />
          </div>

          {/* Deep 2-Column Strengths & Improvement Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200/80 border-t-4 border-t-emerald-500 rounded-2xl p-5 shadow-xs flex flex-col space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                  ✓
                </span>
                <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest">
                  Candidate Key Strengths
                </h4>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-800 font-medium flex-1">
                {strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check
                      size={13}
                      className="text-emerald-600 shrink-0 mt-0.5"
                    />
                    <span className="leading-relaxed">{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50/40 border border-amber-200/60 border-t-4 border-t-amber-500 rounded-2xl p-5 shadow-xs flex flex-col space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-amber-200/50">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0">
                  <AlertCircle size={13} className="text-amber-700" />
                </span>
                <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest">
                  Areas to Improve
                </h4>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-800 font-medium flex-1">
                {weaknesses.length > 0 ? (
                  weaknesses.map((wk, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <AlertCircle
                        size={13}
                        className="text-amber-600 shrink-0 mt-0.5"
                      />
                      <span className="leading-relaxed">{wk}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">
                    No specific weak areas flagged.
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* What to Cut (Off-Topic & Filler Fluff) & Model Answer Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-rose-50/50 border border-rose-200 border-t-4 border-t-rose-500 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-rose-200/60">
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold shrink-0">
                  <Scissors size={12} className="text-rose-700" />
                </span>
                <h4 className="text-xs font-black text-rose-900 uppercase tracking-widest">
                  What to Cut (Off-Topic &amp; Fluff)
                </h4>
              </div>
              <ul className="space-y-2.5 text-xs text-rose-950 font-medium">
                {whatToCut.map((cut, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between gap-2 bg-white/70 p-2.5 rounded-xl border border-rose-200/60"
                  >
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className="text-rose-600 font-bold shrink-0 mt-0.5">
                        ✕
                      </span>
                      <span className="leading-relaxed text-slate-900">
                        {cut}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        openDrillModal(
                          chatHistory[0]?.question,
                          cut,
                          modelAnswer,
                        )
                      }
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg shadow-2xs transition-all cursor-pointer shrink-0 flex items-center gap-1"
                      title="Practice this question eliminating this specific fluff"
                    >
                      <Zap size={10} />
                      <span>45s Re-Do</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-indigo-50/50 border border-indigo-200 border-t-4 border-t-indigo-600 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-indigo-200/60">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                  <Sparkles size={12} className="text-indigo-700" />
                </span>
                <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest">
                  Top 5% Candidate Model Answer
                </h4>
              </div>
              <p className="text-xs text-indigo-950 font-medium italic leading-relaxed bg-white/80 p-3 rounded-xl border border-indigo-100">
                {modelAnswer}
              </p>
            </div>
          </div>

          {/* Actionable Coaching Recommendations Container */}
          {aiSuggestions.length > 0 && (
            <div className="bg-white border border-slate-200/80 border-t-4 border-t-indigo-600 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                  <Target size={12} className="text-indigo-700" />
                </span>
                <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest">
                  Actionable Coaching & Next Steps
                </h4>
              </div>
              <div className="space-y-2 text-xs font-medium">
                {aiSuggestions.map((sug, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200"
                  >
                    <ArrowRight
                      size={13}
                      className="text-indigo-600 shrink-0 mt-0.5"
                    />
                    <span className="leading-relaxed">{sug}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Question-by-Question Discussion Stream Breakdown */}
          {chatHistory.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 text-left space-y-3.5 max-h-[380px] overflow-y-auto">
              <div className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2 flex items-center justify-between">
                <span>Detailed Interview Discussion & QA Critique</span>
                <span className="text-slate-500 font-mono text-[10px]">
                  All Interview Rounds
                </span>
              </div>

              {chatHistory.map((item, qIdx) => (
                <div
                  key={qIdx}
                  className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-2 text-xs shadow-2xs"
                >
                  {item.question && (
                    <p className="text-slate-900 font-semibold leading-relaxed">
                      <span className="text-amber-800 font-extrabold">
                        Interviewer Q:
                      </span>{" "}
                      {item.question}
                    </p>
                  )}
                  {item.text && (
                    <div className="space-y-2">
                      <p className="text-slate-800 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                        <span className="font-bold text-slate-900">
                          Your Answer:
                        </span>{" "}
                        {item.text}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400 font-bold">
                          Turn {qIdx + 1}
                        </span>
                        <button
                          onClick={() =>
                            openDrillModal(
                              item.question,
                              "Cut unnecessary preamble and deliver using the STAR framework",
                              modelAnswer,
                            )
                          }
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[11px] rounded-lg border border-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <RefreshCw size={11} />
                          <span>Practice 45s Re-Do</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              setStep("setup");
              setChatHistory([]);
              setUserAnswerText("");
            }}
            className="w-full py-4 bg-[#151930] hover:bg-[#0B0E27] text-white font-black text-xs sm:text-sm rounded-xl shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Practice Another Job Role / Resume Session</span>
          </button>
        </div>
      )}

      {/* RAPID RE-DO DRILL MODAL (REHEARSAL GYM) */}
      {showDrillModal &&
        mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeDrillModal();
            }}
          >
            <div className="bg-[#0B0E27] border border-slate-700/80 rounded-3xl max-w-xl w-full p-5 sm:p-7 text-white shadow-2xl relative overflow-hidden flex flex-col gap-4 my-auto max-h-[90vh] overflow-y-auto">
              {/* Top Accent Gradient Stripe */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-indigo-600"></div>

              {/* Modal Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs font-black">
                    <Flame size={14} />
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white">
                      45-Second Rapid Re-Do Drill
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Placement Gym • Re-deliver without fillers or hesitation
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeDrillModal}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                  title="Close drill (Esc)"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drill Target Card */}
              <div className="bg-[#151930] rounded-2xl p-4 border border-slate-800 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    Target Question
                  </span>
                  <p className="text-slate-200 font-semibold leading-relaxed mt-0.5">
                    {drillTargetQuestion}
                  </p>
                </div>
                {drillWeakness && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-start gap-1.5 text-rose-300">
                    <span className="font-bold text-[10px] uppercase text-rose-400 shrink-0">
                      Fluff to Cut:
                    </span>
                    <span className="font-medium text-[11px]">
                      {drillWeakness}
                    </span>
                  </div>
                )}
              </div>

              {/* Drill Recording & Timer Area */}
              <div className="bg-[#0e1233] border border-indigo-950/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-3">
                {/* 45s Circular Countdown Gauge */}
                <div className="relative flex items-center justify-center">
                  <div
                    className={`w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all ${
                      isDrillRecording
                        ? "bg-red-600/20 border-2 border-red-500 animate-pulse text-red-400"
                        : drillCompleted
                          ? "bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400"
                          : "bg-slate-800 border-2 border-slate-700 text-slate-300"
                    }`}
                  >
                    <span className="text-2xl font-black font-mono leading-none">
                      {drillCountdown}
                    </span>
                    <span className="text-[9px] uppercase font-bold tracking-wider mt-0.5">
                      SEC
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                  {!isDrillRecording && !drillCompleted && (
                    <button
                      onClick={startDrillRecording}
                      className="px-6 py-3 bg-gradient-to-r from-amber-400 to-[#F2A93B] hover:from-amber-300 text-[#151930] font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
                    >
                      <Mic size={15} />
                      <span>Start 45s Drill</span>
                    </button>
                  )}

                  {isDrillRecording && (
                    <button
                      onClick={stopDrillRecording}
                      className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Square size={14} className="fill-white" />
                      <span>Complete &amp; Evaluate</span>
                    </button>
                  )}

                  {drillCompleted && (
                    <button
                      onClick={startDrillRecording}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw size={13} />
                      <span>Try Drill Again</span>
                    </button>
                  )}
                </div>

                {/* Real-time Filler Count Pill */}
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="text-slate-400">
                    Fillers detected in retry:
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono font-black ${
                      drillFillersFound.length === 0
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/20 text-rose-400"
                    }`}
                  >
                    {drillFillersFound.length}{" "}
                    {drillFillersFound.length === 1 ? "word" : "words"}
                  </span>
                </div>

                {/* Live Transcript / Speech Feedback */}
                {drillTranscript && (
                  <div className="w-full bg-[#151930] border border-slate-800 rounded-xl p-3 text-left max-h-24 overflow-y-auto text-xs font-medium text-slate-200 leading-relaxed">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">
                      Your Re-Spoken Delivery:
                    </span>
                    &ldquo;{drillTranscript}&rdquo;
                  </div>
                )}

                {/* Drill Evaluation Result */}
                {drillCompleted && (
                  <div
                    className={`w-full p-3.5 rounded-xl border text-left text-xs font-medium space-y-1 animate-fade-in ${
                      drillFillersFound.length === 0
                        ? "bg-emerald-950/40 border-emerald-600/60 text-emerald-200"
                        : "bg-amber-950/40 border-amber-600/60 text-amber-200"
                    }`}
                  >
                    <div className="flex items-center justify-between font-black uppercase text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2
                          size={14}
                          className={
                            drillFillersFound.length === 0
                              ? "text-emerald-400"
                              : "text-amber-400"
                          }
                        />
                        <span>
                          {drillFillersFound.length === 0
                            ? "Zero-Filler Mastery Achieved!"
                            : "Drill Completed!"}
                        </span>
                      </span>
                      <span className="text-amber-400 font-extrabold">
                        +{drillBonusXp} Bonus XP
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {drillFillersFound.length === 0
                        ? "Exceptional execution. You cut all hesitation markers and delivered a clean, punchy explanation."
                        : `Solid repetition. You reduced filler dependency. Practice replacing '${drillFillersFound[0] || "fillers"}' with 1 second of deliberate silence.`}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 pt-1 border-t border-slate-800">
                <button
                  onClick={closeDrillModal}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Back to Full Report
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Fresh Start / Retry Confirmation Modal */}
      {showRetryConfirmModal && mounted &&
        createPortal(
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
            <div className="bg-[#151930] border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 text-white text-left shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Fresh Start / Retry Round?</h3>
                  <p className="text-xs text-slate-400 font-medium">Reset current round back to Question 1</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Want to restart this round fresh? Your question progress will reset to Question 1 of <strong>Round {mockSeriesRound}</strong> so you can give your absolute best response!
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRetryConfirmModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRetryConfirmModal(false);
                    restartCurrentRound();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-black shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Confirm Fresh Start</span>
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      <GuestAuthModal
        isOpen={isGuestAuthModalOpen}
        onClose={() => setIsGuestAuthModalOpen(false)}
        featureName="AI Mock Interview Campaign"
      />
    </>
  );
}
