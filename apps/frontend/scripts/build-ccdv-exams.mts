// Deals the question pools in src/lib/data/ccdv/question-pools/*.json into 10 mock exams
// (src/lib/data/ccdv/exams/exam-NN.json). Deterministic: same pools -> same exams.
// Run: node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/build-ccdv-exams.mts

import fs from "node:fs";
import path from "node:path";
import {
  EXAM_COUNT,
  SKILLS,
  examDomainCounts,
} from "../src/lib/data/ccdv/blueprint.ts";

interface PoolQuestion {
  domain: number;
  skill: string;
  chapterId: string;
  question: string;
  options: string[];
  answerIndexes: number[];
  explanation: string;
}

const ROOT = path.join(process.cwd(), "src/lib/data/ccdv");
const POOLS = path.join(ROOT, "question-pools");
const OUT = path.join(ROOT, "exams");

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const all: PoolQuestion[] = fs
  .readdirSync(POOLS)
  .filter((f) => f.endsWith(".json"))
  .flatMap((f) => JSON.parse(fs.readFileSync(path.join(POOLS, f), "utf-8")) as PoolQuestion[]);

// 1) pool must match the per-skill targets exactly
const problems: string[] = [];
for (const skill of SKILLS) {
  const have = all.filter((q) => q.skill === skill.name && q.domain === skill.domain).length;
  if (have !== skill.target) problems.push(`${skill.name}: have ${have}, need ${skill.target}`);
}
if (problems.length) {
  console.error("Pool does not match targets:\n" + problems.join("\n"));
  process.exit(1);
}

// 2) option shuffle (so answer positions are balanced) — answerIndexes remapped
const random = rng(20260705);
const prepared = all.map((q) => {
  const order = shuffle(q.options.map((_, i) => i), random);
  return {
    ...q,
    options: order.map((i) => q.options[i]),
    answerIndexes: q.answerIndexes.map((a) => order.indexOf(a)).sort((x, y) => x - y),
  };
});

// 3) deal each domain's questions round-robin (grouped by skill => skills spread evenly)
const exams: PoolQuestion[][] = Array.from({ length: EXAM_COUNT }, () => []);
for (let domain = 1; domain <= 8; domain++) {
  const skillNames = SKILLS.filter((s) => s.domain === domain).map((s) => s.name);
  const ordered = skillNames.flatMap((name) =>
    shuffle(prepared.filter((q) => q.skill === name && q.domain === domain), random)
      // multi-response first so the round-robin deal spreads them evenly across exams
      .sort((a, b) => Number(b.answerIndexes.length > 1) - Number(a.answerIndexes.length > 1)),
  );
  const quota = Array.from({ length: EXAM_COUNT }, (_, i) => examDomainCounts(i + 1)[domain as 1]);
  let cursor = 0;
  for (const q of ordered) {
    let guard = 0;
    while (quota[cursor % EXAM_COUNT] === 0 && guard++ < EXAM_COUNT) cursor++;
    const target = cursor % EXAM_COUNT;
    exams[target].push(q);
    quota[target]--;
    cursor++;
  }
}

// 4) mix domains inside each exam, assign ids, write files
fs.mkdirSync(OUT, { recursive: true });
exams.forEach((questions, i) => {
  const number = i + 1;
  const tag = String(number).padStart(2, "0");
  const mixed = shuffle(questions, random).map((q, n) => ({
    id: `e${tag}-q${String(n + 1).padStart(2, "0")}`,
    domain: q.domain,
    skill: q.skill,
    chapterId: q.chapterId,
    question: q.question,
    options: q.options,
    answerIndexes: q.answerIndexes,
    explanation: q.explanation,
  }));
  fs.writeFileSync(
    path.join(OUT, `exam-${tag}.json`),
    JSON.stringify({ id: `ccdv-exam-${tag}`, number, questions: mixed }, null, 2),
  );
  const multi = mixed.filter((q) => q.answerIndexes.length > 1).length;
  console.log(`exam-${tag}: ${mixed.length} questions, ${multi} multi-response`);
});
