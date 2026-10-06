import fs from "node:fs";
import path from "node:path";
import type { LabExamSpec } from "@/lib/lab-exam/types";

const LABEXAM_DIR = path.join(process.cwd(), "src/lib/lab-exam/data");

export function getLabExamSpec(labId: string): LabExamSpec | null {
  const filePath = path.join(LABEXAM_DIR, `${labId}.json`);
  if (!filePath.startsWith(LABEXAM_DIR) || !fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
