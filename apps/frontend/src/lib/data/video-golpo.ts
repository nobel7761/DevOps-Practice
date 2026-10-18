import fs from "node:fs";
import path from "node:path";

export interface VideoGolpo {
  contentId: string;
  title: string;
  markdown: string;
}

const VIDEO_GOLPO_DIR = path.join(process.cwd(), "src/lib/data/video-golpo");

export function getVideoGolpo(contentId: string): VideoGolpo | null {
  const filePath = path.join(VIDEO_GOLPO_DIR, `${contentId}.json`);
  if (!filePath.startsWith(VIDEO_GOLPO_DIR) || !fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
