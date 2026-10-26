"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface MetricPoint {
  /** Simulation time in seconds. */
  t: number;
  value: number;
}

/**
 * Single-series "how is this changing over time" chart (e.g. p99 latency).
 * One series, so the title names it and there's no legend; hover shows the value.
 */
export function MetricLineChart({
  title,
  unit,
  points,
}: {
  title: string;
  unit: string;
  points: MetricPoint[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{title}</span>
      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={points}
            margin={{ top: 4, right: 8, bottom: 0, left: -16 }}
          >
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="t"
              tickFormatter={(t: number) => `${t}s`}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              stroke="var(--border)"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              stroke="var(--border)"
            />
            <Tooltip
              formatter={(value) => [`${value} ${unit}`, title]}
              labelFormatter={(t) => `${t}s`}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--popover-foreground)",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
