import { Gamepad2, type LucideIcon } from "lucide-react";
import LabComingSoonPanel from "@/components/modules/lab/LabComingSoonPanel";
import LessonSection from "@/components/system-design/lesson/LessonSection";
import type { LessonSectionKey } from "@/components/system-design/lesson/lesson-sections";

// Stand-in for sections whose engines land in later milestones
// (simulator: M2, recall + quiz: M3, LinkedIn post: M4).
export default function LessonComingSoon({
  section,
  title,
  description,
  icon = Gamepad2,
}: {
  section: LessonSectionKey;
  title: string;
  description: string;
  icon?: LucideIcon;
}) {
  return (
    <LessonSection section={section}>
      <LabComingSoonPanel icon={icon} title={title} description={description} />
    </LessonSection>
  );
}
