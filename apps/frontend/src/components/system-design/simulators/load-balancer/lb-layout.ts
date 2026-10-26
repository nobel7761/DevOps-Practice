// Where things sit in the Load Balancer Lab's <svg> (visual layout only).

import { NODE_HEIGHT, NODE_WIDTH } from "@/components/shared/diagram";
import type { LbState } from "@/lib/system-design/sim/load-balancer/engine";

export const VIEW_WIDTH = 780;
export const USER_X = 36;
export const USER_RADIUS = 11;
export const LB_X = 270;
export const SERVER_X = 560;
export const SERVER_WIDTH = 210;
export const SERVER_HEIGHT = 78;
const SERVER_GAP = 12;
const MIN_HEIGHT = 320;
const TOP = 12;

/** Request dots take this long (simulated) to travel user → LB → server. */
export const TRAVEL_MS = 300;
export const RESPONSE_MS = 250;

export function layoutFor(state: LbState) {
  const serverBlock = state.servers.length * (SERVER_HEIGHT + SERVER_GAP);
  const height = Math.max(MIN_HEIGHT, serverBlock + TOP * 2);
  const users = state.config.traffic.userCount;
  const userY = (userId: number) =>
    TOP + ((userId + 0.5) * (height - TOP * 2)) / users;
  const serverTop = (index: number) =>
    (height - serverBlock) / 2 +
    index * (SERVER_HEIGHT + SERVER_GAP) +
    SERVER_GAP / 2;
  const redundant = state.config.lbRedundancy;
  const lbTop = (which: "primary" | "passive") =>
    redundant
      ? height / 2 + (which === "primary" ? -NODE_HEIGHT - 8 : 8)
      : height / 2 - NODE_HEIGHT / 2;

  return {
    height,
    userY,
    serverTop,
    lbTop,
    lbCentre: { x: LB_X + NODE_WIDTH / 2, y: height / 2 },
    lbRightX: LB_X + NODE_WIDTH,
    serverAnchor: (index: number) => ({
      x: SERVER_X,
      y: serverTop(index) + SERVER_HEIGHT / 2,
    }),
  };
}

export type LbLayout = ReturnType<typeof layoutFor>;

/** Distinct, stable colour per user; dots also carry the user number so colour is never the only cue. */
export const userColor = (userId: number) =>
  `hsl(${(userId * 137.5) % 360} 70% 52%)`;
