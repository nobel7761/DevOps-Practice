# Hermes docs lesson brief (for lesson-writing agents)

You write Bangla "golpo" lessons that retell pages of the official Hermes Agent
documentation (https://hermes-agent.nousresearch.com/docs/...) for an absolute
beginner. The reader is treated as a 5-year-old: simple words, a story or
everyday analogy first, then the real concept, then real commands/config.

## Deliverable per page

One JSON file:
`apps/frontend/src/lib/data/hermes/docs/<contentId>.json`

`contentId` = `hermes-doc-` + page path with `/` replaced by `-`.
Example: path `user-guide/features/memory` -> `hermes-doc-user-guide-features-memory`.

The shape is `HermesLesson` in `apps/frontend/src/lib/data/hermes/lesson.types.ts`.
**The reference example is `hermes-doc-user-guide-features-memory.json` in the same
folder. Read it fully first and match its depth, tone and structure.**

## Steps for each page

1. `WebFetch` the official page (`https://hermes-agent.nousresearch.com/docs/<path>`).
   Ask for a complete rundown: every concept, file name, command, config key,
   number, example, in order. If the page is long, fetch it in parts (offset) so
   nothing is lost. Follow important sub-links only if needed to explain.
2. Write the lesson from what you fetched. **Accuracy rule: only state facts that
   are in the fetched page. Never invent commands, flags, config keys, numbers,
   or behaviours.** If the page is thin (e.g. "no description"), write a shorter,
   honest lesson from what exists; do not pad with guesses. If a fetch fails,
   skip that page and report it - do not write a guessed lesson.
3. Write the JSON with a small Python script using `json.dump(..., ensure_ascii=False,
indent=2)` (avoids quote-escaping bugs in Bangla/markdown). Use `python3 -I`.
4. Validate: from `apps/frontend` run
   `source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && npx vitest run src/lib/data/hermes`
   and fix every reported problem for your files.

## Content requirements (per lesson)

- **Language:** Bangla prose; keep technical terms in English (Skill, MCP, cron,
  profile, config.yaml, token...). Commands/config/code stay exactly as in docs.
- **Open with a golpo/analogy** (`## ...` heading, a small story with a character
  or everyday scene) that maps to the real mechanism, then explain the real thing.
- **Blocks** (`blocks` array), in a sensible teaching order, at least:
  - > = 3 `markdown` blocks (use `##`/`###` headings, tables, bullet lists, fenced
    > code with language like `bash / `yaml / ```text). Cover the page
    > thoroughly: real commands, config keys, limits, gotchas, an extra example
    > where it helps a beginner.
  - > = 1 `diagram` block. Kinds (see types file):
    - `architecture`: nodes {id, kind, label, x, y} + edges {from,to,label}.
      kind in: client,user,server,database,cache,queue,load-balancer,cdn,gateway,external.
      Node size is 132x64: use x spacing ~220, y spacing ~100-120; keep <= 5 nodes
      across and keep every edge's from/to pointing at an existing node id.
    - `sequence`: participants {id,kind,label} + messages {from,to,label,dashed?}
      (<= 4 participants, <= 8 messages).
    - `steps`: step-by-step walkthrough [{title, body(markdown)}], >= 2 steps.
    - `compare`: before/after markdown panels.
      Every diagram has a one-line Bangla `caption`. Use a visual wherever it
      clarifies (flows, lifecycles, comparisons). 1-3 diagrams per lesson is typical.
  - `callout` blocks (tone: tip | warning | info) for gotchas/security/tips.
  - **`simulator` block only when it truly fits.** Available ids:
    `agent-loop`, `memory`, `cron`, `approval`, `delegation`, `context-window`.
    Use `memory` only in the memory lesson. Use one of the others only where the
    page is genuinely about that mechanism (e.g. cron page -> `cron`, delegation
    page -> `delegation`, security/approval page -> `approval`, sessions/context
    compression -> `context-window`, agent loop page -> `agent-loop`). Never
    force a simulator onto a page it does not fit. If you believe a lesson would
    benefit from a _new_ simulator, do not build it - list the idea in your final
    report (id, what it would show) and continue.
- **quiz:** 6-8 MCQs testing understanding (not trivia), 3-5 options, a
  Bangla `explanation` each, vary the correct position (`answerIndex`).
  Base every question on content of the fetched page.
- **recap:** 4-6 one-sentence takeaways.
- `oneLiner`: one plain Bangla sentence starting "এই lesson শেষে ...".
- `sourceUrl`: the exact official docs URL.

## Hard rules

- Only create/overwrite your own lesson JSON files. Do not edit any other file
  (no TS/TSX, no course outline, no tests, no other agent's lessons).
- Never run git add/commit/push/reset/checkout/stash.
- Do not write secrets. Do not copy long verbatim passages of the docs; retell.
- Keep each lesson substantial (roughly 900-2500 words of Bangla markdown across
  blocks, scaled to how rich the page is).

## Final report (keep it short)

List: files written (contentIds), pages skipped/failed and why, pages where the
source was thin, and any new-simulator ideas.
