import { describe, expect, it } from "vitest";
import { fitNodeLabel } from "./fit-node-label";

const ROOM = 82; // NODE_WIDTH 132 - icon offset 42 - padding 8
const GLYPH = 0.6;
const widthOf = (line: string, fontSize: number) =>
  line.length * fontSize * GLYPH;

describe("fitNodeLabel", () => {
  it("keeps a short label on one line at the max font size", () => {
    expect(fitNodeLabel("Hermes", ROOM)).toEqual({
      lines: ["Hermes"],
      fontSize: 13,
    });
  });

  it("shrinks a medium label onto one line instead of splitting it", () => {
    const { lines, fontSize } = fitNodeLabel("~/.hermes (data)", ROOM);
    expect(lines).toHaveLength(1);
    expect(fontSize).toBeLessThan(13);
    expect(fontSize).toBeGreaterThanOrEqual(8);
    expect(widthOf(lines[0], fontSize)).toBeLessThanOrEqual(ROOM);
  });

  it("wraps a long label onto two lines at a separator so it stays inside the box", () => {
    const text = "~/.hermes/hermes-agent";
    const { lines, fontSize } = fitNodeLabel(text, ROOM);
    expect(lines).toHaveLength(2);
    expect(lines.join("")).toBe(text);
    expect(fontSize).toBeGreaterThanOrEqual(8);
    lines.forEach((line) =>
      expect(widthOf(line, fontSize)).toBeLessThanOrEqual(ROOM),
    );
  });

  it("wraps a long label with spaces at the space", () => {
    const { lines } = fitNodeLabel("Local Docker SSH Cloud Server", ROOM);
    expect(lines).toHaveLength(2);
    expect(lines.join(" ")).toBe("Local Docker SSH Cloud Server");
  });

  it("hard-splits a long label with no separator rather than overflowing", () => {
    const text = "Supercalifragilisticexpialidocious";
    const { lines, fontSize } = fitNodeLabel(text, ROOM);
    expect(lines).toHaveLength(2);
    expect(lines.join("")).toBe(text);
    lines.forEach((line) =>
      expect(widthOf(line, fontSize)).toBeLessThanOrEqual(ROOM),
    );
  });
});
