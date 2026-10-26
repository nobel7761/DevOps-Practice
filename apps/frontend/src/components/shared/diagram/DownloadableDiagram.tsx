"use client";

import { useRef, type ReactNode } from "react";
import { DiagramFigure } from "./DiagramFigure";
import { LinkedInDownloadButton } from "./LinkedInDownloadButton";

/** A DiagramFigure with the LinkedIn download button — for a lesson's main diagram (Plan doc Section 6.4). */
export function DownloadableDiagram({
  caption,
  alt,
  diagramId,
  dayLabel,
  title,
  definition,
  fileName,
  minWidth,
  children,
}: {
  caption: string;
  alt: string;
  diagramId?: string;
  dayLabel: string;
  title: string;
  definition: string;
  fileName: string;
  minWidth?: number;
  children: ReactNode;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  return (
    <DiagramFigure
      caption={caption}
      alt={alt}
      diagramId={diagramId}
      minWidth={minWidth}
      canvasRef={canvasRef}
      actions={
        <LinkedInDownloadButton
          targetRef={canvasRef}
          dayLabel={dayLabel}
          title={title}
          definition={definition}
          fileName={fileName}
        />
      }
    >
      {children}
    </DiagramFigure>
  );
}
