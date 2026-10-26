import { describe, expect, it } from "vitest";
import { arrowHead, edgeEndpoints, offsetSegment, type Box } from "./geometry";

const box = (x: number, y: number, width = 100, height = 60): Box => ({
  x,
  y,
  width,
  height,
});

function onBorder(point: { x: number; y: number }, b: Box) {
  const eps = 0.001;
  const insideX = point.x >= b.x - eps && point.x <= b.x + b.width + eps;
  const insideY = point.y >= b.y - eps && point.y <= b.y + b.height + eps;
  const onVertical =
    Math.abs(point.x - b.x) < eps || Math.abs(point.x - (b.x + b.width)) < eps;
  const onHorizontal =
    Math.abs(point.y - b.y) < eps || Math.abs(point.y - (b.y + b.height)) < eps;
  return insideX && insideY && (onVertical || onHorizontal);
}

describe("edgeEndpoints", () => {
  it("connects the right edge of a box to the left edge of a box beside it", () => {
    expect(edgeEndpoints(box(0, 0), box(300, 0))).toEqual({
      x1: 100,
      y1: 30,
      x2: 300,
      y2: 30,
    });
  });

  it("connects the bottom edge to the top edge for boxes stacked vertically", () => {
    expect(edgeEndpoints(box(0, 0), box(0, 200))).toEqual({
      x1: 50,
      y1: 60,
      x2: 50,
      y2: 200,
    });
  });

  it("works right-to-left too", () => {
    expect(edgeEndpoints(box(300, 0), box(0, 0))).toEqual({
      x1: 300,
      y1: 30,
      x2: 100,
      y2: 30,
    });
  });

  it("puts both endpoints on the box borders for diagonal edges", () => {
    const from = box(0, 0);
    const to = box(250, 180, 80, 40);
    const { x1, y1, x2, y2 } = edgeEndpoints(from, to);
    expect(onBorder({ x: x1, y: y1 }, from)).toBe(true);
    expect(onBorder({ x: x2, y: y2 }, to)).toBe(true);
  });
});

describe("arrowHead", () => {
  const near = (a: number, b: number) => Math.abs(a - b) < 0.001;

  it("points along a left-to-right edge with its tip at the end", () => {
    const [tip, left, right] = arrowHead(
      { x1: 0, y1: 0, x2: 100, y2: 0 },
      10,
      5,
    );
    expect(tip).toEqual({ x: 100, y: 0 });
    expect(near(left.x, 90) && near(left.y, -5)).toBe(true);
    expect(near(right.x, 90) && near(right.y, 5)).toBe(true);
  });

  it("points down a top-to-bottom edge", () => {
    const [tip, a, b] = arrowHead({ x1: 0, y1: 0, x2: 0, y2: 50 }, 10, 5);
    expect(tip).toEqual({ x: 0, y: 50 });
    expect(near(a.y, 40) && near(b.y, 40)).toBe(true);
    expect(near(Math.abs(a.x), 5) && near(Math.abs(b.x), 5)).toBe(true);
  });
});

describe("offsetSegment", () => {
  it("shifts a horizontal segment perpendicular to its direction", () => {
    expect(offsetSegment({ x1: 0, y1: 0, x2: 100, y2: 0 }, 6)).toEqual({
      x1: 0,
      y1: 6,
      x2: 100,
      y2: 6,
    });
  });

  it("shifts the reverse direction the other way, so A→B and B→A don't overlap", () => {
    expect(offsetSegment({ x1: 100, y1: 0, x2: 0, y2: 0 }, 6)).toEqual({
      x1: 100,
      y1: -6,
      x2: 0,
      y2: -6,
    });
  });
});
