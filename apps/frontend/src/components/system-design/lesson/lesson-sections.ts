// Section order, headings and anchor ids for the lesson template (Plan doc
// Section 5). Recall Map `lessonLink`s point at these ids, e.g. "#deep-dive".

export const LESSON_SECTIONS = {
  objectives: {
    id: "objectives",
    emoji: "🎯",
    title: "এই lesson শেষে আপনি পারবেন",
  },
  prerequisites: {
    id: "prerequisites",
    emoji: "📋",
    title: "আগে যা জানা দরকার",
  },
  problem: { id: "problem", emoji: "🤔", title: "সমস্যাটা কী?" },
  analogy: { id: "analogy", emoji: "🍵", title: "সহজ উদাহরণে বুঝি" },
  coreConcept: { id: "core", emoji: "📖", title: "মূল ধারণা" },
  deepDive: { id: "deep-dive", emoji: "🔬", title: "গভীরে যাই" },
  simulator: { id: "simulator", emoji: "🎮", title: "নিজে চালিয়ে দেখুন" },
  tradeOffs: { id: "trade-offs", emoji: "⚖️", title: "Trade-offs" },
  industry: {
    id: "industry",
    emoji: "🏢",
    title: "Industry-তে কিভাবে ব্যবহার হয়",
  },
  mistakes: { id: "mistakes", emoji: "⚠️", title: "সাধারণ ভুল" },
  lab: { id: "lab", emoji: "🛠️", title: "Hands-on Lab" },
  connections: {
    id: "connections",
    emoji: "🔗",
    title: "আগের topic-এর সাথে সম্পর্ক",
  },
  explainYourself: { id: "explain", emoji: "✍️", title: "নিজে ব্যাখ্যা করুন" },
  interview: { id: "interview", emoji: "💼", title: "Interview প্রশ্ন" },
  summary: { id: "summary", emoji: "📝", title: "সারাংশ" },
  recall: { id: "recall", emoji: "🧠", title: "মনে আছে তো?" },
  quiz: { id: "quiz", emoji: "❓", title: "Quiz" },
  linkedin: { id: "linkedin", emoji: "📣", title: "LinkedIn Post" },
} as const;

export type LessonSectionKey = keyof typeof LESSON_SECTIONS;
