import { SIMULATORS } from "@/components/hermes/simulators/registry";
import type { HermesLesson } from "./lesson.types";

/** Returns a list of problems with a lesson; empty means valid. */
export function validateHermesLesson(
  lesson: HermesLesson,
  expectedContentId: string,
): string[] {
  const problems: string[] = [];
  if (lesson.contentId !== expectedContentId)
    problems.push(
      `contentId "${lesson.contentId}" != file "${expectedContentId}"`,
    );
  if (!lesson.title?.trim()) problems.push("missing title");
  if (
    !/^https:\/\/hermes-agent\.nousresearch\.com\/docs\//.test(
      lesson.sourceUrl ?? "",
    )
  )
    problems.push("sourceUrl must be an official docs URL");
  if (!lesson.oneLiner?.trim()) problems.push("missing oneLiner");
  if (!Array.isArray(lesson.blocks) || lesson.blocks.length < 4)
    problems.push("need at least 4 blocks");

  const markdownBlocks = lesson.blocks.filter((b) => b.type === "markdown");
  if (markdownBlocks.length < 3)
    problems.push("need at least 3 markdown blocks");
  if (!lesson.blocks.some((b) => b.type === "diagram"))
    problems.push("need at least 1 diagram block");

  lesson.blocks.forEach((block, i) => {
    if (block.type === "simulator" && !SIMULATORS[block.id])
      problems.push(`block ${i}: unknown simulator "${block.id}"`);
    if (block.type !== "diagram") return;
    const d = block.diagram;
    if (d.kind === "architecture") {
      const ids = new Set(d.nodes.map((n) => n.id));
      d.edges.forEach((e) => {
        if (!ids.has(e.from) || !ids.has(e.to))
          problems.push(
            `block ${i}: edge ${e.from}->${e.to} references unknown node`,
          );
      });
    }
    if (d.kind === "sequence") {
      const ids = new Set(d.participants.map((p) => p.id));
      d.messages.forEach((m) => {
        if (!ids.has(m.from) || !ids.has(m.to))
          problems.push(
            `block ${i}: message ${m.from}->${m.to} references unknown participant`,
          );
      });
    }
    if (d.kind === "steps" && d.steps.length < 2)
      problems.push(`block ${i}: steps diagram needs >= 2 steps`);
  });

  if (!Array.isArray(lesson.quiz) || lesson.quiz.length < 5)
    problems.push("need at least 5 quiz questions");
  lesson.quiz?.forEach((q, i) => {
    if (q.options.length < 3 || q.options.length > 5)
      problems.push(`quiz ${i}: 3-5 options`);
    if (q.answerIndex < 0 || q.answerIndex >= q.options.length)
      problems.push(`quiz ${i}: answerIndex out of range`);
    if (!q.explanation?.trim()) problems.push(`quiz ${i}: missing explanation`);
  });
  const correctPositions = new Set(lesson.quiz?.map((q) => q.answerIndex));
  if (lesson.quiz?.length >= 5 && correctPositions.size < 2)
    problems.push("quiz: correct answer is always the same position");
  if (!Array.isArray(lesson.recap) || lesson.recap.length < 3)
    problems.push("need at least 3 recap points");
  return problems;
}
