"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/shadcn";
import {
  MAX_SERVERS,
  addServer,
  type ServerSize,
} from "@/lib/system-design/sim/load-balancer/engine";
import { LbServerRow, SIZE_OPTIONS } from "./LbServerRow";
import type { LoadBalancerLab } from "./useLoadBalancerLab";

function AddServer({ lab }: { lab: LoadBalancerLab }) {
  const [size, setSize] = useState<ServerSize>("medium");
  const full = lab.state.servers.length >= MAX_SERVERS;
  return (
    <div className="flex items-center gap-2">
      <Select value={size} onValueChange={(v) => setSize(v as ServerSize)}>
        <SelectTrigger
          size="sm"
          aria-label="নতুন server-এর size"
          className="w-28"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SIZE_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        variant="outline"
        disabled={full}
        onClick={() => lab.update((s) => addServer(s, size))}
      >
        <Plus /> Server যোগ করো
      </Button>
      <span className="text-xs text-muted-foreground">
        {lab.state.servers.length}/{MAX_SERVERS} · Small 2, Medium 4, Large 8টা
        request একসাথে
      </span>
    </div>
  );
}

export function LbServerControls({ lab }: { lab: LoadBalancerLab }) {
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {lab.state.servers.map((server) => (
          <LbServerRow key={server.id} lab={lab} server={server} />
        ))}
      </ul>
      <AddServer lab={lab} />
    </div>
  );
}
