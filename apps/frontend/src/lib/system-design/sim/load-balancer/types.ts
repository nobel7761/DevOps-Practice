// Types for the Load Balancer Lab engine (Plan doc Section 9.2).

export type ServerSize = "small" | "medium" | "large";
export type ServerStatus = "healthy" | "slow" | "down";
export type RequestKind = "light" | "heavy";
export type LbPath = "/api" | "/images" | "/video";
export type LbMode = "L4" | "L7";
export type TrafficPattern = "steady" | "ramp" | "spike";

export type LbAlgorithm =
  | "round-robin"
  | "weighted-round-robin"
  | "least-connections"
  | "least-response-time"
  | "ip-hash"
  | "random"
  | "power-of-two";

export const DEFAULT_POOL = "default";
export const LB_PATHS: LbPath[] = ["/api", "/images", "/video"];

/** Concurrent request slots (100% CPU) and routing weight per size. */
export const SERVER_SIZES: Record<
  ServerSize,
  { capacity: number; weight: number }
> = {
  small: { capacity: 2, weight: 1 },
  medium: { capacity: 4, weight: 2 },
  large: { capacity: 8, weight: 4 },
};

export const REQUEST_DURATION_MS: Record<RequestKind, number> = {
  light: 50,
  heavy: 500,
};
export const SLOW_FACTOR = 5;
/** Waiting requests a server holds beyond its slots before it answers 503. */
export const SERVER_QUEUE_LIMIT = 100;
export const MIN_SERVERS = 2;
export const MAX_SERVERS = 8;

export interface TrafficConfig {
  /** Requests per second; 0 = no automatic traffic. */
  rps: number;
  pattern: TrafficPattern;
  /** Share of heavy (500ms) requests, 0-1. */
  heavyRatio: number;
  userCount: number;
}

export interface HealthCheckConfig {
  enabled: boolean;
  intervalMs: number;
  /** Consecutive failed probes before a server is taken out of rotation. */
  failThreshold: number;
}

export interface LbConfig {
  algorithm: LbAlgorithm;
  healthCheck: HealthCheckConfig;
  retry: boolean;
  sticky: boolean;
  mode: LbMode;
  /** L7 only: path → server pool. Unlisted paths go to the default pool. */
  routes: Partial<Record<LbPath, string>>;
  lbRedundancy: boolean;
  failoverMs: number;
  traffic: TrafficConfig;
}

export interface LbJob {
  requestId: number;
  userId: number;
  path: LbPath;
  kind: RequestKind;
  sentAt: number;
  remainingMs: number;
}

export interface LbServer {
  id: string;
  name: string;
  size: ServerSize;
  status: ServerStatus;
  pool: string;
  inRotation: boolean;
  consecutiveFails: number;
  active: LbJob[];
  queue: LbJob[];
  /** Moving average of completed request latency, for Least Response Time. */
  avgLatencyMs: number | null;
}

export type LbRequestStatus = "in-flight" | "succeeded" | "failed";

export interface LbRequest {
  id: number;
  userId: number;
  path: LbPath;
  kind: RequestKind;
  serverId: string | null;
  sentAt: number;
  finishedAt: number | null;
  status: LbRequestStatus;
}

/** Counters since the last setup change — what challenges measure. */
export interface LbWindow {
  startMs: number;
  total: number;
  succeeded: number;
  failed: number;
  latencies: number[];
  lightLatencies: number[];
  userSwitches: number;
  videoSucceeded: number;
  busyMs: Record<string, number>;
}

export interface LbTotals {
  total: number;
  succeeded: number;
  failed: number;
  sessionsLost: number;
  perServer: Record<string, number>;
  latencies: number[];
}

export interface LbState {
  timeMs: number;
  config: LbConfig;
  servers: LbServer[];
  nextServerNumber: number;
  nextRequestId: number;
  rngState: number;
  trafficCarry: number;
  rrCursor: Record<string, number>;
  wrrCurrent: Record<string, number>;
  stickyServer: Record<number, string>;
  lastServerByUser: Record<number, string>;
  lb: {
    primaryUp: boolean;
    primaryDownSince: number | null;
    failoverLogged: boolean;
  };
  requests: LbRequest[];
  log: string[];
  totals: LbTotals;
  window: LbWindow;
}
