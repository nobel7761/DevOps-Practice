# System Design A-Z: content কাঠামোর প্রস্তাব (M1, অনুমোদনের অপেক্ষায়)

Plan doc-এর Section 13 · M1 অনুযায়ী এই কাঠামো অনুমোদন না পাওয়া পর্যন্ত কোনো lesson/quiz content লেখা হবে না।

## Existing pattern যেটা মেনে চলছি

| বিষয়          | এখন যেভাবে আছে                                                                                      |
| -------------- | --------------------------------------------------------------------------------------------------- |
| Course outline | `apps/frontend/src/lib/data/courses/*.ts`, TS object (`CourseSummary`), `registry.ts`-এ তালিকাভুক্ত |
| Lesson লেখা    | `apps/frontend/src/lib/data/video-golpo/*` (markdown, `Markdown.tsx` দিয়ে render)                  |
| Quiz bank      | `apps/backend/src/quiz/data/<id>.json`, backend থেকে serve হয়, answer client-এ যায় না             |
| Progress       | Backend `content_progress` collection, `(key, type)` unique, `GET /progress`                        |
| Test           | Frontend: vitest, logic file-এর পাশে `*.test.ts`। Backend: jest, `*.spec.ts`                        |

## প্রস্তাবিত file layout

প্রতিটা topic-এর জন্য একটা folder, ভেতরে আলাদা আলাদা structured file:

```
apps/frontend/src/lib/data/system-design/
  topics/
    day-012-message-queues/
      lesson.ts        ← 18 section-এর template data (TS, যাতে diagram component reference type-safe থাকে)
      recall.json      ← Recall Map (6-10 core point)
      linkedin.json    ← LinkedIn post (+ poll / sources যেখানে প্রযোজ্য)
  recaps/
    week-01.json       ← Weekly Recap post (Day 7, 14, ...)
  glossary.json

apps/backend/src/system-design-quiz/data/
  sd-day-012.json      ← 60টা প্রশ্ন (backend-এ, যাতে correctIndex/whyWrong client bundle-এ না যায়)
```

কেন quiz backend-এ: existing lab quiz-ও তাই করে, আর 117 × 60 ≈ 7,020টা প্রশ্ন frontend bundle-এ রাখলে bundle ভারী হবে এবং উত্তর দেখা যাবে।

## Data shape (Plan doc Section 5.1, 7.1, 8.3 থেকে)

```ts
// Quiz (প্রতি topic-এ ঠিক 60টা: 20 easy / 20 medium / 20 hard)
interface SdQuizQuestion {
  id: string; // "sd-day-012-q01", স্থায়ী
  difficulty: "easy" | "medium" | "hard";
  question: string;
  diagram?: string; // shared diagram library-র id
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  whyWrong: Record<number, string>; // প্রতিটা ভুল option-এর index → এক বাক্য
}
interface SdQuizBank {
  topicId: string;
  questions: SdQuizQuestion[];
}

// Recall Map (6-10 point)
interface RecallPoint {
  term: string;
  prompt: string;
  answer: string;
  lessonLink: string;
}
interface RecallMap {
  topicId: string;
  points: RecallPoint[];
}

// LinkedIn post
interface LinkedInPost {
  type: "story" | "mistakes" | "poll" | "company" | "recap";
  text: string; // **Term** চিহ্ন সহ; placeholder লাইন: [✍️ আপনার অভিজ্ঞতা: ...]
  personalPrompt: string;
  firstComment: string;
  hashtags: string[]; // 3-5, প্রথম দুটো #100DaysOfSystemDesign #SystemDesign
  visual?: string; // poll-এ নেই
  poll?: {
    question: string;
    options: [string, string, string, string];
    answerComment: string;
  };
  sources?: string[]; // শুধু company-তে
}
```

`lesson.ts`-এর shape lesson template component (M1-এর বাকি অংশ) বানানোর সময় চূড়ান্ত হবে, এই কাঠামো অনুমোদনের পরে।

## Progress-এ যা যোগ হবে (M3-এ)

`content_progress`-এ নতুন `type` লাগবে: `sd_lesson`, `sd_quiz` (seen question id, attempt score), `sd_posted`, আর recall-এর জন্য আলাদা `recall_reviews` collection (point প্রতি rating + next due date)।

## Validation script

`apps/frontend/src/lib/system-design/validate-topic.ts` (pure function) + একটা CLI script যেটা সব topic folder আর backend quiz file পড়ে এই function চালাবে। Test আগে লেখা হয়েছে: `validate-topic.test.ts`।

## আপনার সিদ্ধান্ত দরকার

1. উপরের file layout আর quiz backend-এ রাখা: ঠিক আছে?
2. Course card-এ platform badge "Own course" দেখাচ্ছে। অন্য label চাইলে বলবেন।
3. প্রতিটা topic এখন একটা module (`Day N · …`), phase = milestone। Lesson/Quiz/Recall/LinkedIn কি module-এর ভেতরে আলাদা item হবে, নাকি একটাই "Lesson" item, আর বাকিগুলো lesson page-এর section হিসেবে?
