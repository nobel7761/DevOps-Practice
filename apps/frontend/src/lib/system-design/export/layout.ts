export interface Size {
  width: number;
  height: number;
}

export interface Rect extends Size {
  x: number;
  y: number;
}

/** LinkedIn portrait image size (Plan doc Section 6.4). */
export const LINKEDIN_IMAGE: Size = { width: 1080, height: 1350 };

/** Greedy word wrap. A word wider than `maxWidth` gets a line to itself rather than being dropped. */
export function wrapText(
  text: string,
  maxWidth: number,
  measure: (text: string) => number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && measure(candidate) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Largest rect with `source`'s aspect ratio that fits in `box`, centred. */
export function fitInside(source: Size, box: Rect): Rect {
  const scale = Math.min(box.width / source.width, box.height / source.height);
  const width = source.width * scale;
  const height = source.height * scale;
  return {
    x: box.x + (box.width - width) / 2,
    y: box.y + (box.height - height) / 2,
    width,
    height,
  };
}
