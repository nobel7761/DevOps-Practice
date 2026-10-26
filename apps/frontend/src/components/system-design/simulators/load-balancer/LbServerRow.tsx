"use client";

import { Trash2 } from "lucide-react";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/shadcn";
import {
  MIN_SERVERS,
  removeServer,
  setServerPool,
  setServerSize,
  setServerStatus,
  type LbServer,
  type ServerSize,
} from "@/lib/system-design/sim/load-balancer/engine";
import type { LoadBalancerLab } from "./useLoadBalancerLab";

export const SIZE_OPTIONS: { value: ServerSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

export const POOLS = ["default", "video", "images"];

function SmallSelect<V extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: V;
  options: { value: V; label: string }[];
  onChange: (v: V) => void;
  label: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as V)}>
      <SelectTrigger size="sm" aria-label={label} className="w-24">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Size, pool (L7), and break / slow down / restart buttons for one server. */
export function LbServerRow({
  lab,
  server,
}: {
  lab: LoadBalancerLab;
  server: LbServer;
}) {
  const { id } = server;
  const canRemove = lab.state.servers.length > MIN_SERVERS;

  return (
    <li className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2 text-sm">
      <span className="w-16 font-medium">{server.name}</span>
      <SmallSelect
        label="Size"
        value={server.size}
        options={SIZE_OPTIONS}
        onChange={(size) => lab.update((s) => setServerSize(s, id, size))}
      />
      {lab.state.config.mode === "L7" && (
        <SmallSelect
          label="Pool"
          value={server.pool}
          options={POOLS.map((p) => ({ value: p, label: p }))}
          onChange={(pool) => lab.update((s) => setServerPool(s, id, pool))}
        />
      )}
      <div className="ml-auto flex flex-wrap gap-1">
        <Button
          size="xs"
          variant="outline"
          disabled={server.status === "down"}
          onClick={() => lab.update((s) => setServerStatus(s, id, "down"))}
        >
          বন্ধ করো
        </Button>
        <Button
          size="xs"
          variant="outline"
          disabled={server.status !== "healthy"}
          onClick={() => lab.update((s) => setServerStatus(s, id, "slow"))}
        >
          ধীর করো
        </Button>
        <Button
          size="xs"
          variant="outline"
          disabled={server.status === "healthy"}
          onClick={() => lab.update((s) => setServerStatus(s, id, "healthy"))}
        >
          চালু করো
        </Button>
        <Button
          size="icon-xs"
          variant="ghost"
          aria-label={`${server.name} বাদ দিন`}
          disabled={!canRemove}
          onClick={() => lab.update((s) => removeServer(s, id))}
        >
          <Trash2 />
        </Button>
      </div>
    </li>
  );
}
