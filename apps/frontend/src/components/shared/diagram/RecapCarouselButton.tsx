"use client";

import { FileDown } from "lucide-react";
import { useState } from "react";
import {
  buildRecapSlides,
  type RecapTopic,
} from "@/lib/system-design/export/carousel";
import {
  downloadCarouselPdf,
  renderRecapSlide,
} from "@/lib/system-design/export/linkedin-canvas";
import { Button } from "../shadcn";

/** Weekly recap PDF carousel: cover + one slide per topic + "পরের সপ্তাহে" (Plan doc Section 6.4). */
export function RecapCarouselButton({
  week,
  topics,
  nextTopics,
}: {
  week: number;
  topics: RecapTopic[];
  nextTopics: string[];
}) {
  const [busy, setBusy] = useState(false);

  async function download() {
    setBusy(true);
    try {
      const slides = buildRecapSlides({ week, topics, nextTopics }).map(
        renderRecapSlide,
      );
      await downloadCarouselPdf(slides, `week-${week}-recap.pdf`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="outline" onClick={download} disabled={busy}>
      <FileDown />
      Week {week} carousel (PDF)
    </Button>
  );
}
