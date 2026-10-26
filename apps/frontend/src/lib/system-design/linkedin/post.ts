// LinkedIn post helpers (Plan doc Section 8): Unicode bold, the personal
// experience line, the exact text that gets copied, and its character counts.
// Post `text` has no hashtags; they're appended from `hashtags` on copy.

import type { LinkedInPost, LinkedInPostType } from "../validate-topic.ts";

export const POST_LIMIT = 3000;
export const HOOK_LIMIT = 150;
export const POLL_QUESTION_LIMIT = 140;
export const POLL_OPTION_LIMIT = 30;
/** Day 1-12 went out on LinkedIn before the platform existed. */
const LAST_PREPUBLISHED_DAY = 12;

export const POST_TYPE_BADGES: Record<LinkedInPostType, string> = {
  story: "📖 গল্প",
  mistakes: "⚠️ ভুল",
  poll: "📊 Poll",
  company: "🏢 Company",
  recap: "🗂️ Recap",
};

// Mathematical Sans-Serif Bold: 𝗔 (U+1D5D4), 𝗮 (U+1D5EE), 𝟬 (U+1D7EC).
const BOLD_UPPER = 0x1d5d4;
const BOLD_LOWER = 0x1d5ee;
const BOLD_DIGIT = 0x1d7ec;

/** The `[✍️ আপনার অভিজ্ঞতা: ...]` line where the learner adds their own experience. */
export const PLACEHOLDER = /\[✍️ আপনার অভিজ্ঞতা:[^\]]*\]/;

/** LinkedIn has no markdown, so bold is faked with Unicode letters. Only A-Z, a-z and 0-9 have bold forms. */
export function toUnicodeBold(text: string): string {
  return text.replace(/[A-Za-z0-9]/g, (ch) => {
    const code = ch.charCodeAt(0);
    if (ch >= "A" && ch <= "Z")
      return String.fromCodePoint(BOLD_UPPER + code - 65);
    if (ch >= "a" && ch <= "z")
      return String.fromCodePoint(BOLD_LOWER + code - 97);
    return String.fromCodePoint(BOLD_DIGIT + code - 48);
  });
}

/** `**Term**` → bold Term. */
export const renderBold = (text: string) =>
  text.replace(/\*\*([^*\n]+?)\*\*/g, (_, inner: string) =>
    toUnicodeBold(inner),
  );

/** Puts the learner's experience in place of the placeholder, or drops that line when it's empty. */
export function fillPersonalLine(text: string, experience: string): string {
  const written = experience.trim();
  if (written) return text.replace(PLACEHOLDER, written);
  return text
    .split("\n")
    .filter((line) => !PLACEHOLDER.test(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

export const needsExperienceWarning = (
  post: LinkedInPost,
  experience: string,
) => PLACEHOLDER.test(post.text) && experience.trim() === "";

/** The exact text the "📋 Post copy করুন" button puts on the clipboard. */
export function buildCopyText(post: LinkedInPost, experience: string): string {
  const body = renderBold(fillPersonalLine(post.text, experience)).trim();
  return `${body}\n\n${post.hashtags.join(" ")}`;
}

/** [first two lines, rest] — LinkedIn cuts to "...see more" after the hook. */
export function splitAtSeeMore(text: string): [string, string] {
  const lines = text.split("\n");
  return [lines.slice(0, 2).join("\n"), lines.slice(2).join("\n")];
}

/**
 * Counts in UTF-16 units (each bold letter is 2). That's the stricter of the
 * ways LinkedIn might count, so a post that passes here never gets cut off.
 */
export function postStats(copyText: string) {
  const length = copyText.length;
  const hookLength = splitAtSeeMore(copyText)[0].length;
  return {
    length,
    hookLength,
    overLimit: length >= POST_LIMIT,
    hookOverLimit: hookLength > HOOK_LIMIT,
  };
}

const fieldStats = (text: string, limit: number) => ({
  length: text.length,
  limit,
  over: text.length > limit,
});

export function pollStats(poll: NonNullable<LinkedInPost["poll"]>) {
  return {
    question: fieldStats(poll.question, POLL_QUESTION_LIMIT),
    options: poll.options.map((option) =>
      fieldStats(option, POLL_OPTION_LIMIT),
    ),
  };
}

export const formatCount = (n: number) => n.toLocaleString("en-US");

export const isPosted = (day: number, ticked: boolean) =>
  day <= LAST_PREPUBLISHED_DAY || ticked;
