import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/shared/shadcn";
import LabHeader from "@/components/modules/lab/LabHeader";
import LabInstructions from "@/components/modules/lab/LabInstructions";
import LabCommandsDrawer from "@/components/modules/lab/LabCommandsDrawer";
import LabCompanionDrawer from "@/components/modules/lab/LabCompanionDrawer";
import ModuleBreadcrumb from "@/components/modules/ModuleBreadcrumb";
import { getLabCommands } from "@/lib/data/commands";
import type { CourseMilestone, CourseModule } from "@/lib/data/course-modules";
import type { LabContent } from "@/lib/data/lab-content";
import { getLabExamSpec } from "@/lib/lab-exam/loader";

export default function LabDetailScreen({
  lab,
  milestone,
  module,
}: {
  lab: LabContent;
  milestone: CourseMilestone;
  module: CourseModule;
}) {
  const commands = getLabCommands(lab.id);
  const labExamSpec = getLabExamSpec(lab.id);

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-8 sm:py-12">
      <ModuleBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: milestone.title, href: `/?milestone=${milestone.id}` },
          {
            label: module.title,
            href: `/?milestone=${milestone.id}&module=${module.id}`,
          },
          { label: lab.title ?? "Lab" },
        ]}
      />
      {/* Original poridhi.io lab content, unmodified, now full width. */}
      <Card>
        <CardHeader>
          <LabHeader lab={lab} />
          <CardAction>
            <div className="flex flex-col items-end gap-2">
              <LabCommandsDrawer commands={commands} />
              <LabCompanionDrawer
                labId={lab.id}
                labTitle={lab.title ?? "এই Lab"}
                commands={commands}
                labExamSpec={labExamSpec}
              />
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          <LabInstructions markdown={lab.markdown} />
        </CardContent>
      </Card>
    </main>
  );
}
