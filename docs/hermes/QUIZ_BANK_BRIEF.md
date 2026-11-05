# Hermes quiz bank brief

Write a quiz bank of **exactly 20 questions** per lesson, in Bangla (technical
terms in English), for a complete beginner (treat the reader like a 5-year-old).

## Source material

`apps/frontend/src/lib/data/hermes/docs/<contentId>.json` — read the whole
lesson (all `blocks`, `recap`). Questions must be answerable from that lesson
only; never invent facts. The lesson's old `quiz` (7 questions) may be reused
but its options usually have the "correct answer is the long one" problem — fix it.

## Output

`apps/backend/src/hermes-quiz/data/<contentId>.json`:

```json
{
  "contentId": "<contentId>",
  "questions": [
    {
      "id": "<contentId>-q01",
      "difficulty": "easy|medium|hard",
      "question": "...",
      "options": ["a", "b", "c", "d"],
      "correctIndex": 0,
      "explanation": "why the right answer is right (1-3 sentences)",
      "whyWrong": { "<index of each wrong option>": "why that one is wrong" }
    }
  ]
}
```

ids q01..q20. Difficulty mix: 7 easy, 7 medium, 6 hard. Easy = what a term means;
medium = why/when/which command; hard = apply to a small scenario / combine ideas.

## Hard rules for options (the learner complained that the long option was always correct)

- Exactly 4 options, all distinct, all **similar length and style** (same kind of
  sentence, same level of detail). Wrong options must be plausible (real terms
  from the lesson, common beginner mix-ups) — never silly.
- The correct option must NOT be the longest in more than ~30% of questions;
  make some wrong options longer than the correct one. Never make the unique
  longest option the correct one.
- Correct answer positions spread evenly: 5 each at index 0,1,2,3 (shuffle
  which questions get which).
- No "সবগুলো / উপরের কোনোটাই নয়" options. No "both A and B".
- `whyWrong` must have exactly the 3 wrong indexes as string keys.
- Cover the whole lesson (terms, commands, flags, config keys, gotchas, the
  "why"), not just the first half. No two questions testing the same fact.
- Use backticks for commands/flags/files; keep commands exactly as in the lesson.

## Build + validate

Write with a Python script (`json.dump(..., ensure_ascii=False, indent=2)`, run
with `python3 -I`; keep scripts in the scratchpad, not the repo). Then run
`python3 -I /private/tmp/claude-502/-Users-Nobel-Personal-poridhi-devops-course/8fbcfc0f-2e30-4ca8-9428-d9867eb676b7/scratchpad/validate_bank.py <contentId> [...]`
and fix every reported problem.

## Hard rules

Only create your assigned bank files. No other repo files, no git commands.
Final report: very short (files done, any lesson where facts were thin).
