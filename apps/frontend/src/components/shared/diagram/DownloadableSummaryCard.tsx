"use client";

import { useRef, type ComponentProps } from "react";
import { LinkedInDownloadButton } from "./LinkedInDownloadButton";
import { SummaryCard } from "./SummaryCard";

/** SummaryCard plus its LinkedIn download (Plan doc Section 6.4). */
export function DownloadableSummaryCard({
  fileName,
  dayLabel,
  ...card
}: Omit<ComponentProps<typeof SummaryCard>, "cardRef"> & {
  fileName: string;
  dayLabel: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  return (
    <div className="flex flex-col gap-2">
      <SummaryCard {...card} cardRef={cardRef} />
      <div className="flex justify-end">
        <LinkedInDownloadButton
          targetRef={cardRef}
          dayLabel={dayLabel}
          title={card.title}
          definition={card.definition}
          keyPoints={card.keyPoints}
          fileName={fileName}
        />
      </div>
    </div>
  );
}
