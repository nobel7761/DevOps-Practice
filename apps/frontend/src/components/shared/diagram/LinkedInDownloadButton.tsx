"use client";

import { Download } from "lucide-react";
import { useState, type RefObject } from "react";
import { snapshotSvg } from "@/lib/system-design/export/svg-snapshot";
import {
  downloadCanvasPng,
  renderTopicImage,
} from "@/lib/system-design/export/linkedin-canvas";
import { Button } from "../shadcn";

/** "⬇️ LinkedIn-এর জন্য ডাউনলোড": 1080×1350 light-theme PNG of the first diagram inside `targetRef`. */
export function LinkedInDownloadButton({
  targetRef,
  getTarget,
  dayLabel,
  title,
  definition,
  keyPoints,
  fileName,
}: {
  targetRef?: RefObject<HTMLElement | null>;
  /** Alternative to targetRef, for a diagram rendered elsewhere on the page. */
  getTarget?: () => HTMLElement | null;
  dayLabel: string;
  title: string;
  definition: string;
  keyPoints?: string[];
  fileName: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    const svg = (targetRef?.current ?? getTarget?.())?.querySelector("svg");
    if (!svg) {
      setError("ছবি বানানোর মতো diagram পাওয়া যায়নি।");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const diagram = await snapshotSvg(svg);
      downloadCanvasPng(
        renderTopicImage({ dayLabel, title, definition, diagram, keyPoints }),
        fileName,
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="flex items-center gap-2">
      {error && <span className="text-xs text-destructive">{error}</span>}
      <Button size="sm" variant="outline" onClick={download} disabled={busy}>
        <Download />
        LinkedIn-এর জন্য ডাউনলোড
      </Button>
    </span>
  );
}
