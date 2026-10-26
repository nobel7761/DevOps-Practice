import {
  ArchitectureDiagram,
  DiagramFigure,
} from "@/components/shared/diagram";
import TitledSection from "@/components/shared/TitledSection";
import { LinkedInPostCard } from "@/components/system-design/linkedin/LinkedInPostCard";
import {
  sampleEdges,
  sampleNodes,
  sampleRecapTopics,
} from "@/components/showcase/diagrams/sample-architecture";
import {
  samplePollPost,
  sampleRecapPost,
  sampleStoryPost,
} from "@/components/showcase/linkedin/sample-posts";

const image = {
  dayLabel: "Day 0",
  title: "Template Preview",
  definition: "এক লাইনের placeholder সংজ্ঞা।",
};

export function LinkedInPostShowcase() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10">
      <DiagramFigure
        diagramId="day-0-main"
        caption="Post-এর ছবি এই diagram থেকে হবে"
        alt="Placeholder architecture diagram"
        minWidth={640}
      >
        <ArchitectureDiagram nodes={sampleNodes} edges={sampleEdges} />
      </DiagramFigure>
      <TitledSection id="story" emoji="📖" title="গল্প post">
        <LinkedInPostCard
          post={sampleStoryPost}
          topicId="sd-day-000"
          day={0}
          lessonPath="/showcase/lesson-template"
          image={image}
        />
      </TitledSection>
      <TitledSection id="poll" emoji="📊" title="Poll post">
        {/* A fake id past Day 12, so the "Post করেছি" tick is live without touching a real topic. */}
        <LinkedInPostCard
          post={samplePollPost}
          topicId="sd-day-901"
          day={13}
          lessonPath="/showcase/lesson-template"
          image={image}
        />
      </TitledSection>
      <TitledSection id="recap" emoji="🗂️" title="Weekly recap post">
        <LinkedInPostCard
          post={sampleRecapPost}
          topicId="sd-day-000"
          day={0}
          lessonPath="/course/system-design-a-z"
          image={image}
          recap={{
            week: 1,
            topics: sampleRecapTopics,
            nextTopics: ["Topic 8", "Topic 9", "Topic 10"],
          }}
        />
      </TitledSection>
    </div>
  );
}
