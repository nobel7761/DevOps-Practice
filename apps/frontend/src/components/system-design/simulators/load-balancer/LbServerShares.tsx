import type { LbState } from "@/lib/system-design/sim/load-balancer/engine";
import { getMetrics } from "@/lib/system-design/sim/load-balancer/engine";

/** How much of the traffic each server got, as labelled bars (one series, so no legend). */
export function LbServerShares({ state }: { state: LbState }) {
  const { perServer } = getMetrics(state);
  const total = Object.values(perServer).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">
        প্রতিটা server-এর ভাগ
      </span>
      {state.servers.map((server) => {
        const count = perServer[server.id] ?? 0;
        const share = total === 0 ? 0 : (count / total) * 100;
        return (
          <div
            key={server.id}
            className="flex items-center gap-2 text-xs"
            title={`${server.name}: ${count}টা request (${share.toFixed(0)}%)`}
          >
            <span className="w-16 shrink-0">{server.name}</span>
            <div className="h-2 flex-1 rounded-full bg-border">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${share}%` }}
              />
            </div>
            <span className="w-16 shrink-0 text-right tabular-nums">
              {count} · {share.toFixed(0)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
