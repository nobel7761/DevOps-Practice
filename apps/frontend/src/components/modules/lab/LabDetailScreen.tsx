import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/shared/shadcn";
import LabHeader from "@/components/modules/lab/LabHeader";
import LabInstructions from "@/components/modules/lab/LabInstructions";
import LabCommandsDrawer from "@/components/modules/lab/LabCommandsDrawer";
import ModuleBreadcrumb from "@/components/modules/ModuleBreadcrumb";
import { getLabCommands } from "@/lib/data/commands";
import type { CourseMilestone, CourseModule } from "@/lib/data/course-modules";
import type { LabContent } from "@/lib/data/lab-content";

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

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
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
      <Card>
        <CardHeader>
          <LabHeader lab={lab} />
          <CardAction>
            <LabCommandsDrawer commands={commands} />
          </CardAction>
        </CardHeader>
        <CardContent>
          <LabInstructions markdown={lab.markdown} />
        </CardContent>
      </Card>
    </main>
  );
}
