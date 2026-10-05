import {
  Accordion,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/shadcn";
import MilestoneSection from "@/components/modules/MilestoneSection";
import { masteringAwsDevopsSeason4 } from "@/lib/data/course-modules";

export default function ModulesScreen() {
  const { courseTitle, milestones } = masteringAwsDevopsSeason4;

  return (
    <main className="container mx-auto max-w-4xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{courseTitle}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {milestones.length} milestones ·{" "}
            {milestones.reduce((sum, m) => sum + m.modules.length, 0)} modules
          </p>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {milestones.map((milestone) => (
              <MilestoneSection key={milestone.id} milestone={milestone} />
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </main>
  );
}
