import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Progress,
} from "@/components/shared/shadcn";
import ModuleContentBadges from "@/components/modules/ModuleContentBadges";
import ModuleContentList from "@/components/modules/ModuleContentList";
import type { CourseModule } from "@/lib/data/course-modules";

export default function ModuleRow({ module }: { module: CourseModule }) {
  const total = module.contents.length;
  const completed = module.contents.filter((item) => item.completed).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <li className="rounded-lg border border-border p-4">
      <Collapsible>
        <CollapsibleTrigger className="flex w-full flex-col gap-2 text-left">
          <div className="flex items-center justify-between gap-4">
            <h4 className="text-sm font-medium">{module.title}</h4>
            <span className="shrink-0 text-xs text-muted-foreground">
              {completed}/{total} done
            </span>
          </div>
          <ModuleContentBadges contents={module.contents} />
          <Progress value={percentage} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 border-t border-border pt-3">
          <ModuleContentList contents={module.contents} />
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}
