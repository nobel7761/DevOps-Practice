import {
  MetricLineChart,
  MetricTile,
  type MetricPoint,
} from "@/components/shared/simulator";
import {
  getMqMetrics,
  type MqState,
} from "@/lib/system-design/sim/message-queue/engine";

export function MqMetricsPanel({
  state,
  history,
}: {
  state: MqState;
  history: MetricPoint[];
}) {
  const m = getMqMetrics(state);
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <MetricTile
          label="Queue depth"
          value={String(m.queueDepth)}
          tone={
            m.queueDepth > 60
              ? "critical"
              : m.queueDepth > 20
                ? "warning"
                : "neutral"
          }
        />
        <MetricTile label="In-flight" value={String(m.inFlight)} />
        <MetricTile label="Throughput" value={`${m.throughput}/s`} />
        <MetricTile label="গড় অপেক্ষা" value={`${m.avgWaitMs}ms`} />
        <MetricTile
          label="সফল"
          value={String(m.succeeded)}
          tone={m.succeeded > 0 ? "good" : "neutral"}
        />
        <MetricTile
          label="Retry"
          value={String(m.retried)}
          tone={m.retried > 0 ? "warning" : "neutral"}
        />
        <MetricTile
          label="DLQ-তে"
          value={String(m.dlq)}
          tone={m.dlq > 0 ? "warning" : "neutral"}
        />
        <MetricTile
          label="হারানো"
          value={String(m.lost)}
          tone={m.lost > 0 ? "critical" : "neutral"}
        />
        <MetricTile
          label="Duplicate কাজ"
          value={String(m.duplicateWork)}
          tone={m.duplicateWork > 0 ? "critical" : "neutral"}
        />
      </div>
      <MetricLineChart
        title="Queue depth (প্রতি সেকেন্ডে)"
        unit="টা"
        points={history}
      />
    </>
  );
}
