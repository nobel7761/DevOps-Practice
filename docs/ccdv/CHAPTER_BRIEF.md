# CCDV-F chapter brief (for chapter-writing agents)

You write ONE chapter of a Bangla prep course for the **Claude Certified Developer – Foundations (CCDV-F)** exam.
Learner: a developer from Bangladesh, comfortable with code, new to the Claude platform. Style = "Mastering AWS and
DevOps": a running story, easy examples, then depth. The learner studies 2 hours/day; this chapter is one day.

## Read first (in this order, do not skip)

1. `docs/ccdv/FACTS.md` — verified exam facts, blueprint, skills, question distribution.
2. `docs/ccdv/exam-guide.txt` — the official exam guide (domains/skills text). Your chapter's skills come from here.
3. Your chapter's entry in `apps/frontend/src/lib/data/ccdv/schedule.ts` (id, title, domains, topics). **Cover every listed topic.**
4. `apps/frontend/src/lib/data/ccdv/types.ts` (`CcdvChapterContent`) and `apps/frontend/src/lib/data/hermes/lesson.types.ts` (block/diagram shapes).
5. The reference chapter `apps/frontend/src/lib/data/ccdv/chapters/ch01.json` (if it exists) — match its depth, tone, structure.

## Deliverable

ONE file: `apps/frontend/src/lib/data/ccdv/chapters/<chapterId>.json` with exactly this shape:

```
{
  "lesson": { "oneLiner": "...", "blocks": [LessonBlock...], "recap": ["..."] },
  "lab": { "goal": "...", "requirements": ["..."], "steps": [{"title":"...","body":"markdown"}], "checkpoints": ["..."] },
  "notes": "markdown cheat-sheet",
  "flashcards": [{"front":"...","back":"..."}],
  "mcqs": [{"question","options","answerIndexes","explanation","domain","skill"}]
}
```

Write it with a small Python script using `json.dump(obj, f, ensure_ascii=False, indent=2)` and run it with `python3 -I`
(avoids Bangla/quote-escaping bugs). Keep the generator script in the scratchpad/tmp, NOT in the repo.

## Accuracy rules (most important)

- Facts about Claude (API params, features, model behaviour, Claude Code, MCP, Agent SDK, pricing ratios) must come from the
  **official sources you fetch**: Anthropic docs (platform.claude.com/docs, docs.claude.com), Claude Code docs, modelcontextprotocol.io,
  Anthropic engineering blog ("Building effective agents"). Use WebFetch/WebSearch. Never invent parameters, headers, flags, numbers.
- Do NOT hardcode a specific model id in lab code that may be outdated: read the model from an env var (`MODEL = os.environ["CLAUDE_MODEL"]`)
  and tell the learner to copy a current id from the official models overview page. Do not state exact $ prices; use relative statements
  (e.g. "cache reads cost a fraction of normal input") unless the official docs state a figure you fetched — then cite it.
- If something is uncertain or the docs disagree, say so honestly in a `callout` (tone `warning`) instead of guessing.
- Exam focus: the blueprint skills in your chapter are what is tested. Put "exam trap" callouts where a plausible wrong answer exists.

## Content requirements

**Language:** Bangla (Bengali script) prose; keep technical terms, code, commands and JSON keys in English. Friendly, simple, concrete.

**Running story:** the startup **ChaiCart** (a Dhaka online tea shop) is building a support agent **Chai-Bot** on Claude. Characters:
**Rafi** (junior developer, the learner's stand-in) and **Nusrat Apu** (tech lead who asks the awkward production questions).
Open the chapter with a short scene where a real problem appears (cost spike, wrong tool call, leaked secret, ...). Return to the
story as each concept is introduced. Keep the story short — concepts and exam relevance are the point.

**lesson.blocks** (target 2500–3500 words of Bangla across blocks):

- ≥ 6 `markdown` blocks with `##`/`###` headings, tables, bullets, fenced code (`python / `json / ```bash). Cover every topic
  of the chapter in depth, with at least one worked example per topic.
- ≥ 2 `diagram` blocks (kinds: `architecture`, `sequence`, `steps`, `compare` — see lesson.types.ts; every diagram has a Bangla `caption`).
  `architecture` nodes need `{id,kind,label,x,y}` with x spacing ~220, y spacing ~100–120, ≤ 5 nodes across; kinds allowed:
  client,user,server,database,cache,queue,load-balancer,cdn,gateway,external. `sequence`: ≤ 4 participants, ≤ 8 messages.
- ≥ 2 `simulator` blocks using the data-driven simulators below (pick the ones that fit; vary them). Each is
  `{"type":"simulator","id":"<id>","props":{...}}`.
- ≥ 3 `callout` blocks (`tip` | `warning` | `info`). At least one must be titled "Exam trap" (what the exam tries to trick you with).
- A final markdown block "## পরীক্ষায় এটা কীভাবে আসে" listing the blueprint skills covered and the typical question shapes.
- `recap`: 5–7 one-sentence takeaways. `oneLiner`: one Bangla sentence starting "এই chapter শেষে ...".

**Data-driven simulators** (`props` are JSON; all strings Bangla unless a term):

1. `flow-stepper` — animated step-by-step message flow.
   `{"title","hint","actors":[{"id","label"}],"steps":[{"from":"actorId","to":"actorId","label":"short","note":"Bangla explanation of this step"}],"takeaway"}`
   (use for: API request/response, tool-use loop, agent loop, MCP handshake, streaming events, caching hit/miss, retries). 3–5 actors, 6–12 steps.
2. `sort-game` — classify each item into a bucket, instant feedback.
   `{"title","hint","buckets":[{"id","label"}],"items":[{"text","bucket":"bucketId","why":"Bangla reason"}],"takeaway"}`
   (use for: workflow vs agent, retriable vs terminal errors, built-in vs custom tool vs Skill vs MCP, trusted vs untrusted input). 2–4 buckets, 6–10 items.
3. `budget-meter` — sliders over a token budget; bar + optional illustrative cost.
   `{"title","hint","capacity":200000,"capacityLabel":"Context window","items":[{"id","label","tokens","min","max","step","costFactor"}],"ratePerMillion":3,"takeaway"}`
   (use for: context window, prompt caching/batch cost; `costFactor` e.g. 0.1 for cache reads, 0.5 for batch — only if the official docs you fetched give that ratio.
   `ratePerMillion` is an illustrative number — say so in `hint`.) 3–6 items.
4. `layer-toggle` — switch defence/guardrail layers on; see which attacks get stopped.
   `{"title","hint","layers":[{"id","label","desc","blocks":["attackId"]}],"attacks":[{"id","label","desc"}],"takeaway"}`
   (use for: security, guardrails, hooks, human approval, validation layers.) 3–5 layers, 4–6 attacks.

If a concept truly needs a simulator we do not have, do not build one — mention the idea in your final report.

**lab** (hands-on, ~25 min, Python 3.10+ unless the topic is Claude Code/CLI): `goal`, `requirements` (e.g. Python, `pip install anthropic`,
API key in `ANTHROPIC_API_KEY`, `CLAUDE_MODEL` env var), 4–7 `steps` each with a runnable code block and the expected observation, and 4–6
`checkpoints` (questions the learner must be able to answer). Code must be correct against the official SDK docs you fetched. Keep it small.
Claude Code / MCP / config chapters may use `claude` CLI, `.mcp.json`, `settings.json`, `CLAUDE.md` examples.

**notes:** a markdown cheat sheet (400–800 words): tables of key terms, "when to use X vs Y", numbers/limits that are in the official docs, common traps.

**flashcards:** 18–24 cards, short front (question/term), back = crisp answer (≤ 2 sentences). Mix definition, "which to choose", and trap cards.

**mcqs:** exactly 15. Same style as the real exam (see sample questions in exam-guide.txt): a short realistic scenario, then "which approach best
fits / which is the most likely cause / which TWO...". 4 options (A–D), plausible distractors, no "all of the above"/"none". About 4 of the 15 are
multiple-response (`answerIndexes` has 2 entries and the question text says "Select TWO."). Spread correct answers across positions. Each has a
Bangla `explanation` saying why the right answer is right AND why the main distractors are wrong. `domain` = blueprint domain number 1–8 (use 0 only for ch00),
`skill` = the exact blueprint skill name from FACTS.md. Cover every skill of your chapter's domains proportionally.

## Hard rules

- Create/overwrite only your own `chapters/<chapterId>.json`. Do not edit any other repo file. Never run git add/commit/push/reset/checkout/stash.
- Validate before finishing: from `apps/frontend` run
  `source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && npx vitest run src/lib/data/ccdv` and fix every problem reported for your file.
- Do not copy long verbatim passages from the docs; retell in your own words. No secrets.

## Final report (short)

Files written; official pages you relied on (URLs); anything uncertain or contradictory you flagged; new-simulator ideas.
