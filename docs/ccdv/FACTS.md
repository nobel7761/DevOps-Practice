# CCDV-F facts sheet (verified from the official Exam Guide v1.0, July 2026)

Full official text: `docs/ccdv/exam-guide.txt` (read this instead of web-searching exam facts).
Other sources: Partner Academy FAQ (https://anthropic-partners.skilljar.com/page/faq-certifications),
eligibility page (…/page/certification-eligibility), main prep path
(https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations).

## Exam

- Claude Certified Developer – Foundations, exam code **CCDV-F**
- **53 items**, multiple-choice AND multiple-response (each item says how many to select), **120 min**, closed book
- Pass = scaled **720** on 100–1000. Score report: pass/fail + scaled score + % correct per domain
  (domain % is NOT used for pass/fail). Criterion-referenced (not curved)
- Fee **$125 USD**. Partner discounts: Select/Preferred/Global Premier 50% off; Global Premier 100% off through 2026-12-31; Registered tier full price
- Validity **12 months**. On-time renewal = free non-proctored assessment on Partner Academy. Lapsed = full retake
- Retake waits: 14 days (after 1st fail), 30 days (2nd), 90 days (3rd). Max 4 attempts / rolling 12 months, full fee each
- Delivery: Pearson VUE — online (OnVUE) or test center. Languages: English, Japanese
- Eligible: people who work at a **Claude Partner Network** org; must register with company email on partner domain
  (no personal email). Min age 18. Valid unexpired government photo ID, name must match registration exactly
- Reschedule/cancel: Exam Guide says 24h before; FAQ says 48h → treat **48h** as the safe rule. Late = fee forfeited
- Accommodations: request via Pearson at least 10 days before, BEFORE scheduling
- Exam day: no phone, watch, headphones, notes, second monitor; stay in webcam view; no copying exam content (NDA);
  run Pearson system test (system-test.onvue.com) beforehand; close chat/screen-share apps
- No mandatory prerequisite course. Recommended: 1–5 yrs software eng, 6+ months with Claude/LLMs, Python/TypeScript, REST+CLI

## Blueprint (domain weights) and skills

| #   | Domain                           | Weight |
| --- | -------------------------------- | ------ |
| 1   | Agents and Workflows             | 14.7%  |
| 2   | Applications and Integration     | 33.1%  |
| 3   | Claude Code                      | 3.1%   |
| 4   | Eval, Testing, and Debugging     | 2.6%   |
| 5   | Model Selection and Optimization | 16.8%  |
| 6   | Prompt and Context Engineering   | 11.0%  |
| 7   | Security and Safety              | 8.1%   |
| 8   | Tools and MCPs                   | 10.6%  |

Skills (weight of whole exam):

- D1: Agent Architecture 4.5 (workflow vs agent criteria, manager/supervisor, subagents) · Agent Construction with Claude 5.3
  (Agent SDK, custom loops/harness, managed agents self-hosted vs Anthropic-hosted, hooks) · Agent Patterns and Frameworks 4.9
  (tool-use loops, subagents, memory, context mgmt; Strands, LangGraph, PydanticAI)
- D2: Understanding Requirements 3.4 · Systems Life Cycle 2.8 · Claude API Mechanics 6.8 (messages, tools, streaming, vision,
  thinking, caching, third-party vendors, data access patterns, batch API, realtime vs batch) · Software Engineering Foundations 7.4
  (REST, JSON, async, version control, SDLC integration, code review, refactoring) · Claude Application Design 8.6 (instruction
  interpretation across Claude Code/Desktop/claude.ai/API/SDKs, content boundaries, schema design, session hygiene, plugin mgmt)
  · Configuration Management 4.1 (CLAUDE.md, settings.json, model version pinning, prompt versioning, plugin dependencies)
- D3: Claude Code Operation 3.1 (Rules, Skills, Commands, Agents, Agent Memory; session mgmt, slash commands, headless,
  streaming, auto-mode; CLAUDE.md hierarchy; repo init; settings.json)
- D4: Debugging and Error Handling 2.6 (error types, recovery strategy, trace analysis, integration-layer vs model-output isolation)
- D5: LLM Fundamentals 5.2 (tokens, context windows, sampling, non-determinism, next-token; fast mode, extended/adaptive thinking,
  effort levels; zero/single/multi-shot) · Technical Fundamentals 6.1 (SDKs wrapping REST, websockets) · Model Selection and
  Tradeoffs 2.7 (Opus vs Sonnet vs Haiku, adaptive thinking support, quality/latency/cost, breaking changes across releases)
  · Cost and Token Management 2.8 (usage tracking, cost modeling, prompt caching, cache check-pointing)
- D6: Context Engineering 3.8 (window mgmt, drift/bloat, tool-output pruning, compaction, subagent isolation) · Prompt Engineering
  4.6 (clarity, few-shot, system vs user placement, output constraints, iterative refinement, input sanitization) · Output
  Handling 2.6 (structured output, response validation, defensive parsing, skepticism toward confident output)
- D7: AI Application Security 3.2 (prompt injection, jailbreak, untrusted input, data leakage, PII, authn/authz) · Guardrails and
  Safe Deployment 2.3 (content policy, guardrail layering, least privilege, IAM) · Claude Hooks 1.0 · Identity, Secrets, Key Mgmt 1.6
- D8: Tool Implementation 4.4 (function calling, tool descriptions, error handling, harness dispatch, client vs server tools,
  approval patterns, tool-set best practices) · MCP Server Development 2.1 (resources/tools/prompts, stdio/sockets) ·
  Agentic Customization 4.1 (built-in tools vs custom tools vs Skills vs MCPs tradeoffs)

Sample item style (from the guide): short realistic scenario → "which approach best fits?" with 4 options, one clearly best,
distractors that are plausible-but-wrong (e.g. "raise temperature to stop prompt injection").

## Question distribution

Per 53-item exam: D1 8, D2 17, D5 9, D6 6, D7 4, D8 6, and D3+D4 = 3 (six exams have D3=2,D4=1; four exams have D3=1,D4=2).
Across 10 exams (530): D1 80, D2 170, D3 16, D4 14, D5 90, D6 60, D7 40, D8 60.

## Study schedule

24 study days (2 h/day, 6 days/week): Days 1–14 = chapters ch00–ch14 (ch00 + ch01 share Day 1), Days 15–24 = Mock Exam 1–10.
Source of truth: `apps/frontend/src/lib/data/ccdv/schedule.ts`.
