import { ShowcaseShell } from "@/components/showcase/ShowcaseShell";
import LessonScreen from "@/components/system-design/lesson/LessonScreen";
import {
  lessonTemplateSample,
  recallTemplateSample,
} from "@/components/showcase/lesson-template-sample";
import { sampleStoryPost } from "@/components/showcase/linkedin/sample-posts";

export default function LessonTemplatePage() {
  return (
    <ShowcaseShell
      title="System Design lesson template"
      description="All 18 lesson sections (Plan doc Section 5) rendered with placeholder data."
    >
      <LessonScreen
        lesson={lessonTemplateSample}
        recall={recallTemplateSample}
        post={sampleStoryPost}
      />
    </ShowcaseShell>
  );
}
