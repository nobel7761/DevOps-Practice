# Hermes Agent Mastery — build progress

Course: `apps/frontend/src/lib/data/courses/hermes-agent-mastery.ts` (registry id `hermes-agent-mastery`)

## Done

- Transcript modal (replaces inline note editor; saves via existing /notes API, green icon when present). Verified on real data: Udemy section 1 shows 5 green icons, click opens the saved transcript with Edit/Close.
- Course: Documentation (10 modules, 89 pages) + Udemy Course (7 sections, 53 lectures, outline only).
- Lesson system: `/module/doc/[contentId]` (Golpo Lesson / Quiz / Ask AI tabs), data-driven diagrams.
- 24 simulators in `components/hermes/simulators/registry.ts`
  - original 6: agent-loop, memory, cron, approval, delegation, context-window
  - added 18: update-pipeline, install-picker, toolset-picker, context-file-priority, skill-lifecycle,
    context-reference-budget, web-backend, plugin-gate, session-resume, worktree-sweep, model-switch-cost,
    stt-fallback, gateway-auth, checkpoint-rollback, secret-precedence, goal-loop, kanban-board, hook-events
- Quiz: backend bank per lesson (`apps/backend/src/hermes-quiz/data/<contentId>.json`, 20 questions each, served by `/api/hermes-quiz`). This is SEPARATE from the `quiz` array inside each lesson JSON (which the Quiz tab does not use).

## Docs lessons: passes completed

1. Gap-fill (configuration, kanban, hooks, cron, memory-providers, secrets, curator, telegram).
2. Accuracy audit of every lesson against its official page (~100 fixes, invented flags/numbers removed).
3. Contradictions settled from the Hermes source (NousResearch/hermes-agent): cron natural-language works; curator 14/30 days;
   Telegram streaming off by default, transport `auto`; 1Password `.op.env` is a load order; `delegation.max_concurrent_children` = 10;
   `delegation.max_iterations` = 250; `context_file_max_chars` = null; hooks: block beats approve, modify merges, shell-hook timeout
   fails open unless `fail_closed`, Python plugin `pre_tool_call` timeout fails closed; `hermes sessions prune` 90 days only for bare prune.
4. Quiz banks reconciled with the corrected lessons (~17 questions fixed, several had options shuffled onto the wrong question).
5. Browser sweep (logged in, Playwright): all 89 lessons loaded in light/desktop, light/mobile (390px) and dark/mobile.
   Bugs found and fixed: raw backticks in oneLiner/captions/steps/compare titles/quiz text (now rendered as code), InlineCode crash on
   missing compare titles (500), duplicate React key on parallel diagram edges, mobile overflow from long inline code, dark-mode
   secondary buttons unreadable, one clipped architecture diagram, stale facts in overview/configuration/agent-loop lessons.
   26 simulator pages: every button/switch/select clicked, no console errors. Quiz tab (20 questions), Ask AI reply, sidebar progress work.

## Automated checks

- Frontend: vitest 51 files / 969 tests (lesson validator, render smoke test of all lesson blocks + 24 simulators, diagram layout test),
  tsc and eslint clean.
- Backend: `npx jest src/hermes-quiz/hermes-quiz-data.spec.ts` 179/179.
- Known unrelated: `hermes-quiz.service.spec.ts` (and `system-design-quiz.service.spec.ts`) fail to load under jest with an ESM error
  from @nestjs/common on this Node version. Not caused by this work.

## Udemy lectures

Outline only. 5 transcripts (section 1, lectures 1-5) are already pasted. Lecture lesson content is generated from saved transcripts
(story route `/module/story/hermes-udemy-sX-lY`) once the user asks.

## Still open (honest list)

- Contrast and layout were checked by script (overflow, console errors, text-vs-background contrast), not by eye. No screenshots
  were taken (headless screenshot timed out earlier). A human skim of a few diagrams and simulators in dark mode is still worthwhile.
- Accuracy was checked against WebFetch summaries plus targeted follow-ups and the GitHub source for contested items, not every table cell.
  Unconfirmed: exact `hermes update` apply-path exit codes, Telegram config key location (`streaming:` vs `gateway.streaming.*`),
  1Password `.env` vs systemd token override.
- Lesson JSON `quiz` arrays (6-13 questions, some above the brief's 6-10) are unused by the UI; the backend banks are what users see.
- Simulator sample data that is made up: session-resume sample sessions, context-reference-budget token sizes. install-picker does not
  splice flags into the one-liner; kanban-board omits triage/review/`max_in_progress`.
- Official-page inconsistencies that remain: plugins page says 27 hooks but lists 29; delegation-patterns page contradicts itself on
  whether child agents keep `execute_code`.
- `/course/hermes-agent-mastery` landing showed Documentation 0/89 on first paint while the sidebar later showed 2/89 (progress loads
  async); not investigated.
- Nothing is committed. New: `.claude/settings.local.json` (gitignored via one `.gitignore` line).

## Next

- Generate lecture lessons from transcripts as they are pasted.
