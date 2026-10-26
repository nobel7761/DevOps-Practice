import ModuleBreadcrumb from "@/components/modules/ModuleBreadcrumb";
import { LessonNav } from "@/components/system-design/lesson/LessonNav";
import LessonScreen from "@/components/system-design/lesson/LessonScreen";
import { SdShell } from "@/components/system-design/shell/SdShell";
import { findSystemDesignTopic } from "@/lib/data/courses/system-design-a-z";
import type { LessonBundle } from "@/lib/data/system-design/lessons";

/** A written lesson's page: breadcrumb back to the course, then the full lesson template. */
export function LessonPageScreen({ bundle }: { bundle: LessonBundle }) {
  const { lesson, recall, post } = bundle;
  const topic = findSystemDesignTopic(lesson.topicId);

  return (
    <SdShell currentTopicId={lesson.topicId}>
      <div className="w-full px-4 pt-6 sm:px-8 lg:px-12">
        <ModuleBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "System Design A-Z", href: "/course/system-design-a-z" },
            { label: `Day ${lesson.day}`, href: topic?.href },
            { label: lesson.title },
          ]}
        />
        <LessonScreen lesson={lesson} recall={recall} post={post} />
        <LessonNav topicId={lesson.topicId} />
      </div>
    </SdShell>
  );
}
