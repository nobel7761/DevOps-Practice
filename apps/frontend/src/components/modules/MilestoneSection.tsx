import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/shared/shadcn";
import ModuleRow from "@/components/modules/ModuleRow";
import type { CourseMilestone } from "@/lib/data/course-modules";

export default function MilestoneSection({
  milestone,
  defaultModuleId,
}: {
  milestone: CourseMilestone;
  defaultModuleId?: string;
}) {
  return (
    <AccordionItem value={milestone.id}>
      <AccordionTrigger>
        <div className="flex items-baseline gap-3">
          <span className="font-semibold">{milestone.title}</span>
          <span className="text-xs text-muted-foreground">
            {milestone.modules.length} modules
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <ul className="flex flex-col gap-3">
          {milestone.modules.map((module) => (
            <ModuleRow
              key={module.id}
              module={module}
              defaultOpen={module.id === defaultModuleId}
            />
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
}
