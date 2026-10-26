/** A component box in diagram coordinates; x/y is the top-left corner. */
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** Where the line from `box`'s centre towards (dx, dy) leaves the box. */
function borderPoint(box: Box, dx: number, dy: number) {
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  // Scale the direction so it just reaches the nearer of the vertical/horizontal borders.
  const scaleX = dx === 0 ? Infinity : box.width / 2 / Math.abs(dx);
  const scaleY = dy === 0 ? Infinity : box.height / 2 / Math.abs(dy);
  const scale = Math.min(scaleX, scaleY);
  return { x: cx + dx * scale, y: cy + dy * scale };
}

/** Edge between two boxes, running centre-to-centre but clipped to each box's border. */
export function edgeEndpoints(from: Box, to: Box): Segment {
  const dx = to.x + to.width / 2 - (from.x + from.width / 2);
  const dy = to.y + to.height / 2 - (from.y + from.height / 2);
  const start = borderPoint(from, dx, dy);
  const end = borderPoint(to, -dx, -dy);
  return { x1: start.x, y1: start.y, x2: end.x, y2: end.y };
}

/** Triangle [tip, left, right] for an arrowhead at the end of `segment`. */
export function arrowHead(segment: Segment, length: number, halfWidth: number) {
  const { x1, y1, x2, y2 } = segment;
  const distance = Math.hypot(x2 - x1, y2 - y1) || 1;
  const ux = (x2 - x1) / distance;
  const uy = (y2 - y1) / distance;
  const baseX = x2 - ux * length;
  const baseY = y2 - uy * length;
  // Perpendicular (uy, -ux) gives the left side for a left-to-right edge in screen coordinates.
  return [
    { x: x2, y: y2 },
    { x: baseX + uy * halfWidth, y: baseY - ux * halfWidth },
    { x: baseX - uy * halfWidth, y: baseY + ux * halfWidth },
  ] as const;
}

/** Moves a segment `distance` to its right (in screen coordinates), keeping its direction. */
export function offsetSegment(segment: Segment, distance: number): Segment {
  const { x1, y1, x2, y2 } = segment;
  const length = Math.hypot(x2 - x1, y2 - y1) || 1;
  const nx = (-(y2 - y1) / length) * distance;
  const ny = ((x2 - x1) / length) * distance;
  // `+ 0` turns -0 into 0 so callers comparing with toEqual aren't surprised.
  return { x1: x1 + nx + 0, y1: y1 + ny + 0, x2: x2 + nx + 0, y2: y2 + ny + 0 };
}
