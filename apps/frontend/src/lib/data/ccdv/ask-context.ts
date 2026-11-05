import type { CcdvChapterContent } from "./types";

/**
 * Context sent with every Ask-AI question. Deliberately compact (cheat-sheet notes + recap +
 * lab goal, a few thousand characters) instead of the whole 25-39k character lesson, because
 * the full text would be re-sent — and billed — on every question.
 */
export function chapterToAskMarkdown(
  title: string,
  content: CcdvChapterContent,
): string {
  return [
    `# ${title}`,
    content.lesson.oneLiner,
    "## সংক্ষেপে মনে রাখো",
    ...content.lesson.recap.map((point) => `- ${point}`),
    "## Study notes",
    content.notes,
    `## Lab লক্ষ্য\n${content.lab.goal}`,
  ].join("\n\n");
}
