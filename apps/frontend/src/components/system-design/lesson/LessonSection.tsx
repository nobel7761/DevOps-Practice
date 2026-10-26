import type { ReactNode } from "react";
import TitledSection from "@/components/shared/TitledSection";
import {
  LESSON_SECTIONS,
  type LessonSectionKey,
} from "@/components/system-design/lesson/lesson-sections";

export default function LessonSection({
  section,
  children,
}: {
  section: LessonSectionKey;
  children: ReactNode;
}) {
  const { id, emoji, title } = LESSON_SECTIONS[section];
  return (
    <TitledSection id={id} emoji={emoji} title={title}>
      {children}
    </TitledSection>
  );
}
