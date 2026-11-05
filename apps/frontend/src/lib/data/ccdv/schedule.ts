// Single source of truth for the CCDV-F study schedule: which chapter is studied on
// which day, and which topics that day must cover. Topics are what the learner ticks
// off (via the four trackable parts of each chapter), so keep them concrete.

import type { ChapterPart, DomainId } from "./types";

export interface ChapterMeta {
  id: string;
  day: number;
  title: string;
  /** Blueprint domains this chapter prepares for (empty for the certification intro). */
  domains: DomainId[];
  /** Official prerequisite courses / main-path modules this chapter replaces. */
  covers: string[];
  topics: string[];
}

export const CHAPTERS: ChapterMeta[] = [
  {
    id: "ch00",
    day: 1,
    title: "Certification পরিচিতি: কী, কেন, কীভাবে",
    domains: [],
    covers: ["Claude 101"],
    topics: [
      "CCDV-F কী এবং কাদের জন্য",
      "Exam format, scoring ও 720 pass mark",
      "Pricing, eligibility ও registration",
      "Exam-day rules ও Pearson OnVUE",
      "Blueprint (8 domain) ও weight",
      "Preparation strategy, retake ও renewal",
    ],
  },
  {
    id: "ch01",
    day: 1,
    title: "LLM fundamentals: token, context window, sampling",
    domains: [5],
    covers: [
      "AI Capabilities and Limitations",
      "AI Fluency: Framework & Foundations",
      "MSO Foundations",
    ],
    topics: [
      "Token ও tokenization",
      "Context window একটা fixed budget",
      "Sampling, temperature ও non-determinism",
      "Next-token generation ও limitation",
      "Zero-shot, single-shot, multi-shot",
      "AI Fluency 4D framework",
    ],
  },
  {
    id: "ch02",
    day: 2,
    title: "Model selection, thinking mode ও cost optimization",
    domains: [5],
    covers: ["Building with the Claude API"],
    topics: [
      "Opus vs Sonnet vs Haiku",
      "Fast mode, extended ও adaptive thinking, effort",
      "Model version pinning ও breaking changes",
      "Token usage tracking ও cost modeling",
      "Prompt caching ও cache check-pointing",
      "Realtime vs Batch API tradeoff",
    ],
  },
  {
    id: "ch03",
    day: 3,
    title: "Claude API mechanics",
    domains: [2],
    covers: ["Claude Platform 101", "Building with the Claude API"],
    topics: [
      "Messages API, role ও multi-turn",
      "System prompt ও parameters",
      "Streaming ও stream recovery",
      "Vision, PDF ও Files API",
      "SDK vs raw REST",
      "Bedrock / Vertex দিয়ে Claude ব্যবহার",
    ],
  },
  {
    id: "ch04",
    day: 4,
    title: "Application design, requirements ও SDLC",
    domains: [2],
    covers: ["Main path: Production-Grade Prompting, Agents & Tool Use"],
    topics: [
      "Functional ও infrastructure requirements",
      "Systems life cycle",
      "Interface ভেদে instruction interpretation",
      "Content boundary ও schema design",
      "Session hygiene",
      "Plugin management",
    ],
  },
  {
    id: "ch05",
    day: 5,
    title: "Software engineering ও configuration management",
    domains: [2, 5],
    covers: ["Main path: Accelerators & IP Contribution", "Claude Code 101"],
    topics: [
      "REST, JSON ও async programming",
      "Version control, code review, refactoring",
      "CLAUDE.md ও settings.json",
      "Prompt versioning ও model pinning",
      "Plugin dependencies",
      "Deployment platform বেছে নেওয়া",
    ],
  },
  {
    id: "ch06",
    day: 6,
    title: "Prompt engineering ও output handling",
    domains: [6],
    covers: ["Building with the Claude API"],
    topics: [
      "Clear, specific instruction",
      "XML tag ও few-shot example",
      "System vs user placement",
      "Output constraint ও iterative refinement",
      "Structured output ও validation",
      "Defensive parsing ও confident-output skepticism",
    ],
  },
  {
    id: "ch07",
    day: 7,
    title: "Context engineering ও memory",
    domains: [6, 1],
    covers: ["Main path: Production-Grade Prompting, Agents & Tool Use"],
    topics: [
      "Context window management",
      "Context drift ও bloat",
      "Tool output pruning",
      "Compaction ও summarization",
      "Subagent দিয়ে context isolation",
      "Memory scope ও persistence",
    ],
  },
  {
    id: "ch08",
    day: 8,
    title: "Tool use ও function calling",
    domains: [8],
    covers: ["Building with the Claude API"],
    topics: [
      "Tool schema ও description লেখা",
      "Request/response loop",
      "Multiple content block ও parallel tool call",
      "Tool error handling",
      "Client-side vs server-side tool",
      "Approval pattern ও tool-set design",
    ],
  },
  {
    id: "ch09",
    day: 9,
    title: "MCP server development",
    domains: [8],
    covers: [
      "Introduction to Model Context Protocol",
      "Model Context Protocol: Advanced Topics",
    ],
    topics: [
      "MCP primitive: tools, resources, prompts",
      "Python-এ MCP server বানানো",
      "Inspector দিয়ে test",
      "Sampling, notification, roots",
      "stdio vs StreamableHTTP transport",
      "MCP config scope ও deployment",
    ],
  },
  {
    id: "ch10",
    day: 10,
    title: "Agentic customization ও Claude Code",
    domains: [8, 3],
    covers: [
      "Claude Code 101",
      "Claude Code in Action",
      "Main path: Claude Code, MCP & Integration",
    ],
    topics: [
      "Built-in tool vs custom tool vs Skill vs MCP",
      "Skills, commands, rules, agents, agent memory",
      "CLAUDE.md hierarchy ও settings.json",
      "Permission mode ও session management",
      "Headless, streaming ও auto-mode",
      "Explore → plan → code → commit",
    ],
  },
  {
    id: "ch11",
    day: 11,
    title: "Agent architecture, pattern ও framework",
    domains: [1],
    covers: ["Claude Platform 101", "Building with the Claude API"],
    topics: [
      "Workflow vs agent সিদ্ধান্ত",
      "Chaining, routing, parallelization",
      "Orchestrator-workers ও evaluator-optimizer",
      "Manager/supervisor ও subagent",
      "Tool-use loop ও memory pattern",
      "Strands, LangGraph, PydanticAI",
    ],
  },
  {
    id: "ch12",
    day: 12,
    title: "Agent construction: SDK, loop, managed agent, hook",
    domains: [1, 7],
    covers: ["Claude Platform 101", "Claude Code in Action"],
    topics: [
      "Claude Agent SDK",
      "Custom agent loop ও harness",
      "Managed agent: self-hosted vs Anthropic-hosted",
      "Hook দিয়ে deterministic action",
      "Human approval step",
      "Agent state ও memory persist করা",
    ],
  },
  {
    id: "ch13",
    day: 13,
    title: "Eval, testing, debugging ও error handling",
    domains: [4],
    covers: [
      "Main path: Production Engineering, Evals & Security",
      "Building with the Claude API (prompt evals)",
    ],
    topics: [
      "Error type: retriable vs terminal",
      "Recovery strategy (retry, backoff, fallback)",
      "Trace analysis ও failure isolation",
      "Eval suite ও grading method",
      "LLM-as-judge calibration",
      "Production monitoring, cost ও latency budget",
    ],
  },
  {
    id: "ch14",
    day: 14,
    title: "Security ও safety",
    domains: [7],
    covers: [
      "Main path: Production Engineering, Evals & Security",
      "Claude Code in Action",
    ],
    topics: [
      "Prompt injection ও jailbreak defense",
      "Untrusted input ও data leakage, PII",
      "Guardrail layering ও content policy",
      "Least privilege ও IAM",
      "Hooks দিয়ে destructive action আটকানো",
      "Secret ও API key management",
    ],
  },
];

export const STUDY_DAYS = 24;
export const LEARNING_DAYS = 14;
export const MOCK_EXAM_START_DAY = 15;

export const PART_LABELS: Record<ChapterPart, string> = {
  lesson: "গল্প + Simulator",
  lab: "Hands-on Lab",
  cards: "Notes ও Flashcards",
  mcq: "Practice MCQ",
};

export const CHAPTER_PARTS: ChapterPart[] = ["lesson", "lab", "cards", "mcq"];

export function getChapter(id: string): ChapterMeta | undefined {
  return CHAPTERS.find((chapter) => chapter.id === id);
}

export function chaptersOnDay(day: number): ChapterMeta[] {
  return CHAPTERS.filter((chapter) => chapter.day === day);
}

/** contentId for one trackable part of a chapter, e.g. "ccdv-ch03-lab". */
export function lessonContentId(chapterId: string, part: ChapterPart): string {
  return `ccdv-${chapterId}-${part}`;
}

export function examContentId(number: number): string {
  return `ccdv-exam-${String(number).padStart(2, "0")}`;
}

export const ANALYTICS_CONTENT_ID = "ccdv-analytics";

export function parseLessonContentId(
  contentId: string,
): { chapterId: string; part: ChapterPart } | null {
  const match = /^ccdv-(ch\d{2})-(lesson|lab|cards|mcq)$/.exec(contentId);
  if (!match) return null;
  return { chapterId: match[1], part: match[2] as ChapterPart };
}

export function parseExamContentId(contentId: string): number | null {
  const match = /^ccdv-exam-(\d{2})$/.exec(contentId);
  return match ? Number(match[1]) : null;
}
