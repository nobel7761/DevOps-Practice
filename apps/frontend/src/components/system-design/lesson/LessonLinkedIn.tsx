import { Megaphone } from "lucide-react";
import LessonComingSoon from "@/components/system-design/lesson/LessonComingSoon";
import LessonSection from "@/components/system-design/lesson/LessonSection";
import { LinkedInPostCard } from "@/components/system-design/linkedin/LinkedInPostCard";
import { findSystemDesignTopic } from "@/lib/data/courses/system-design-a-z";
import type { SdLesson } from "@/lib/system-design/lesson.types";
import type { LinkedInPost } from "@/lib/system-design/validate-topic";

/** Section 18 "📣 LinkedIn Post". The post comes from the topic's linkedin.json. */
export default function LessonLinkedIn({
  lesson,
  post,
}: {
  lesson: SdLesson;
  post?: LinkedInPost;
}) {
  if (!post) {
    return (
      <LessonComingSoon
        section="linkedin"
        icon={Megaphone}
        title="LinkedIn Post"
        description="এই topic-এর post এখনো লেখা হয়নি।"
      />
    );
  }
  return (
    <LessonSection section="linkedin">
      <LinkedInPostCard
        post={post}
        topicId={lesson.topicId}
        day={lesson.day}
        lessonPath={
          findSystemDesignTopic(lesson.topicId)?.href ??
          "/course/system-design-a-z"
        }
        image={{
          dayLabel: `Day ${lesson.day}`,
          title: lesson.title,
          definition: lesson.definition,
        }}
      />
    </LessonSection>
  );
}
