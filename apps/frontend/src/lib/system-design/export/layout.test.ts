import { describe, expect, it } from "vitest";
import { fitInside, wrapText } from "./layout";

// 10px per character keeps the expected wraps easy to read.
const measure = (text: string) => text.length * 10;

describe("wrapText", () => {
  it("keeps text that fits on one line", () => {
    expect(wrapText("Message Queue", 200, measure)).toEqual(["Message Queue"]);
  });

  it("breaks at spaces when a line would overflow", () => {
    expect(wrapText("aaa bbb ccc ddd", 75, measure)).toEqual([
      "aaa bbb",
      "ccc ddd",
    ]);
  });

  it("puts a word longer than the width on its own line instead of dropping it", () => {
    expect(wrapText("a verylongword b", 50, measure)).toEqual([
      "a",
      "verylongword",
      "b",
    ]);
  });

  it("returns no lines for empty text", () => {
    expect(wrapText("   ", 100, measure)).toEqual([]);
  });
});

describe("fitInside", () => {
  it("scales a wide image down to the box width and centres it vertically", () => {
    expect(
      fitInside(
        { width: 200, height: 100 },
        { x: 0, y: 0, width: 100, height: 100 },
      ),
    ).toEqual({
      x: 0,
      y: 25,
      width: 100,
      height: 50,
    });
  });

  it("scales a tall image to the box height and centres it horizontally", () => {
    expect(
      fitInside(
        { width: 50, height: 100 },
        { x: 10, y: 20, width: 100, height: 100 },
      ),
    ).toEqual({
      x: 35,
      y: 20,
      width: 50,
      height: 100,
    });
  });

  it("scales a small image up to fill the box", () => {
    expect(
      fitInside(
        { width: 10, height: 10 },
        { x: 0, y: 0, width: 100, height: 50 },
      ),
    ).toEqual({
      x: 25,
      y: 0,
      width: 50,
      height: 50,
    });
  });
});
