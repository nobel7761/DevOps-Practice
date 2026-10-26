/**
 * How many fixed-size simulation ticks to run for one animation frame, given
 * wall time elapsed and the playback speed. Leftover time carries into the
 * next frame; past `maxSteps` the backlog is dropped (e.g. after a tab was
 * in the background) instead of fast-forwarding.
 */
export function stepsDue({
  elapsedMs,
  tickMs,
  speed,
  carryMs,
  maxSteps = Infinity,
}: {
  elapsedMs: number;
  tickMs: number;
  speed: number;
  carryMs: number;
  maxSteps?: number;
}): { steps: number; carryMs: number } {
  const total = elapsedMs * speed + carryMs;
  const steps = Math.floor(total / tickMs);
  if (steps > maxSteps) return { steps: maxSteps, carryMs: 0 };
  return { steps, carryMs: total - steps * tickMs };
}
