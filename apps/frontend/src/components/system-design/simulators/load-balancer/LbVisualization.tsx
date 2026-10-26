"use client";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { LbState } from "@/lib/system-design/sim/load-balancer/engine";
import { LbBalancers } from "./LbBalancers";
import { LbLinks } from "./LbLinks";
import { LbRequestDots } from "./LbRequestDots";
import { LbServerCard } from "./LbServerCard";
import { LbUsers } from "./LbUsers";
import { VIEW_WIDTH, layoutFor } from "./lb-layout";

export function LbVisualization({ state }: { state: LbState }) {
  const reduceMotion = usePrefersReducedMotion();
  const layout = layoutFor(state);

  return (
    <>
      <p className="sticky left-0 px-3 pt-2 text-xs text-muted-foreground sm:hidden">
        ← পাশে scroll করে server-গুলো দেখুন →
      </p>
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${layout.height}`}
        width="100%"
        style={{ minWidth: 560 }}
        role="img"
        aria-label={`Users থেকে Load Balancer হয়ে ${state.servers.length}টা server-এ request যাচ্ছে`}
      >
        <LbLinks state={state} layout={layout} />
        <LbUsers count={state.config.traffic.userCount} layout={layout} />
        <LbBalancers state={state} layout={layout} />
        {state.servers.map((server, index) => (
          <LbServerCard
            key={server.id}
            server={server}
            y={layout.serverTop(index)}
            showPool={state.config.mode === "L7"}
          />
        ))}
        {!reduceMotion && <LbRequestDots state={state} layout={layout} />}
      </svg>
    </>
  );
}
