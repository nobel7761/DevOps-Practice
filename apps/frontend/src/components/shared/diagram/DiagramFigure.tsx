import type { ReactNode, Ref } from "react";

/**
 * Frame for every diagram: a horizontally scrollable canvas (so wide diagrams
 * never shrink below a readable size on phones), a Bangla caption and
 * screen-reader alt text (Plan doc Section 6.3 rules 5-6).
 */
export function DiagramFigure({
  caption,
  alt,
  diagramId,
  minWidth = 520,
  actions,
  canvasRef,
  children,
}: {
  caption: string;
  alt: string;
  /** Lets other parts of the page (e.g. the LinkedIn post card) find this diagram. */
  diagramId?: string;
  /** Below this width the canvas scrolls instead of shrinking. */
  minWidth?: number;
  /** e.g. the LinkedIn download button. */
  actions?: ReactNode;
  canvasRef?: Ref<HTMLDivElement>;
  children: ReactNode;
}) {
  return (
    <figure className="my-4">
      <div
        className="overflow-x-auto rounded-xl border border-border"
        style={{ background: "var(--sd-canvas)" }}
      >
        <div
          ref={canvasRef}
          role="img"
          aria-label={alt}
          data-diagram-id={diagramId}
          className="p-4"
          style={{ minWidth }}
        >
          {children}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <figcaption className="text-sm text-muted-foreground">
          {caption}
        </figcaption>
        {actions}
      </div>
    </figure>
  );
}
