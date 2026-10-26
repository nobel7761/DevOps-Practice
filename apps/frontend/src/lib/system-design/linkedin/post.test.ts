import { describe, expect, it } from "vitest";
import {
  HOOK_LIMIT,
  POST_LIMIT,
  POST_TYPE_BADGES,
  buildCopyText,
  fillPersonalLine,
  formatCount,
  isPosted,
  needsExperienceWarning,
  pollStats,
  postStats,
  renderBold,
  splitAtSeeMore,
  toUnicodeBold,
} from "./post";
import type { LinkedInPost } from "@/lib/system-design/validate-topic";

const PLACEHOLDER =
  "[✍️ আপনার অভিজ্ঞতা: আপনার project-এ কোন কাজ synchronous ছিল?]";

const post = (
  text: string,
  hashtags = ["#100DaysOfSystemDesign", "#SystemDesign", "#MessageQueue"],
): LinkedInPost => ({
  type: "story",
  text,
  personalPrompt: "আপনার project-এ কোন কাজ synchronous ছিল?",
  firstComment: "পুরো lesson: {link}",
  hashtags,
  visual: "main",
});

describe("toUnicodeBold", () => {
  it("turns English letters into Unicode sans-serif bold", () => {
    expect(toUnicodeBold("Message Queue")).toBe("𝗠𝗲𝘀𝘀𝗮𝗴𝗲 𝗤𝘂𝗲𝘂𝗲");
  });

  it("bolds digits too and leaves punctuation alone", () => {
    expect(toUnicodeBold("HTTP/2")).toBe("𝗛𝗧𝗧𝗣/𝟮");
  });

  it("leaves Bangla untouched, since Unicode bold only exists for Latin letters", () => {
    expect(toUnicodeBold("কিউ")).toBe("কিউ");
  });
});

describe("renderBold", () => {
  it("replaces every **Term** with its bold form and drops the markers", () => {
    expect(renderBold("আজ **Message Queue** আর **DLQ** শিখলাম")).toBe(
      "আজ 𝗠𝗲𝘀𝘀𝗮𝗴𝗲 𝗤𝘂𝗲𝘂𝗲 আর 𝗗𝗟𝗤 শিখলাম",
    );
  });

  it("leaves an unmatched ** as it is", () => {
    expect(renderBold("2 ** 3")).toBe("2 ** 3");
  });
});

describe("fillPersonalLine", () => {
  const text = `Hook\nDay 12/100 · Message Queues\n\n${PLACEHOLDER}\n\nশেষ লাইন`;

  it("puts the learner's experience where the placeholder was", () => {
    expect(
      fillPersonalLine(text, "আমার order API-তে email পাঠাতে 3s লাগত।"),
    ).toBe(
      "Hook\nDay 12/100 · Message Queues\n\nআমার order API-তে email পাঠাতে 3s লাগত।\n\nশেষ লাইন",
    );
  });

  it("drops the placeholder line entirely when nothing was written, without leaving a double gap", () => {
    expect(fillPersonalLine(text, "   ")).toBe(
      "Hook\nDay 12/100 · Message Queues\n\nশেষ লাইন",
    );
  });
});

describe("needsExperienceWarning", () => {
  it("warns before copying when the experience line is still empty", () => {
    expect(needsExperienceWarning(post(`a\n${PLACEHOLDER}`), "")).toBe(true);
    expect(needsExperienceWarning(post(`a\n${PLACEHOLDER}`), "লিখেছি")).toBe(
      false,
    );
  });

  it("does not warn for a post without a placeholder (recap)", () => {
    expect(needsExperienceWarning(post("a\nb"), "")).toBe(false);
  });
});

describe("buildCopyText", () => {
  it("fills the experience, converts bold, and appends the hashtags once at the end", () => {
    const copy = buildCopyText(
      post(`Hook **API**\nDay 4/100 · API\n\n${PLACEHOLDER}\n\nCTA 👇`),
      "অভিজ্ঞতা",
    );
    expect(copy).toBe(
      "Hook 𝗔𝗣𝗜\nDay 4/100 · API\n\nঅভিজ্ঞতা\n\nCTA 👇\n\n#100DaysOfSystemDesign #SystemDesign #MessageQueue",
    );
  });
});

describe("postStats", () => {
  it("counts what will actually be pasted, where each bold letter takes 2 UTF-16 units", () => {
    const stats = postStats("𝗔𝗣𝗜\nline 2\nrest");
    expect(stats.length).toBe("𝗔𝗣𝗜\nline 2\nrest".length);
    expect(stats.length).toBe(18);
  });

  it("measures the hook as the first two lines", () => {
    expect(postStats("12345\n123\nrest").hookLength).toBe(9);
  });

  it("flags a post over 3000 or a hook over 150", () => {
    expect(postStats("a".repeat(POST_LIMIT + 1)).overLimit).toBe(true);
    expect(postStats(`${"a".repeat(HOOK_LIMIT)}\nb\nc`).hookOverLimit).toBe(
      true,
    );
    expect(postStats("short\nhook\nbody")).toMatchObject({
      overLimit: false,
      hookOverLimit: false,
    });
  });
});

describe("splitAtSeeMore", () => {
  it("splits after the first two lines, where LinkedIn shows '...see more'", () => {
    expect(splitAtSeeMore("one\ntwo\nthree\nfour")).toEqual([
      "one\ntwo",
      "three\nfour",
    ]);
    expect(splitAtSeeMore("one")).toEqual(["one", ""]);
  });
});

describe("pollStats", () => {
  it("checks the poll question (140) and each option (30) against LinkedIn's limits", () => {
    const stats = pollStats({
      question: "ক".repeat(141),
      options: ["Short", "x".repeat(31), "OK", "Fine"],
      answerComment: "",
    });
    expect(stats.question).toEqual({ length: 141, limit: 140, over: true });
    expect(stats.options.map((o) => o.over)).toEqual([
      false,
      true,
      false,
      false,
    ]);
  });
});

describe("POST_TYPE_BADGES / formatCount", () => {
  it("labels each of the five post types", () => {
    expect(POST_TYPE_BADGES).toEqual({
      story: "📖 গল্প",
      mistakes: "⚠️ ভুল",
      poll: "📊 Poll",
      company: "🏢 Company",
      recap: "🗂️ Recap",
    });
  });

  it("formats counts like 1,840", () => {
    expect(formatCount(1840)).toBe("1,840");
  });
});

describe("isPosted", () => {
  it("treats Day 1-12 as already posted (published before the platform existed)", () => {
    expect(isPosted(1, false)).toBe(true);
    expect(isPosted(12, false)).toBe(true);
  });

  it("uses the learner's 'Post করেছি' tick from Day 13 on", () => {
    expect(isPosted(13, false)).toBe(false);
    expect(isPosted(13, true)).toBe(true);
  });
});
