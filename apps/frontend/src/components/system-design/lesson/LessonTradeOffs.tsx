import LessonComparisonTable from "@/components/system-design/lesson/LessonComparisonTable";
import LessonProse from "@/components/system-design/lesson/LessonProse";
import LessonSection from "@/components/system-design/lesson/LessonSection";
import type { SdLesson } from "@/lib/system-design/lesson.types";

export default function LessonTradeOffs({
  tradeOffs,
}: {
  tradeOffs: SdLesson["tradeOffs"];
}) {
  return (
    <LessonSection section="tradeOffs">
      <LessonProse content={tradeOffs} />
      <LessonComparisonTable table={tradeOffs.table} />
    </LessonSection>
  );
}
