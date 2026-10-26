import LessonSection from "@/components/system-design/lesson/LessonSection";
import { SdQuiz } from "@/components/system-design/quiz/SdQuiz";

/** Section 17 "❓ Quiz". */
export default function LessonQuiz({ topicId }: { topicId: string }) {
  return (
    <LessonSection section="quiz">
      <SdQuiz topicId={topicId} />
    </LessonSection>
  );
}
