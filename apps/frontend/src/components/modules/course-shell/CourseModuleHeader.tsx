import { Progress } from "@/components/shared/shadcn";
import ModuleContentBadges from "@/components/modules/ModuleContentBadges";
import ModuleTagBadges from "@/components/modules/ModuleTagBadges";
import type { CourseModule } from "@/lib/data/course-modules";

/** Title block of the module view: where it sits, its tags, content mix and progress. */
export default function CourseModuleHeader({
  module,
  milestoneLabel,
}: {
  module: CourseModule;
  milestoneLabel: string;
}) {
  const total = module.contents.length;
  const completed = module.contents.filter((item) => item.completed).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <header className="flex flex-col gap-3">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {milestoneLabel}
      </p>
      <h1 className="text-2xl font-bold tracking-tight">{module.title}</h1>
      <ModuleTagBadges tags={module.tags} />
      <ModuleContentBadges contents={module.contents} />
      <div className="flex items-center gap-3">
        <Progress value={percentage} className="h-1.5 max-w-md" />
        <span className="shrink-0 text-xs font-medium text-muted-foreground">
          {completed}/{total} completed
        </span>
      </div>
    </header>
  );
}
