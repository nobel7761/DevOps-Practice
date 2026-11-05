import type { HermesLesson } from "./lesson.types";

/** Flattens a lesson's prose into markdown, used as context for the Ask-AI tab. */
export function lessonToMarkdown(lesson: HermesLesson): string {
  const parts = lesson.blocks.flatMap((block) => {
    if (block.type === "markdown") return [block.markdown];
    if (block.type === "callout")
      return [`**${block.title}**\n\n${block.markdown}`];
    return [];
  });
  return [
    `# ${lesson.title}`,
    ...parts,
    ...lesson.recap.map((r) => `- ${r}`),
  ].join("\n\n");
}
