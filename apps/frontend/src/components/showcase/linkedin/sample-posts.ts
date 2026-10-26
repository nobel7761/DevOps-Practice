// Placeholder posts that exercise every part of the LinkedIn card — not course content.
import type { LinkedInPost } from "@/lib/system-design/validate-topic";

const HASHTAGS = ["#100DaysOfSystemDesign", "#SystemDesign", "#Placeholder"];

export const sampleStoryPost: LinkedInPost = {
  type: "story",
  text: [
    "Placeholder hook: একটা কৌতূহল জাগানো প্রশ্ন?",
    "Day 0/100 · Template Preview",
    "",
    "ধরুন... (placeholder গল্প)",
    "",
    "আজ **Template Preview** শিখতে গিয়ে বুঝলাম, software-এও একই idea কাজ করে।",
    "",
    "1. **Term One**: এক বাক্যে ব্যাখ্যা",
    "2. **Term Two**: এক বাক্যে ব্যাখ্যা",
    "3. **Term Three**: এক বাক্যে ব্যাখ্যা",
    "",
    "[✍️ আপনার অভিজ্ঞতা: আপনার project-এ এমন কিছু কখন দেখেছেন?]",
    "",
    "Placeholder CTA প্রশ্ন? Comment-এ লিখুন 👇",
  ].join("\n"),
  personalPrompt: "আপনার project-এ এমন কিছু কখন দেখেছেন?",
  firstComment: "পুরো lesson, diagram আর simulator এখানে: {link}",
  hashtags: HASHTAGS,
  visual: "day-0-main",
};

export const samplePollPost: LinkedInPost = {
  type: "poll",
  text: [
    "Placeholder scenario: ২-৪ লাইনে একটা বাস্তব পরিস্থিতি।",
    "Day 0/100 · Template Preview",
    "",
    "আপনি হলে কী করতেন? Poll-এ vote দিন, আর কেন বেছে নিলেন comment-এ লিখুন 👇",
    "",
    "[✍️ আপনার অভিজ্ঞতা: এমন পরিস্থিতিতে আপনি কী বেছে নিয়েছিলেন?]",
    "",
    "উত্তর আর ব্যাখ্যা দেব কাল।",
  ].join("\n"),
  personalPrompt: "এমন পরিস্থিতিতে আপনি কী বেছে নিয়েছিলেন?",
  firstComment: "পুরো lesson: {link}",
  hashtags: HASHTAGS,
  poll: {
    question: "Placeholder poll প্রশ্ন: কোনটা বেছে নেবেন?",
    options: [
      "Option A",
      "Option B",
      "Option C",
      "এই option-টা ত্রিশ character-এর চেয়ে লম্বা",
    ],
    answerComment:
      "সঠিক উত্তর: Option A। কেন: placeholder ব্যাখ্যা। বাকিগুলো কেন না: placeholder।",
  },
};

export const sampleRecapPost: LinkedInPost = {
  type: "recap",
  text: [
    "এই সপ্তাহে System Design-এর ৭টা জিনিস শিখলাম। এক carousel-এ সব।",
    "Week 1 · Day 1-7",
    "",
    "1️⃣ Topic 1: placeholder সংজ্ঞা",
    "2️⃣ Topic 2: placeholder সংজ্ঞা",
    "",
    "Save করে রাখুন, interview-এর আগে কাজে লাগবে 🔖",
    "",
    "এর মধ্যে কোনটা আপনার কাছে সবচেয়ে কঠিন লেগেছে? 👇",
  ].join("\n"),
  personalPrompt: "",
  firstComment: "সব lesson: {link}",
  hashtags: ["#100DaysOfSystemDesign", "#SystemDesign"],
};
