"use client";

import { useState } from "react";
import MilestoneIcon from "@/components/modules/MilestoneIcon";
import ModuleRow from "@/components/modules/ModuleRow";
import type { CourseMilestone } from "@/lib/data/course-modules";

export default function MilestoneTabsSection({
  milestones,
  defaultMilestoneId,
  defaultModuleId,
}: {
  milestones: CourseMilestone[];
  defaultMilestoneId?: string;
  defaultModuleId?: string;
}) {
  const [activeId, setActiveId] = useState(
    defaultMilestoneId ?? milestones[0]?.id,
  );
  const active =
    milestones.find((milestone) => milestone.id === activeId) ?? milestones[0];

  return (
    <div>
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {milestones.map((milestone, index) => {
          const contents = milestone.modules.flatMap(
            (module) => module.contents,
          );
          const completed = contents.filter((item) => item.completed).length;
          const percent = contents.length
            ? Math.round((completed / contents.length) * 100)
            : 0;
          const isActive = milestone.id === active?.id;

          return (
            <button
              key={milestone.id}
              type="button"
              onClick={() => setActiveId(milestone.id)}
              className={`flex shrink-0 items-center gap-2.5 rounded-xl border px-4 py-3 text-left transition-colors ${
                isActive
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary"
                }`}
              >
                <MilestoneIcon title={milestone.title} className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                  Milestone {index + 1} · {percent}%
                </p>
                <p className="max-w-44 truncate text-sm font-semibold">
                  {milestone.title}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {active && (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {active.modules.map((module) => (
            <ModuleRow
              key={module.id}
              module={module}
              defaultOpen={module.id === defaultModuleId}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
