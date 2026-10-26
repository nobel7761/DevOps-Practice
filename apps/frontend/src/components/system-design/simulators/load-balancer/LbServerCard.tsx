import { Server } from "lucide-react";
import {
  serverCpu,
  type LbServer,
} from "@/lib/system-design/sim/load-balancer/engine";
import { SERVER_HEIGHT, SERVER_WIDTH, SERVER_X } from "./lb-layout";

const SIZE_LETTER = { small: "S", medium: "M", large: "L" } as const;

function statusOf(server: LbServer): { label: string; color: string } {
  if (server.status === "down" && !server.inRotation)
    return { label: "বন্ধ · health check-এ বাদ", color: "var(--sd-fail)" };
  if (server.status === "down")
    return { label: "✕ বন্ধ", color: "var(--sd-fail)" };
  if (!server.inRotation)
    return { label: "rotation-এর বাইরে", color: "var(--sd-warn)" };
  if (server.status === "slow")
    return { label: "⚠ ধীর (×5)", color: "var(--sd-warn)" };
  return { label: "✓ সুস্থ", color: "var(--sd-ok)" };
}

const cpuColor = (cpu: number) =>
  cpu >= 85 ? "var(--sd-fail)" : cpu >= 60 ? "var(--sd-warn)" : "var(--sd-ok)";

/** One server: name, size, health, CPU bar and its running/queued requests. */
export function LbServerCard({
  server,
  y,
  showPool,
}: {
  server: LbServer;
  y: number;
  showPool: boolean;
}) {
  const cpu = serverCpu(server);
  const status = statusOf(server);
  const barWidth = SERVER_WIDTH - 24;

  return (
    <g opacity={server.status === "down" ? 0.75 : 1}>
      <rect
        x={SERVER_X}
        y={y}
        width={SERVER_WIDTH}
        height={SERVER_HEIGHT}
        rx={12}
        fill="var(--sd-server-soft)"
        stroke={
          server.status === "down" ? "var(--sd-fail)" : "var(--sd-server)"
        }
        strokeDasharray={server.status === "down" ? "6 4" : undefined}
        strokeWidth={1.5}
      />
      <Server
        x={SERVER_X + 10}
        y={y + 9}
        width={16}
        height={16}
        color="var(--sd-server)"
      />
      <text
        x={SERVER_X + 32}
        y={y + 18}
        dominantBaseline="central"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {server.name} · {SIZE_LETTER[server.size]}
        {showPool ? ` · ${server.pool}` : ""}
      </text>
      <text
        x={SERVER_X + 12}
        y={y + 38}
        dominantBaseline="central"
        fontSize={11}
        fill={status.color}
      >
        {status.label}
      </text>
      <rect
        x={SERVER_X + 12}
        y={y + 50}
        width={barWidth}
        height={8}
        rx={4}
        fill="var(--border)"
      />
      <rect
        x={SERVER_X + 12}
        y={y + 50}
        width={(barWidth * cpu) / 100}
        height={8}
        rx={4}
        fill={cpuColor(cpu)}
      />
      <text
        x={SERVER_X + 12}
        y={y + 69}
        dominantBaseline="central"
        fontSize={10}
        fill="var(--sd-label)"
      >
        CPU {Math.round(cpu)}% · {server.active.length} চলমান ·{" "}
        {server.queue.length} অপেক্ষায়
      </text>
    </g>
  );
}
