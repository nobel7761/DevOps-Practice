// Official exam facts (Exam Guide v1.0, July 2026) — see docs/ccdv/FACTS.md.

import type { DomainId } from "./types";

export const EXAM_ITEMS = 53;
export const EXAM_MINUTES = 120;
export const PASS_SCALED = 720;
export const SCALED_MIN = 100;
export const SCALED_MAX = 1000;
export const EXAM_COUNT = 10;

export interface DomainInfo {
  id: DomainId;
  name: string;
  weight: number;
}

export const DOMAINS: DomainInfo[] = [
  { id: 1, name: "Agents and Workflows", weight: 14.7 },
  { id: 2, name: "Applications and Integration", weight: 33.1 },
  { id: 3, name: "Claude Code", weight: 3.1 },
  { id: 4, name: "Eval, Testing, and Debugging", weight: 2.6 },
  { id: 5, name: "Model Selection and Optimization", weight: 16.8 },
  { id: 6, name: "Prompt and Context Engineering", weight: 11.0 },
  { id: 7, name: "Security and Safety", weight: 8.1 },
  { id: 8, name: "Tools and MCPs", weight: 10.6 },
];

export const DOMAIN_IDS = DOMAINS.map((domain) => domain.id);

export function domainName(id: DomainId): string {
  return DOMAINS.find((domain) => domain.id === id)?.name ?? `Domain ${id}`;
}

/** Items per domain in one exam. D3/D4 are 2/1 in "even" exams and 1/2 in "odd" ones (see examDomainCounts). */
const BASE_COUNTS: Record<DomainId, number> = {
  1: 8,
  2: 17,
  3: 2,
  4: 1,
  5: 9,
  6: 6,
  7: 4,
  8: 6,
};

const SWAP_EXAMS = new Set([7, 8, 9, 10]);

/** How many questions of each domain exam `number` (1-10) must contain. Always sums to 53. */
export function examDomainCounts(number: number): Record<DomainId, number> {
  if (!SWAP_EXAMS.has(number)) return { ...BASE_COUNTS };
  return { ...BASE_COUNTS, 3: 1, 4: 2 };
}

/** Total questions needed per domain across all 10 exams. */
export const TOTAL_DOMAIN_COUNTS: Record<DomainId, number> = {
  1: 80,
  2: 170,
  3: 16,
  4: 14,
  5: 90,
  6: 60,
  7: 40,
  8: 60,
};

export interface SkillInfo {
  domain: DomainId;
  name: string;
  /** Questions of this skill across all 10 mock exams (sums to TOTAL_DOMAIN_COUNTS). */
  target: number;
}

export const SKILLS: SkillInfo[] = [
  { domain: 1, name: "Agent Architecture", target: 25 },
  { domain: 1, name: "Agent Construction with Claude", target: 29 },
  { domain: 1, name: "Agent Patterns and Frameworks", target: 26 },
  { domain: 2, name: "Understanding Requirements", target: 17 },
  { domain: 2, name: "Systems Life Cycle", target: 14 },
  { domain: 2, name: "Claude API Mechanics", target: 35 },
  { domain: 2, name: "Software Engineering Foundations", target: 38 },
  { domain: 2, name: "Claude Application Design", target: 45 },
  { domain: 2, name: "Configuration Management", target: 21 },
  { domain: 3, name: "Claude Code Operation", target: 16 },
  { domain: 4, name: "Debugging and Error Handling", target: 14 },
  { domain: 5, name: "LLM Fundamentals", target: 28 },
  { domain: 5, name: "Technical Fundamentals", target: 33 },
  { domain: 5, name: "Model Selection and Tradeoffs", target: 14 },
  { domain: 5, name: "Cost and Token Management", target: 15 },
  { domain: 6, name: "Context Engineering", target: 21 },
  { domain: 6, name: "Prompt Engineering", target: 25 },
  { domain: 6, name: "Output Handling", target: 14 },
  { domain: 7, name: "AI Application Security", target: 16 },
  { domain: 7, name: "Guardrails and Safe Deployment", target: 11 },
  { domain: 7, name: "Claude Hooks", target: 5 },
  { domain: 7, name: "Identity, Secrets, and Key Management", target: 8 },
  { domain: 8, name: "Tool Implementation", target: 25 },
  { domain: 8, name: "MCP Server Development", target: 12 },
  { domain: 8, name: "Agentic Customization", target: 23 },
];
