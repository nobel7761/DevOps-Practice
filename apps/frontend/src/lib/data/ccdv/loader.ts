import fs from "node:fs";
import path from "node:path";
import type { CcdvChapterContent, CcdvExam } from "./types";

const ROOT = path.join(process.cwd(), "src/lib/data/ccdv");

function readJson<T>(dir: string, name: string): T | null {
  const base = path.join(ROOT, dir);
  const filePath = path.join(base, name);
  if (!filePath.startsWith(base) || !fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

function listJson(dir: string): string[] {
  const base = path.join(ROOT, dir);
  if (!fs.existsSync(base)) return [];
  return fs.readdirSync(base).filter((name) => name.endsWith(".json"));
}

export function getCcdvChapter(chapterId: string): CcdvChapterContent | null {
  return readJson<CcdvChapterContent>("chapters", `${chapterId}.json`);
}

export function getCcdvExam(number: number): CcdvExam | null {
  const name = `exam-${String(number).padStart(2, "0")}.json`;
  return readJson<CcdvExam>("exams", name);
}

export function listCcdvChapterIds(): string[] {
  return listJson("chapters").map((name) => name.replace(/\.json$/, ""));
}

export function listCcdvExamNumbers(): number[] {
  return listJson("exams")
    .map((name) => Number(/exam-(\d+)\.json/.exec(name)?.[1]))
    .filter((value) => Number.isFinite(value));
}
