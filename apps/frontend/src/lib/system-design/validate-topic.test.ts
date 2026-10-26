import { describe, expect, it } from "vitest";
import {
  validateLinkedInPost,
  validatePostDayLine,
  validatePostRotation,
  validateQuizBank,
  validateRecallMap,
  type LinkedInPost,
  type RecallMap,
  type SdQuizBank,
  type SdQuizQuestion,
} from "./validate-topic";

function question(
  index: number,
  difficulty: SdQuizQuestion["difficulty"],
): SdQuizQuestion {
  return {
    id: `sd-day-012-q${String(index).padStart(2, "0")}`,
    difficulty,
    question: `প্রশ্ন ${index}`,
    options: ["A", "B", "C", "D"],
    correctIndex: 0,
    explanation: "কারণ A সঠিক।",
    whyWrong: { 1: "B ভুল।", 2: "C ভুল।", 3: "D ভুল।" },
  };
}

function validBank(): SdQuizBank {
  const difficulties = ["easy", "medium", "hard"] as const;
  return {
    topicId: "sd-day-012",
    questions: Array.from({ length: 60 }, (_, i) =>
      question(i + 1, difficulties[Math.floor(i / 20)]),
    ),
  };
}

function validRecall(pointCount = 8): RecallMap {
  return {
    topicId: "sd-day-012",
    points: Array.from({ length: pointCount }, (_, i) => ({
      term: `Term ${i}`,
      prompt: `Term ${i} কী?`,
      answer: "আদর্শ ব্যাখ্যা।",
      lessonLink: `#section-${i}`,
    })),
  };
}

function validPost(): LinkedInPost {
  return {
    type: "story",
    text: "Order দেওয়ার পর কেন ১০ সেকেন্ড অপেক্ষা?\nDay 12/100 · Message Queues\n\nধরুন...\n\n[✍️ আপনার অভিজ্ঞতা: কোন কাজ synchronous ছিল?]\n\nআপনি কোন কাজ queue-তে পাঠান? 👇",
    personalPrompt: "কোন কাজ synchronous ছিল?",
    firstComment: "পুরো lesson: {link}",
    hashtags: ["#100DaysOfSystemDesign", "#SystemDesign", "#MessageQueue"],
    visual: "message-queues-main",
  };
}

describe("validateQuizBank", () => {
  it("accepts exactly 60 questions split 20/20/20 with explanation and whyWrong", () => {
    expect(validateQuizBank(validBank())).toEqual([]);
  });

  it("rejects a bank that does not have exactly 60 questions", () => {
    const bank = validBank();
    bank.questions.pop();
    expect(validateQuizBank(bank)).toContainEqual(
      expect.stringContaining("60"),
    );
  });

  it("rejects an uneven difficulty split", () => {
    const bank = validBank();
    bank.questions[0] = { ...bank.questions[0], difficulty: "hard" };
    expect(validateQuizBank(bank).length).toBeGreaterThan(0);
  });

  it("rejects duplicate question ids", () => {
    const bank = validBank();
    bank.questions[1] = { ...bank.questions[1], id: bank.questions[0].id };
    expect(validateQuizBank(bank)).toContainEqual(
      expect.stringContaining(bank.questions[0].id),
    );
  });

  it("rejects a question that does not have exactly 4 options", () => {
    const bank = validBank();
    bank.questions[5] = {
      ...bank.questions[5],
      options: ["A", "B", "C"] as unknown as SdQuizQuestion["options"],
    };
    expect(validateQuizBank(bank)).toContainEqual(
      expect.stringContaining(bank.questions[5].id),
    );
  });

  it("rejects a correctIndex outside the options", () => {
    const bank = validBank();
    bank.questions[4] = { ...bank.questions[4], correctIndex: 4 };
    expect(validateQuizBank(bank)).toContainEqual(
      expect.stringContaining(bank.questions[4].id),
    );
  });

  it("rejects a question whose correct option is the unique longest (guessable without reading)", () => {
    const bank = validBank();
    bank.questions[11] = {
      ...bank.questions[11],
      options: ["সঠিক আর অনেক বিস্তারিত উত্তর", "B", "C", "D"],
    };
    expect(validateQuizBank(bank)).toContainEqual(
      expect.stringContaining(bank.questions[11].id),
    );
  });

  it("allows the correct option to tie for longest", () => {
    const bank = validBank();
    bank.questions[12] = {
      ...bank.questions[12],
      options: ["AAAA", "BBBB", "C", "D"],
    };
    expect(validateQuizBank(bank)).toEqual([]);
  });

  it("rejects an empty explanation", () => {
    const bank = validBank();
    bank.questions[3] = { ...bank.questions[3], explanation: "  " };
    expect(validateQuizBank(bank)).toContainEqual(
      expect.stringContaining(bank.questions[3].id),
    );
  });

  it("rejects a missing whyWrong for any wrong option", () => {
    const bank = validBank();
    bank.questions[7] = {
      ...bank.questions[7],
      whyWrong: { 1: "B ভুল।", 2: "C ভুল।" },
    };
    expect(validateQuizBank(bank)).toContainEqual(
      expect.stringContaining(bank.questions[7].id),
    );
  });

  it("rejects 'all of the above' / 'none of these' style options", () => {
    const bank = validBank();
    bank.questions[9] = {
      ...bank.questions[9],
      options: ["A", "B", "C", "উপরের সবগুলো"],
    };
    expect(validateQuizBank(bank)).toContainEqual(
      expect.stringContaining(bank.questions[9].id),
    );
  });
});

describe("validateRecallMap", () => {
  it("accepts 6 to 10 points with prompt, answer and lessonLink", () => {
    expect(validateRecallMap(validRecall(6))).toEqual([]);
    expect(validateRecallMap(validRecall(10))).toEqual([]);
  });

  it("rejects fewer than 6 or more than 10 points", () => {
    expect(validateRecallMap(validRecall(5)).length).toBeGreaterThan(0);
    expect(validateRecallMap(validRecall(11)).length).toBeGreaterThan(0);
  });

  it("rejects a point without a lessonLink", () => {
    const recall = validRecall();
    recall.points[2] = { ...recall.points[2], lessonLink: "" };
    expect(validateRecallMap(recall)).toContainEqual(
      expect.stringContaining(recall.points[2].term),
    );
  });
});

describe("validateLinkedInPost", () => {
  it("accepts a well-formed story post", () => {
    expect(validateLinkedInPost(validPost())).toEqual([]);
  });

  it("rejects a post of 3000 characters or more", () => {
    const post = validPost();
    post.text = post.text + "ক".repeat(3000);
    expect(validateLinkedInPost(post)).toContainEqual(
      expect.stringContaining("3000"),
    );
  });

  it("measures the text as it will be pasted: bold letters take 2 UTF-16 units and hashtags are appended", () => {
    const post = validPost();
    // ~1,700 characters in the source, but 1,600 bold letters become 3,200 units once copied.
    post.text = `${post.text}\n\n**${"A".repeat(1600)}**`;
    expect(validateLinkedInPost(post)).toContainEqual(
      expect.stringContaining("3000"),
    );
  });

  it("rejects a hook (first two lines) longer than 150 characters", () => {
    const post = validPost();
    post.text = "ক".repeat(140) + "\nDay 12/100 · Message Queues\n\nবাকি লেখা";
    expect(validateLinkedInPost(post)).toContainEqual(
      expect.stringContaining("150"),
    );
  });

  it("requires 3 to 5 hashtags starting with #100DaysOfSystemDesign #SystemDesign", () => {
    const tooFew = { ...validPost(), hashtags: ["#100DaysOfSystemDesign"] };
    const wrongOrder = {
      ...validPost(),
      hashtags: ["#SystemDesign", "#100DaysOfSystemDesign", "#Kafka"],
    };
    expect(validateLinkedInPost(tooFew).length).toBeGreaterThan(0);
    expect(validateLinkedInPost(wrongOrder).length).toBeGreaterThan(0);
  });

  it("requires the personal-experience placeholder and a first comment", () => {
    const noPlaceholder = {
      ...validPost(),
      text: "Hook\nDay 12/100 · Message Queues\n\nCTA 👇",
    };
    const noComment = { ...validPost(), firstComment: "" };
    expect(validateLinkedInPost(noPlaceholder).length).toBeGreaterThan(0);
    expect(validateLinkedInPost(noComment).length).toBeGreaterThan(0);
  });

  it("requires poll fields within LinkedIn limits for a poll post", () => {
    const poll: LinkedInPost = {
      ...validPost(),
      type: "poll",
      visual: undefined,
      poll: {
        question: "ক".repeat(141),
        options: ["A", "B", "C", "এই option-টা ত্রিশ character-এর চেয়ে লম্বা"],
        answerComment: "উত্তর A।",
      },
    };
    expect(validateLinkedInPost(poll).length).toBeGreaterThanOrEqual(2);
  });

  it("requires a visual for every post type except poll and recap", () => {
    expect(
      validateLinkedInPost({ ...validPost(), visual: undefined }),
    ).toContainEqual(expect.stringContaining("visual"));
  });

  it("does not require the personal placeholder or a visual on a recap post", () => {
    const recap: LinkedInPost = {
      ...validPost(),
      type: "recap",
      text: "এই সপ্তাহে ৭টা জিনিস শিখলাম।\nWeek 1 · Day 1-7\n\nকোনটা সবচেয়ে কঠিন লেগেছে? 👇",
      visual: undefined,
      hashtags: ["#100DaysOfSystemDesign", "#SystemDesign", "#Recap"],
    };
    expect(validateLinkedInPost(recap)).toEqual([]);
  });

  it("requires sources for a company post", () => {
    const company: LinkedInPost = { ...validPost(), type: "company" };
    expect(validateLinkedInPost(company)).toContainEqual(
      expect.stringContaining("sources"),
    );
  });
});

describe("validatePostDayLine", () => {
  const withSecondLine = (line: string) => `Hook লাইন\n${line}\n\nবাকি লেখা`;

  it("accepts 'Day N/100 · Topic' on the second line for Day 1-100", () => {
    expect(
      validatePostDayLine(
        withSecondLine("Day 12/100 · Message Queues"),
        12,
        "Message Queues",
      ),
    ).toEqual([]);
  });

  it("accepts 'Bonus Day N · Topic' for Day 101-117", () => {
    expect(
      validatePostDayLine(
        withSecondLine("Bonus Day 101 · Feature Store"),
        101,
        "Feature Store",
      ),
    ).toEqual([]);
  });

  it("rejects a wrong day number", () => {
    expect(
      validatePostDayLine(
        withSecondLine("Day 13/100 · Message Queues"),
        12,
        "Message Queues",
      ).length,
    ).toBeGreaterThan(0);
  });

  it("rejects the '/100' format for a bonus day", () => {
    expect(
      validatePostDayLine(
        withSecondLine("Day 101/100 · Feature Store"),
        101,
        "Feature Store",
      ).length,
    ).toBeGreaterThan(0);
  });

  it("rejects a post that starts with the day line instead of a hook", () => {
    expect(
      validatePostDayLine(
        "Day 12/100 · Message Queues\nHook লাইন",
        12,
        "Message Queues",
      ).length,
    ).toBeGreaterThan(0);
  });
});

describe("validatePostRotation", () => {
  it("accepts a sequence where no type repeats more than twice in a row", () => {
    expect(
      validatePostRotation([
        "story",
        "story",
        "poll",
        "story",
        "mistakes",
        "company",
      ]),
    ).toEqual([]);
  });

  it("rejects the same type on 3 consecutive days, naming where it starts", () => {
    const errors = validatePostRotation([
      "poll",
      "story",
      "story",
      "story",
      "company",
    ]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("Day 2");
  });

  it("ignores recap posts, since they're extra posts on top of the day's main post", () => {
    expect(validatePostRotation(["story", "story", "recap", "poll"])).toEqual(
      [],
    );
  });
});
