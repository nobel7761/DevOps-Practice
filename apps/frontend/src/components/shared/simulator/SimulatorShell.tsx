import type { ReactNode } from "react";

/**
 * The common simulator layout (Plan doc Section 9.1 rule 1): header, controls,
 * visualization with live metrics beside it (below it when the simulator itself
 * is narrow, e.g. inside a lesson column — a container query, not a viewport one), the
 * "কী ঘটছে" log, challenges, and the "শিক্ষা" box last.
 */
export function SimulatorShell({
  header,
  controls,
  visualization,
  metrics,
  log,
  challenges,
  lesson,
}: {
  header: ReactNode;
  controls: ReactNode;
  visualization: ReactNode;
  metrics: ReactNode;
  log: ReactNode;
  challenges?: ReactNode;
  lesson: ReactNode;
}) {
  return (
    <div className="@container flex flex-col gap-4 rounded-2xl border border-border bg-card p-4">
      {header}
      {controls}
      <div className="grid gap-4 @4xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div
          className="min-w-0 overflow-x-auto rounded-xl border border-border"
          style={{ background: "var(--sd-canvas)" }}
        >
          {visualization}
        </div>
        <div className="flex flex-col gap-3">{metrics}</div>
      </div>
      <div className="grid gap-4 @2xl:grid-cols-2">
        {log}
        {challenges}
      </div>
      {lesson}
    </div>
  );
}
