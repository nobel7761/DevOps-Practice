import { BookOpenText, ListChecks, SquareTerminal } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/shared/shadcn";
import LabHeader from "@/components/modules/lab/LabHeader";
import LabInstructions from "@/components/modules/lab/LabInstructions";
import LabCommandsDrawer from "@/components/modules/lab/LabCommandsDrawer";
import LabCompanionPanel from "@/components/modules/lab/LabCompanionPanel";
import LabComingSoonPanel from "@/components/modules/lab/LabComingSoonPanel";
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
    <main className="mx-auto w-[95%] max-w-[1920px] py-8 sm:py-12">
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        {/* Left: original poridhi.io lab content, unmodified. */}
        <Card className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)]">
          <CardHeader className="shrink-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <LabHeader lab={lab} />
              <LabCommandsDrawer commands={commands} />
            </div>
          </CardHeader>
          <CardContent className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            <LabInstructions markdown={lab.markdown} />
          </CardContent>
        </Card>

        {/* Right: companion learning panel (golpo, quiz, terminal practice) — always visible, never scrolls away. */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)]">
          <div className="shrink-0">
            <h2 className="font-semibold">এই Lab শেখার সহায়ক উপকরণ</h2>
            <p className="text-sm text-muted-foreground">
              একই lab-এর বাংলা golpo-style ব্যাখ্যা, quiz, আর practice terminal।
            </p>
          </div>

          <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            {labExamSpec ? (
              <LabCompanionPanel
                labId={lab.id}
                labTitle={lab.title ?? "এই Lab"}
                commands={commands}
                labExamSpec={labExamSpec}
              />
            ) : (
              <div className="flex flex-col gap-4">
                <LabComingSoonPanel
                  icon={BookOpenText}
                  title="বাংলা Golpo Lesson"
                  description="এই lab-এর প্রতিটা ধাপ আর command গল্প আকারে, শুরু থেকে শেষ পর্যন্ত বাংলায় ব্যাখ্যা করা হবে এখানে।"
                />
                <LabComingSoonPanel
                  icon={ListChecks}
                  title="Quiz"
                  description="এই lab-এর command আর concept নিয়ে MCQ quiz — pass mark না পেলে lab complete ধরা হবে না।"
                />
                <LabComingSoonPanel
                  icon={SquareTerminal}
                  title="Practice Terminal"
                  description="এই lab-এর command গুলো সরাসরি এখানে বসে practice করার জন্য একটা simulated terminal, সাথে filesystem tree visualizer।"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
