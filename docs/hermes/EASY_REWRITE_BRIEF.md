# Easy-rewrite brief (Milestone 1 lessons)

Goal: rewrite an EXISTING Hermes docs lesson so a **complete beginner (treat the
reader as a 5-year-old)** understands every word. The learner said: "I don't
understand many terms — what does it do, why is it needed?" Fix that.

## Source of truth and reference

- Facts come from the existing lesson JSON at
  `apps/frontend/src/lib/data/hermes/docs/<contentId>.json` (already verified
  against the official docs). Keep every fact, command, flag, config key, number.
  Never invent facts. If you need to double-check something, WebFetch the
  official page (`sourceUrl` in the JSON).
- **Style reference (read fully first): `hermes-doc-getting-started-installation.json`
  in the same folder.** Match its depth and approach.

## What to change (rewrite the file in place, same contentId, same sourceUrl)

1. **Every jargon term gets explained the first time it appears**: what it is,
   what it does, why Hermes needs it — with a tiny everyday analogy
   (kitchen, school, post office, toy etc.). Examples of terms to never leave
   bare: terminal, command, shell, PATH, flag, config, YAML, JSON, API, API key,
   token, provider, model, LLM, session, daemon/service, gateway, webhook, MCP,
   Docker/container/image, git, repo, cron, env var, sandbox, SSH, port,
   localhost, POSIX, channel, log, plugin, hook, profile, skill, tool, toolset,
   subagent, context window, embedding, FTS, OAuth, etc.
2. Add a short block near the top, "## আগে কয়েকটা শব্দ চিনে নিই", listing the 4-8
   terms this lesson needs, each in 1-2 simple sentences (+ analogy).
3. For every command/config line a beginner will copy, explain **each part**
   (a small table: part | meaning | analogy) and what output/result to expect.
4. Explain the "why": before each feature say what problem it solves
   ("এটা না থাকলে কী সমস্যা হতো").
5. Tables like "flag | meaning" must have a plain-language "কখন লাগে" column.
6. Keep the golpo opening, but make it simpler and tie it to the real mechanism.
7. Keep language Bangla, technical terms in English. Short sentences. No
   unexplained abbreviations. Prefer "মানে ..." explanations.
8. Keep required lesson shape (see LESSON_BRIEF.md): >=3 markdown blocks, >=1
   diagram, callouts, 6-8 quiz, 4-6 recap, `oneLiner` starting "এই lesson শেষে ...".
   Keep existing simulator blocks (same id) if the lesson has one.
9. Quiz: test understanding of the plain-language ideas; vary the correct
   `answerIndex` (must not always be the same position - validator fails otherwise).
10. Length: richer than before is fine (roughly 1800-3500 words) — clarity beats brevity.

## Diagram rule (important)

Node labels render inside a 132x64 box. Keep architecture node labels **<= 16
characters** (short English/Bangla words like "Hermes", "Chat app", "Docker /
VPS"); put detail in edge labels or the caption. Edge labels short too.

## Hard rules

- Write JSON with a small Python script (`json.dump(..., ensure_ascii=False,
indent=2)`), run with `python3 -I`; keep scripts in the scratchpad, not the repo.
- Only edit your assigned lesson JSON files. No other files. No git commands.
- Validate: from `apps/frontend` run
  `source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && npx vitest run src/lib/data/hermes`
  and fix every problem for your files.
- Final report (short): files rewritten, anything you could not verify.
