import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SKILLS, TOTAL_DOMAIN_COUNTS, examDomainCounts } from "./blueprint";
import { CHAPTERS, parseExamContentId, parseLessonContentId } from "./schedule";
import type { CcdvChapterContent, CcdvExam } from "./types";
import {
  validateChapter,
  validateExam,
  validatePool,
  type PoolQuestion,
} from "./validate-ccdv";

function jsonFiles(dir: string): string[] {
  const full = path.join(__dirname, dir);
  return fs.existsSync(full)
    ? fs.readdirSync(full).filter((f) => f.endsWith(".json"))
    : [];
}
const read = <T>(dir: string, file: string): T =>
  JSON.parse(fs.readFileSync(path.join(__dirname, dir, file), "utf-8")) as T;

describe("CCDV blueprint and schedule", () => {
  it("skill targets add up to the domain totals", () => {
    const sums: Record<number, number> = {};
    for (const s of SKILLS) sums[s.domain] = (sums[s.domain] ?? 0) + s.target;
    expect(sums).toEqual(TOTAL_DOMAIN_COUNTS);
  });
  it("every exam has 53 items and the 10 exams sum to the domain totals", () => {
    const sums: Record<number, number> = {};
    for (let n = 1; n <= 10; n++) {
      const c = examDomainCounts(n);
      expect(Object.values(c).reduce((a, b) => a + b, 0)).toBe(53);
      for (const [d, v] of Object.entries(c))
        sums[Number(d)] = (sums[Number(d)] ?? 0) + v;
    }
    expect(sums).toEqual(TOTAL_DOMAIN_COUNTS);
  });
  it("covers days 1-14 with 15 chapters and parses content ids", () => {
    expect(CHAPTERS).toHaveLength(15);
    expect(new Set(CHAPTERS.map((c) => c.day)).size).toBe(14);
    expect(parseLessonContentId("ccdv-ch03-lab")).toEqual({
      chapterId: "ch03",
      part: "lab",
    });
    expect(parseExamContentId("ccdv-exam-07")).toBe(7);
  });
});

describe("CCDV chapters", () => {
  const files = jsonFiles("chapters");
  it("lists its files", () => expect(Array.isArray(files)).toBe(true));
  it.each(files)("%s is valid", (file) => {
    const id = file.replace(/\.json$/, "");
    expect(
      validateChapter(read<CcdvChapterContent>("chapters", file), id),
    ).toEqual([]);
  });
});

describe("CCDV exams", () => {
  const files = jsonFiles("exams");
  it("lists its files", () => expect(Array.isArray(files)).toBe(true));
  it.each(files)("%s is valid", (file) => {
    const number = Number(/exam-(\d+)/.exec(file)?.[1]);
    expect(validateExam(read<CcdvExam>("exams", file), number)).toEqual([]);
  });
});

describe("CCDV question pools", () => {
  const files = jsonFiles("question-pools");
  it("lists its files", () => expect(Array.isArray(files)).toBe(true));
  it.each(files)("%s is valid", (file) => {
    expect(validatePool(read<PoolQuestion[]>("question-pools", file))).toEqual(
      [],
    );
  });
});
