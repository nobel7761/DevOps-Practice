"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/shared/shadcn";
import { ControlSelect } from "@/components/shared/simulator";
import {
  LB_PATHS,
  updateConfig,
  type LbMode,
  type LbPath,
} from "@/lib/system-design/sim/load-balancer/engine";
import { POOLS } from "./LbServerRow";
import type { LoadBalancerLab } from "./useLoadBalancerLab";

function RouteRow({ lab, path }: { lab: LoadBalancerLab; path: LbPath }) {
  const pool = lab.state.config.routes[path] ?? "default";
  return (
    <ControlSelect
      label={`${path} → pool`}
      value={pool}
      options={POOLS.map((p) => ({ value: p, label: p }))}
      onChange={(next) =>
        lab.update((s) =>
          updateConfig(s, { routes: { ...s.config.routes, [path]: next } }),
        )
      }
    />
  );
}

export function LbRoutingControls({ lab }: { lab: LoadBalancerLab }) {
  const { mode } = lab.state.config;
  return (
    <div className="flex flex-col gap-3">
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={mode}
        onValueChange={(value) =>
          value && lab.update((s) => updateConfig(s, { mode: value as LbMode }))
        }
        className="w-fit"
      >
        <ToggleGroupItem value="L4" className="px-3">
          L4 (শুধু IP/port)
        </ToggleGroupItem>
        <ToggleGroupItem value="L7" className="px-3">
          L7 (path দেখে)
        </ToggleGroupItem>
      </ToggleGroup>
      {mode === "L7" ? (
        <>
          <p className="text-xs text-muted-foreground">
            Request-এর path দেখে আলাদা server pool-এ পাঠান। Servers tab-এ
            প্রতিটা server-কে একটা pool দিন।
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {LB_PATHS.map((path) => (
              <RouteRow key={path} lab={lab} path={path} />
            ))}
          </div>
        </>
      ) : (
        <p className="text-xs text-muted-foreground">
          L4-এ Load Balancer request-এর ভেতর দেখে না, সব server একই pool।
        </p>
      )}
    </div>
  );
}
