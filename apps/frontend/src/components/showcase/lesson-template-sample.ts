// Placeholder data that exercises every section of the lesson template. This is
// NOT course content — real lessons start with the Day 12 sample in milestone M5.

import type { SdLesson } from "@/lib/system-design/lesson.types";
import type { RecallMap } from "@/lib/system-design/validate-topic";

const diagram = (id: string) => ({
  id,
  caption: `${id} diagram-এর caption এখানে।`,
  alt: `${id} diagram-এর screen reader বর্ণনা।`,
});

export const lessonTemplateSample: SdLesson = {
  topicId: "sd-day-000",
  day: 0,
  title: "Lesson template preview",
  definition: "এক লাইনের placeholder সংজ্ঞা।",
  objectives: [
    "Learning objective ১",
    "Learning objective ২",
    "Learning objective ৩",
  ],
  prerequisites: [
    { day: 1, title: "আগের topic", href: "/course/system-design-a-z" },
  ],
  problem: { markdown: "সমস্যার গল্প এখানে।", diagrams: [diagram("before")] },
  analogy: {
    markdown: "বাংলাদেশি জীবনের analogy এখানে।",
    diagrams: [diagram("analogy")],
  },
  coreConcept: {
    markdown: "মূল ধারণার সহজ ব্যাখ্যা এখানে।",
    diagrams: [diagram("main-architecture"), diagram("before-after")],
  },
  deepDive: [
    {
      title: "ভেতরের mechanism",
      markdown: "Advanced ব্যাখ্যা।",
      diagrams: [diagram("sequence")],
    },
    { title: "Variant ও algorithm", markdown: "আরও গভীরে।" },
  ],
  simulator: "load-balancer-lab",
  tradeOffs: {
    markdown: "কখন ব্যবহার করবেন, কখন করবেন না।",
    table: {
      headers: ["বিষয়", "Option A", "Option B"],
      rows: [
        ["Latency", "কম", "বেশি"],
        ["Complexity", "বেশি", "কম"],
      ],
    },
  },
  industry: { markdown: "Real company-র উদাহরণ আর tool এখানে।" },
  mistakes: [{ mistake: "একটা সাধারণ ভুল", fix: "ঠিক উপায়" }],
  lab: [
    {
      title: "Container চালান",
      markdown: "```bash\ndocker run hello-world\n```",
    },
    { title: "ফলাফল দেখুন", markdown: "Output মিলিয়ে দেখুন।" },
  ],
  connections: { markdown: "আগের topic-এর সাথে কিভাবে জোড়া লাগে।" },
  explainYourself: [
    { question: "খোলা প্রশ্ন ১?", idealAnswer: "আদর্শ উত্তর ১।" },
  ],
  interviewQuestions: [
    {
      question: "Interview প্রশ্ন ১?",
      answerOutline: "- পয়েন্ট ১\n- পয়েন্ট ২",
    },
  ],
  summary: {
    points: ["Key takeaway ১", "Key takeaway ২"],
    diagram: diagram("summary-card"),
  },
};

export const recallTemplateSample: RecallMap = {
  topicId: "sd-day-000",
  points: Array.from({ length: 7 }, (_, i) => ({
    term: `Core point ${i + 1}`,
    prompt: `Core point ${i + 1} কী, আর কেন দরকার? (placeholder প্রশ্ন)`,
    answer: `Core point ${i + 1}-এর আদর্শ ব্যাখ্যা এখানে থাকবে (placeholder)।`,
    lessonLink: "#core",
  })),
};
