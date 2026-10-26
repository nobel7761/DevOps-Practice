"use client";

import ModuleCommandsLink from "@/components/modules/ModuleCommandsLink";
import ModuleContentList from "@/components/modules/ModuleContentList";
import CourseModuleHeader from "@/components/modules/course-shell/CourseModuleHeader";
import { getModuleCommands } from "@/lib/data/commands";
import type { CourseModule } from "@/lib/data/course-modules";

/** The picked module: its header, then every content item, using the full width. */
export default function CourseModuleView({
  module,
  milestoneLabel,
}: {
  module: CourseModule;
  milestoneLabel: string;
}) {
  const hasCommands = getModuleCommands(module.id).length > 0;

  return (
    <div className="flex w-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-12">
      <CourseModuleHeader module={module} milestoneLabel={milestoneLabel} />
      {hasCommands && <ModuleCommandsLink moduleId={module.id} />}
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <ModuleContentList contents={module.contents} moduleId={module.id} />
      </section>
    </div>
  );
}
