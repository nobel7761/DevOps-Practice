import { DIAGRAM_KINDS } from "@/components/shared/diagram/diagram-kinds";
import { CCDV_SIMULATORS } from "@/components/ccdv/simulators/registry";
import { SIMULATORS } from "@/components/hermes/simulators/registry";
import { SKILLS, examDomainCounts } from "./blueprint";
import { CHAPTERS } from "./schedule";
import type { CcdvChapterContent, CcdvExam, CcdvMcqBase } from "./types";

const BANNED = /all of the above|none of the above|both a and b/i;

export function validateMcq(
  q: CcdvMcqBase & { domain: number },
  where: string,
): string[] {
  const p: string[] = [];
  if (!q.question?.trim()) p.push(`${where}: empty question`);
  if (!Array.isArray(q.options) || q.options.length < 4 || q.options.length > 5)
    p.push(`${where}: need 4-5 options`);
  const n = q.options?.length ?? 0;
  const a = q.answerIndexes;
  if (!Array.isArray(a) || a.length < 1) p.push(`${where}: no answerIndexes`);
  else {
    if (new Set(a).size !== a.length)
      p.push(`${where}: duplicate answerIndexes`);
    if (a.some((i) => !Number.isInteger(i) || i < 0 || i >= n))
      p.push(`${where}: answerIndex out of range`);
    if (a.length > 1 && !/select (two|three|2|3)/i.test(q.question ?? ""))
      p.push(`${where}: multi-answer question must say "Select TWO/THREE."`);
    if (a.length === 1 && /select (two|three)/i.test(q.question ?? ""))
      p.push(`${where}: says Select TWO but only one answer`);
  }
  if (q.options?.some((o) => BANNED.test(o) || !o?.trim()))
    p.push(`${where}: banned/empty option`);
  if (
    q.options &&
    new Set(q.options.map((o) => o.trim())).size !== q.options.length
  )
    p.push(`${where}: duplicate options`);
  if ((q.explanation?.trim().length ?? 0) < 40)
    p.push(`${where}: explanation too short`);
  if (!q.skill?.trim()) p.push(`${where}: missing skill`);
  else if (
    q.domain !== 0 &&
    !SKILLS.some((s) => s.name === q.skill && s.domain === q.domain)
  )
    p.push(`${where}: skill "${q.skill}" not in domain ${q.domain}`);
  if (!Number.isInteger(q.domain) || q.domain < 0 || q.domain > 8)
    p.push(`${where}: bad domain`);
  return p;
}

const SIM_NEEDS: Record<string, string[]> = {
  "flow-stepper": ["actors", "steps"],
  "sort-game": ["buckets", "items"],
  "budget-meter": ["items"],
  "layer-toggle": ["layers", "attacks"],
};

export function validateChapter(c: CcdvChapterContent, id: string): string[] {
  const p: string[] = [];
  const meta = CHAPTERS.find((m) => m.id === id);
  if (!meta) return [`unknown chapter id ${id}`];
  if (!c.lesson?.oneLiner?.trim()) p.push("missing oneLiner");
  const blocks = c.lesson?.blocks ?? [];
  const count = (t: string) => blocks.filter((b) => b.type === t).length;
  if (count("markdown") < 6) p.push("need >= 6 markdown blocks");
  if (count("diagram") < 2) p.push("need >= 2 diagram blocks");
  if (count("simulator") < 2) p.push("need >= 2 simulator blocks");
  if (count("callout") < 3) p.push("need >= 3 callouts");
  if (!blocks.some((b) => b.type === "callout" && /exam trap/i.test(b.title)))
    p.push('need a callout titled "Exam trap"');
  const chars = blocks.reduce(
    (s, b) => s + (b.type === "markdown" ? b.markdown.length : 0),
    0,
  );
  if (chars < 7000)
    p.push(`lesson markdown too thin (${chars} chars, need >= 7000)`);
  blocks.forEach((b, i) => {
    if (b.type === "simulator") {
      if (!CCDV_SIMULATORS[b.id] && !SIMULATORS[b.id])
        p.push(`block ${i}: unknown simulator "${b.id}"`);
      for (const key of SIM_NEEDS[b.id] ?? []) {
        const v = (b.props as Record<string, unknown> | undefined)?.[key];
        if (!Array.isArray(v) || v.length === 0)
          p.push(`block ${i}: simulator ${b.id} needs props.${key}[]`);
      }
    }
    if (b.type !== "diagram") return;
    const d = b.diagram;
    if (!d.caption?.trim()) p.push(`block ${i}: diagram needs caption`);
    if (d.kind === "architecture") {
      if (d.nodes.some((n) => n.x < 0 || n.y < 0))
        p.push(
          `block ${i}: node coordinates must be >= 0 (negative ones are clipped)`,
        );
      d.nodes.forEach((n) => {
        if ((n.label?.length ?? 0) > 28)
          p.push(`block ${i}: node label "${n.label}" > 28 chars`);
        if (!DIAGRAM_KINDS[n.kind])
          p.push(`block ${i}: node ${n.id} has invalid kind "${n.kind}"`);
      });
      const ids = new Set(d.nodes.map((n) => n.id));
      d.edges.forEach((e) => {
        if ((e.label?.length ?? 0) > 14)
          p.push(
            `block ${i}: edge label "${e.label}" > 14 chars (clips in the diagram)`,
          );
        if (!ids.has(e.from) || !ids.has(e.to))
          p.push(`block ${i}: edge ${e.from}->${e.to} unknown node`);
      });
    }
    if (d.kind === "sequence") {
      d.participants.forEach((x) => {
        if (!DIAGRAM_KINDS[x.kind])
          p.push(
            `block ${i}: participant ${x.id} has invalid kind "${x.kind}"`,
          );
      });
      const ids = new Set(d.participants.map((x) => x.id));
      d.messages.forEach((m) => {
        if (!ids.has(m.from) || !ids.has(m.to))
          p.push(`block ${i}: message ${m.from}->${m.to} unknown participant`);
      });
    }
    if (d.kind === "steps" && d.steps.length < 2)
      p.push(`block ${i}: steps diagram needs >= 2 steps`);
  });
  const recap = c.lesson?.recap ?? [];
  if (recap.length < 5 || recap.length > 7)
    p.push("recap must have 5-7 points");
  const lab = c.lab;
  if (!lab?.goal?.trim()) p.push("lab: missing goal");
  if (!lab?.requirements?.length) p.push("lab: missing requirements");
  if (!lab || lab.steps.length < 4 || lab.steps.length > 7)
    p.push("lab: need 4-7 steps");
  if (!lab || lab.checkpoints.length < 4 || lab.checkpoints.length > 6)
    p.push("lab: need 4-6 checkpoints");
  if ((c.notes?.length ?? 0) < 800) p.push("notes too short");
  const fc = c.flashcards ?? [];
  if (fc.length < 18 || fc.length > 24) p.push("need 18-24 flashcards");
  fc.forEach((card, i) => {
    if (!card.front?.trim() || !card.back?.trim())
      p.push(`flashcard ${i}: empty side`);
  });
  const mcqs = c.mcqs ?? [];
  if (mcqs.length !== 15) p.push(`need exactly 15 mcqs, got ${mcqs.length}`);
  mcqs.forEach((q, i) => p.push(...validateMcq(q, `mcq ${i + 1}`)));
  const allowed = new Set<number>(meta.domains);
  if (
    id !== "ch00" &&
    mcqs.some((q) => !allowed.has(q.domain) && q.domain !== 0)
  )
    p.push(
      `mcq domains must stay within chapter domains [${meta.domains.join(",")}]`,
    );
  return p;
}

export function validateExam(exam: CcdvExam, number: number): string[] {
  const p: string[] = [];
  if (exam.number !== number) p.push(`number ${exam.number} != file ${number}`);
  if (exam.questions.length !== 53)
    p.push(`need 53 questions, got ${exam.questions.length}`);
  const want = examDomainCounts(number);
  const got: Record<number, number> = {};
  const ids = new Set<string>();
  const chapterIds = new Set(CHAPTERS.map((c) => c.id));
  exam.questions.forEach((q, i) => {
    got[q.domain] = (got[q.domain] ?? 0) + 1;
    if (ids.has(q.id)) p.push(`duplicate id ${q.id}`);
    ids.add(q.id);
    if (!chapterIds.has(q.chapterId))
      p.push(`q${i + 1}: bad chapterId ${q.chapterId}`);
    p.push(...validateMcq(q, `q${i + 1}`));
  });
  for (const [d, n] of Object.entries(want)) {
    if ((got[Number(d)] ?? 0) !== n)
      p.push(`domain ${d}: want ${n}, got ${got[Number(d)] ?? 0}`);
  }
  return p;
}

export interface PoolQuestion extends CcdvMcqBase {
  domain: number;
  chapterId: string;
}

export function validatePool(pool: PoolQuestion[]): string[] {
  const p: string[] = [];
  const chapterIds = new Set(CHAPTERS.map((c) => c.id));
  pool.forEach((q, i) => {
    if (!chapterIds.has(q.chapterId))
      p.push(`q${i + 1}: bad chapterId ${q.chapterId}`);
    if (q.domain < 1) p.push(`q${i + 1}: pool questions need domain 1-8`);
    p.push(...validateMcq(q, `q${i + 1}`));
  });
  const seen = new Set<string>();
  for (const q of pool) {
    const key = q.question.trim().toLowerCase();
    if (seen.has(key))
      p.push(`duplicate question text: ${q.question.slice(0, 50)}`);
    seen.add(key);
  }
  return p;
}
