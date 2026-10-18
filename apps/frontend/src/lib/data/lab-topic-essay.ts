import fs from "node:fs";
import path from "node:path";

export interface LabTopicEssay {
  labId: string;
  title: string;
  markdown: string;
}

const LAB_TOPIC_ESSAY_DIR = path.join(
  process.cwd(),
  "src/lib/data/lab-topic-essay",
);

/** A full-topic Bengali golpo essay for a lab — same idea as video-golpo.ts, but for labs without a video. Optional: most labs have none. */
export function getLabTopicEssay(labId: string): LabTopicEssay | null {
  const filePath = path.join(LAB_TOPIC_ESSAY_DIR, `${labId}.json`);
  if (!filePath.startsWith(LAB_TOPIC_ESSAY_DIR) || !fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
