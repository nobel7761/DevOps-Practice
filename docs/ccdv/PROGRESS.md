# CCDV-F Prep — build progress

Course id `ccdv-foundations-prep` (registry: `apps/frontend/src/lib/data/courses/ccdv-foundations.ts`).
Facts: `FACTS.md` · official guide text: `exam-guide.txt` · agent briefs: `CHAPTER_BRIEF.md`, `QUESTION_BRIEF.md`.

## Where things live

| What                                                     | Where                                                                                  |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Day → chapter → topic schedule (single source of truth)  | `apps/frontend/src/lib/data/ccdv/schedule.ts`                                          |
| Blueprint, weights, per-skill question targets           | `lib/data/ccdv/blueprint.ts`                                                           |
| Chapter content (lesson, lab, notes, flashcards, 15 MCQ) | `lib/data/ccdv/chapters/chNN.json`                                                     |
| Question pools (written by domain)                       | `lib/data/ccdv/question-pools/*.json`                                                  |
| 10 mock exams (built, never hand-edited)                 | `lib/data/ccdv/exams/exam-NN.json` ← `npm run build:ccdv-exams`                        |
| Content validator                                        | `lib/data/ccdv/validate-ccdv.ts` + `ccdv.test.ts` (`npx vitest run src/lib/data/ccdv`) |
| Routes                                                   | `/ccdv/lesson/[contentId]`, `/ccdv/exam/[contentId]`, `/ccdv/analytics`                |
| UI                                                       | `components/ccdv/{lesson,exam,analytics,practice,flashcards,question,simulators}`      |

## Tracking system

- **Course sidebar / course page** = the platform's normal progress tracking. 24 study days = 24 modules in 4 weekly milestones.
  Each chapter day has 4 trackable items (গল্প+Simulator, Hands-on Lab, Notes+Flashcards, Practice MCQ) with "Mark as Completed";
  each mock-exam day has 1 item that is auto-completed when the exam is submitted.
- Each chapter page shows that day's topic list and the 2-hour split.
- **Exam attempts, drafts, flashcard "known" cards, best MCQ score** are stored in the browser (`localStorage`, keys `ccdv:*`)
  — no backend change. `/ccdv/analytics` shows score trend, domain-wise %, weak areas with revise links, and every attempt.
- Scaled score is a **linear estimate** (100 + 900 × fraction correct); the real exam's scaling is unpublished. Pass line 720.

## Status

Done (2026-11-05):

- 15 chapters (ch00–ch14) written from official docs; each = ~22–39k chars Bangla lesson, 3–5 diagrams, 3–5 simulators, lab, notes, 18–24 flashcards, 15 MCQ.
- 530 exam questions (7 domain pools) → 10 mock exams × 53, built by `npm run build:ccdv-exams`. The 4 pools that were written from memory were fact-audited against live docs
  (d5, d8, d2a, d7-d3 + d1); ~20% of questions are multi-response.
- Validator + render smoke test: `npx vitest run src/lib/data/ccdv src/components/ccdv` (65 tests). Full frontend suite 1034 tests, tsc clean, eslint 0 errors.
- Browser-checked (Playwright, fake cookie, no backend): course sidebar (4 weeks, 71 items), chapter page, simulators, flashcard flip, MCQ practice,
  full exam run → result → analytics. Console clean.

Added later (2026-11-05):

- Ask AI tab on every chapter page (context = notes + recap + lab goal, not the whole lesson, to keep token cost low). Day modules are sidebar dropdowns (`topicTree`).
- Second fact-audit: all 15 chapters (lesson, lab code, notes, flashcards, chapter MCQs) were checked against live official docs by 6 auditors, ~1,000 claims,
  ~45 fixes (e.g. ch14 lab recursion bug, `max_tokens` too small for thinking models, Managed Agents beta-header scope, MCP SDK v1→v2 rename, 90-day key rotation is only an example).
  Two audit edits to ch00 were reverted because the Partner Academy FAQ/eligibility pages support the original text (retake keeps partner discount; non-partners get Academy completion certificates).

Not done / honest list (the chapter-audit bullet below is now partly outdated: chapters ARE audited; lab code still has not been run against the live API):

- Lab code in the chapters was NOT executed against the live API. Chapter text, chapter MCQs and flashcards were not separately fact-audited (only the exam question pools were).
- Facts the authors could not fully verify are flagged inside the lessons (hooks page read only partly, framework facts from overview pages only, Bedrock/Vertex naming drift,
  MCP spec drift 2026-07-28, backoff numbers are illustrative).
- Scaled score is a linear estimate. Dark mode / mobile layout not checked by eye. Backend progress ("Mark as Completed") not exercised (backend not running).
- Nothing committed.
