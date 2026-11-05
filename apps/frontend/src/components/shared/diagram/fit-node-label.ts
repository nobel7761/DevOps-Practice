export const MAX_FONT = 13;
export const MIN_FONT = 8;
/** Rough average glyph width as a share of font size. */
export const GLYPH_RATIO = 0.62;

export interface FittedLabel {
  lines: string[];
  fontSize: number;
}

const fontFor = (longest: number, room: number) =>
  Math.floor(
    Math.min(MAX_FONT, room / (Math.max(longest, 1) * GLYPH_RATIO)) * 100,
  ) / 100;

/** Possible two-line splits at a space (dropped) or after "/" or "-". */
function separatorSplits(text: string): string[][] {
  const splits: string[][] = [];
  for (let i = 1; i < text.length - 1; i++) {
    const ch = text[i];
    if (ch === " ") splits.push([text.slice(0, i), text.slice(i + 1)]);
    else if (ch === "/" || ch === "-")
      splits.push([text.slice(0, i + 1), text.slice(i + 1)]);
  }
  return splits.filter(([a, b]) => a.trim() && b.trim());
}

const longest = (lines: string[]) => Math.max(...lines.map((l) => l.length));

/**
 * Picks the font size and line breaks that keep a node label inside `room`
 * (px): one shrunk line if it fits, otherwise two lines split at a separator,
 * otherwise split down the middle.
 */
export function fitNodeLabel(text: string, room: number): FittedLabel {
  const single = fontFor(text.length, room);
  if (single >= MIN_FONT) return { lines: [text], fontSize: single };

  const best = separatorSplits(text).sort((a, b) => longest(a) - longest(b))[0];
  const lines =
    best && fontFor(longest(best), room) >= MIN_FONT
      ? best
      : [
          text.slice(0, Math.ceil(text.length / 2)),
          text.slice(Math.ceil(text.length / 2)),
        ];

  return { lines, fontSize: Math.max(MIN_FONT, fontFor(longest(lines), room)) };
}
