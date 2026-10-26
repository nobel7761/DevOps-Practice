import {
  MetricLineChart,
  MetricTile,
  type MetricPoint,
  type MetricTone,
} from "@/components/shared/simulator";
import {
  getMetrics,
  getRecentStats,
  type LbState,
} from "@/lib/system-design/sim/load-balancer/engine";
import { LbServerShares } from "./LbServerShares";

const successTone = (rate: number, completed: number): MetricTone =>
  completed === 0
    ? "neutral"
    : rate >= 99
      ? "good"
      : rate >= 95
        ? "warning"
        : "critical";

const latencyTone = (ms: number): MetricTone =>
  ms === 0 ? "neutral" : ms < 300 ? "good" : ms < 1000 ? "warning" : "critical";

export function LbMetricsPanel({
  state,
  history,
}: {
  state: LbState;
  history: MetricPoint[];
}) {
  const m = getMetrics(state);
  const recent = getRecentStats(state, 1000);
  const completed = m.succeeded + m.failed;

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <MetricTile label="মোট request" value={String(m.total)} />
        <MetricTile
          label="Success"
          value={`${m.successRate}%`}
          tone={successTone(m.successRate, completed)}
        />
        <MetricTile label="সফল" value={String(m.succeeded)} />
        <MetricTile
          label="Fail"
          value={String(m.failed)}
          tone={m.failed > 0 ? "critical" : "neutral"}
        />
        <MetricTile label="Throughput" value={`${recent.throughput} RPS`} />
        <MetricTile
          label="Session হারাল"
          value={String(m.sessionsLost)}
          tone={m.sessionsLost > 0 ? "warning" : "neutral"}
        />
        <MetricTile label="p50" value={`${m.p50}ms`} />
        <MetricTile
          label="p95"
          value={`${m.p95}ms`}
          tone={latencyTone(m.p95)}
        />
        <MetricTile
          label="p99"
          value={`${m.p99}ms`}
          tone={latencyTone(m.p99)}
        />
      </div>
      <LbServerShares state={state} />
      <MetricLineChart
        title="p99 latency (গত ১ সেকেন্ড)"
        unit="ms"
        points={history}
      />
    </>
  );
}
