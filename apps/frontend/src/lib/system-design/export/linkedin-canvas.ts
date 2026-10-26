// Draws LinkedIn-ready 1080×1350 portrait images (Plan doc Section 6.4):
// `Day N` + topic on top, the diagram in the middle, a one-line definition
// at the bottom. Always light theme. Browser-only.

import { LINKEDIN_IMAGE, fitInside, wrapText } from "./layout";
import type { RecapSlide } from "./carousel";

const MARGIN = 72;
const FONT = `system-ui, -apple-system, "Noto Sans Bengali", "Segoe UI", sans-serif`;
const COLORS = {
  background: "#ffffff",
  ink: "#1f2430",
  muted: "#5b6170",
  accent: "#4f46e5",
  panel: "#f4f5f8",
};

function createCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = LINKEDIN_IMAGE.width;
  canvas.height = LINKEDIN_IMAGE.height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textBaseline = "top";
  return { canvas, ctx };
}

/** Draws wrapped text and returns the y just below it. */
function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  {
    y,
    size,
    weight = 400,
    color = COLORS.ink,
    lineHeight = 1.35,
    maxLines = Infinity,
  }: {
    y: number;
    size: number;
    weight?: number;
    color?: string;
    lineHeight?: number;
    maxLines?: number;
  },
) {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.fillStyle = color;
  const lines = wrapText(
    text,
    LINKEDIN_IMAGE.width - MARGIN * 2,
    (s) => ctx.measureText(s).width,
  ).slice(0, maxLines);
  lines.forEach((line, i) =>
    ctx.fillText(line, MARGIN, y + i * size * lineHeight),
  );
  return y + lines.length * size * lineHeight;
}

function drawHeader(
  ctx: CanvasRenderingContext2D,
  dayLabel: string,
  title: string,
) {
  const afterDay = drawText(ctx, dayLabel, {
    y: MARGIN,
    size: 34,
    weight: 700,
    color: COLORS.accent,
  });
  return drawText(ctx, title, {
    y: afterDay + 12,
    size: 64,
    weight: 800,
    maxLines: 2,
    lineHeight: 1.2,
  });
}

/** Image for one topic's main diagram or summary card. */
export function renderTopicImage({
  dayLabel,
  title,
  definition,
  diagram,
  keyPoints = [],
}: {
  dayLabel: string;
  title: string;
  definition: string;
  diagram: HTMLImageElement;
  keyPoints?: string[];
}): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas();
  const headerBottom = drawHeader(ctx, dayLabel, title);

  // Footer is laid out bottom-up so the diagram gets whatever room is left.
  const footerSize = 36;
  const pointSize = 30;
  const footerHeight =
    footerSize * 1.35 * 2 +
    keyPoints.length * pointSize * 1.5 +
    (keyPoints.length ? 24 : 0);
  const footerTop = LINKEDIN_IMAGE.height - MARGIN - footerHeight;

  const box = {
    x: MARGIN,
    y: headerBottom + 40,
    width: LINKEDIN_IMAGE.width - MARGIN * 2,
    height: footerTop - headerBottom - 80,
  };
  ctx.fillStyle = COLORS.panel;
  ctx.beginPath();
  ctx.roundRect(box.x - 24, box.y - 24, box.width + 48, box.height + 48, 32);
  ctx.fill();
  const placed = fitInside(
    { width: diagram.width, height: diagram.height },
    box,
  );
  ctx.drawImage(diagram, placed.x, placed.y, placed.width, placed.height);

  let y = drawText(ctx, definition, {
    y: footerTop,
    size: footerSize,
    weight: 600,
    maxLines: 2,
  });
  if (keyPoints.length) y += 24;
  keyPoints.forEach((point, i) => {
    y = drawText(ctx, `${i + 1}. ${point}`, {
      y,
      size: pointSize,
      color: COLORS.muted,
      maxLines: 1,
      lineHeight: 1.5,
    });
  });
  return canvas;
}

/** One slide of the weekly recap carousel. */
export function renderRecapSlide(slide: RecapSlide): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas();
  const centreY = LINKEDIN_IMAGE.height / 2;

  if (slide.kind === "cover") {
    drawText(
      ctx,
      `Week ${slide.week} · Day ${slide.firstDay}-${slide.lastDay}`,
      { y: centreY - 200, size: 40, weight: 700, color: COLORS.accent },
    );
    drawText(ctx, "এই সপ্তাহে System Design-এর ৭টা জিনিস শিখলাম", {
      y: centreY - 120,
      size: 72,
      weight: 800,
      lineHeight: 1.2,
    });
    drawText(ctx, "Swipe করুন →", {
      y: LINKEDIN_IMAGE.height - MARGIN - 50,
      size: 36,
      color: COLORS.muted,
    });
  } else if (slide.kind === "topic") {
    const below = drawHeader(ctx, `Day ${slide.day}`, slide.title);
    drawText(ctx, slide.definition, {
      y: below + 60,
      size: 44,
      lineHeight: 1.45,
      maxLines: 10,
    });
  } else {
    let y = drawText(ctx, "পরের সপ্তাহে আসছে", {
      y: centreY - 260,
      size: 64,
      weight: 800,
    });
    y += 30;
    slide.topics.forEach((topic) => {
      y = drawText(ctx, `→ ${topic}`, {
        y,
        size: 44,
        color: COLORS.ink,
        lineHeight: 1.6,
      });
    });
    drawText(ctx, "Save করে রাখুন 🔖", {
      y: LINKEDIN_IMAGE.height - MARGIN - 50,
      size: 36,
      color: COLORS.muted,
    });
  }
  return canvas;
}

export function downloadCanvasPng(canvas: HTMLCanvasElement, fileName: string) {
  const link = document.createElement("a");
  link.download = fileName;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

/** One page per slide, each the full 1080×1350 image. jsPDF loads only when needed. */
export async function downloadCarouselPdf(
  slides: HTMLCanvasElement[],
  fileName: string,
) {
  const { jsPDF } = await import("jspdf");
  const { width, height } = LINKEDIN_IMAGE;
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [width, height],
    hotfixes: ["px_scaling"],
  });
  slides.forEach((slide, index) => {
    if (index > 0) pdf.addPage([width, height], "portrait");
    pdf.addImage(
      slide.toDataURL("image/jpeg", 0.92),
      "JPEG",
      0,
      0,
      width,
      height,
    );
  });
  pdf.save(fileName);
}
