import fs from "node:fs";
import path from "node:path";

export interface LabContent {
  id: string;
  title: string | null;
  durationMinutes: number | null;
  learningObjectives: string[];
  category: string | null;
  image: string | null;
  instructionUrl: string | null;
  markdown: string | null;
}

const LABS_DIR = path.join(process.cwd(), "src/lib/data/labs");

export function getLabContent(labId: string): LabContent | null {
  const filePath = path.join(LABS_DIR, `${labId}.json`);
  if (!filePath.startsWith(LABS_DIR) || !fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
