import fs from "node:fs";
import path from "node:path";
import type { HermesLesson } from "./lesson.types";

const LESSON_DIR = path.join(process.cwd(), "src/lib/data/hermes/docs");

export function getHermesLesson(contentId: string): HermesLesson | null {
  const filePath = path.join(LESSON_DIR, `${contentId}.json`);
  if (!filePath.startsWith(LESSON_DIR) || !fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as HermesLesson;
}

/** Content ids that already have a written lesson. */
export function listWrittenHermesLessonIds(): string[] {
  if (!fs.existsSync(LESSON_DIR)) return [];
  return fs
    .readdirSync(LESSON_DIR)
    .filter((name) => name.endsWith(".json"))
    .map((name) => name.replace(/\.json$/, ""));
}
