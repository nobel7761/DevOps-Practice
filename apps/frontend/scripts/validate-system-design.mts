// Validates every System Design A-Z content file that exists so far, using the
// pure validators in src/lib/system-design/validate-topic.ts. Layout per
// docs/SYSTEM_DESIGN_CONTENT_STRUCTURE.md. Run: pnpm validate:sd
// Exits non-zero when any file has errors.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import {
  validateLinkedInPost,
  validatePostRotation,
  validateQuizBank,
  type LinkedInPostType,
  validateRecallMap,
} from "../src/lib/system-design/validate-topic.ts";

const frontendRoot = join(import.meta.dirname, "..");
const topicsDir = join(frontendRoot, "src/lib/data/system-design/topics");
const recapsDir = join(frontendRoot, "src/lib/data/system-design/recaps");
const quizDir = join(frontendRoot, "../backend/src/system-design-quiz/data");

let fileCount = 0;
let errorCount = 0;

function check(path: string, validate: (data: never) => string[]) {
  fileCount++;
  let errors: string[];
  try {
    errors = validate(JSON.parse(readFileSync(path, "utf8")) as never);
  } catch (error) {
    errors = [`পড়া যায়নি: ${(error as Error).message}`];
  }
  if (errors.length === 0) return;
  errorCount += errors.length;
  console.log(`\n✗ ${relative(frontendRoot, path)}`);
  errors.forEach((message) => console.log(`  - ${message}`));
}

function jsonFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => join(dir, name));
}

// Folder names are "day-012-<slug>", so a plain sort is Day order.
const postTypesInDayOrder: LinkedInPostType[] = [];

if (existsSync(topicsDir)) {
  for (const topic of readdirSync(topicsDir).sort()) {
    const recall = join(topicsDir, topic, "recall.json");
    const post = join(topicsDir, topic, "linkedin.json");
    if (existsSync(recall)) check(recall, validateRecallMap);
    if (existsSync(post)) {
      check(post, validateLinkedInPost);
      try {
        postTypesInDayOrder.push(JSON.parse(readFileSync(post, "utf8")).type);
      } catch {
        // Already reported by check() above.
      }
    }
  }
}

const rotationErrors = validatePostRotation(postTypesInDayOrder);
if (rotationErrors.length > 0) {
  errorCount += rotationErrors.length;
  console.log("\n✗ LinkedIn post-এর ধরনের পালা");
  rotationErrors.forEach((message) => console.log(`  - ${message}`));
}
jsonFiles(recapsDir).forEach((path) => check(path, validateLinkedInPost));
jsonFiles(quizDir).forEach((path) => check(path, validateQuizBank));

console.log(
  `\n${fileCount}টা file যাচাই হয়েছে, ${errorCount}টা error।`,
);
process.exit(errorCount > 0 ? 1 : 0);
