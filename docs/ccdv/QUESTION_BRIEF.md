# CCDV-F mock-exam question brief (for question-writing agents)

You write a POOL of realistic exam questions for one slice of the blueprint. A script later deals the pools into 10 mock exams
of 53 questions, so each question must stand alone. **Questions are in English only** (the real exam has no Bangla).
Explanations are also English.

## Read first

1. `docs/ccdv/FACTS.md` (blueprint, skills, distribution) and `docs/ccdv/exam-guide.txt` (official skill text + 3 sample questions — copy their style).
2. Official Anthropic docs for accuracy (platform.claude.com/docs, docs.claude.com, Claude Code docs, modelcontextprotocol.io, Anthropic engineering
   blog). Use WebFetch/WebSearch to confirm any API/feature/limit claim you are not 100% sure of. Never invent parameters, flags or numbers.
   If a fact is version-dependent or uncertain, do not build a question on it.

## Question style (match the real exam)

- Scenario-first: 2–5 sentences describing a realistic engineering situation, then one clear ask ("Which approach best fits?", "What is the most likely
  cause?", "Which TWO changes ...?"). Test **judgment/tradeoffs**, not trivia or memorised numbers.
- 4 options (A–D) for single-answer; 5 options (A–E) allowed for "Select TWO" / "Select THREE". Exactly one clearly best answer (or exactly N correct for multi-response).
  Distractors must be plausible-but-wrong (common misconceptions, over-engineering, partial fixes, the wrong tool for the job).
- ~20% of questions are multiple-response: question text ends with "Select TWO." (or THREE) and `answerIndexes` has that many entries.
- No "all of the above", "none of the above", "both A and B", or options that reference other options by letter (a script reshuffles option order).
- Vary difficulty: ~30% straightforward, ~50% moderate, ~20% hard (subtle distractors). Vary the scenario domain (support bot, document pipeline,
  coding agent, data extraction, internal tooling, healthcare/finance-compliance, e-commerce, ...). Do not repeat the same scenario twice.
- Each question needs a concise English `explanation` (2–5 sentences): why the correct answer is right and why the most tempting distractors are wrong.
- No duplicates or near-duplicates inside your pool. Do not copy the three official sample questions.

## Deliverable

ONE JSON file: `apps/frontend/src/lib/data/ccdv/question-pools/<poolName>.json` — an array of objects:

```
{ "domain": 2, "skill": "Claude API Mechanics", "chapterId": "ch03",
  "question": "...", "options": ["...","...","...","..."], "answerIndexes": [1], "explanation": "..." }
```

- `domain` = blueprint domain 1–8; `skill` = the exact skill name from FACTS.md; `chapterId` = the chapter that teaches it (see map below).
- Write with a small Python script (`json.dump(..., ensure_ascii=False, indent=2)`, run via `python3 -I`); keep the script outside the repo.
- Hit the **exact counts per skill** given in your assignment (they follow the exam weights). Count before finishing.
- Validate: from `apps/frontend` run
  `source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && npx vitest run src/lib/data/ccdv` and fix everything reported for your file.

Skill → chapter map: LLM Fundamentals/Technical Fundamentals → ch01 (and ch05 for SDK/REST/websocket); Model Selection and Tradeoffs, Cost and Token
Management → ch02; Claude API Mechanics → ch03; Understanding Requirements, Systems Life Cycle, Claude Application Design → ch04; Software Engineering
Foundations, Configuration Management → ch05; Prompt Engineering, Output Handling → ch06; Context Engineering → ch07; Tool Implementation → ch08;
MCP Server Development → ch09; Agentic Customization, Claude Code Operation → ch10; Agent Architecture, Agent Patterns and Frameworks → ch11;
Agent Construction with Claude → ch12; Debugging and Error Handling → ch13; AI Application Security, Guardrails and Safe Deployment, Claude Hooks,
Identity Secrets and Key Management → ch14.

## Hard rules

- Only create your own pool file. Do not edit any other repo file. Never run git add/commit/push/reset/checkout/stash.
- Final report (short): file written, counts per skill, any topic you avoided because the docs were unclear.
