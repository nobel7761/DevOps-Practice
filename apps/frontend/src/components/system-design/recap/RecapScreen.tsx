import ModuleBreadcrumb from "@/components/modules/ModuleBreadcrumb";
import TitledSection from "@/components/shared/TitledSection";
import { LinkedInPostCard } from "@/components/system-design/linkedin/LinkedInPostCard";
import type { WeeklyRecap } from "@/lib/data/system-design/recaps";

function RecapTopicList({ recap }: { recap: WeeklyRecap }) {
  return (
    <ol className="flex flex-col gap-2 text-sm">
      {recap.topics.map((topic) => (
        <li key={topic.day} className="rounded-lg border border-border p-3">
          <span className="font-semibold">
            Day {topic.day} · {topic.title}
          </span>
          <p className="text-muted-foreground">{topic.definition}</p>
        </li>
      ))}
    </ol>
  );
}

/** Weekly recap (Plan doc Section 8.2, type 5): the extra post plus its PDF carousel. */
export function RecapScreen({ recap }: { recap: WeeklyRecap }) {
  const lastDay = recap.topics.at(-1)?.day ?? recap.week * 7;
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
      <ModuleBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "System Design A-Z", href: "/course/system-design-a-z" },
          { label: `Week ${recap.week} recap` },
        ]}
      />
      <h1 className="mb-8 text-2xl font-bold tracking-tight sm:text-3xl">
        🗂️ Week {recap.week} Recap
      </h1>
      <div className="flex flex-col gap-10">
        <TitledSection id="post" emoji="📣" title="LinkedIn Post">
          <LinkedInPostCard
            post={recap.post}
            topicId={`sd-recap-week-${String(recap.week).padStart(2, "0")}`}
            day={lastDay}
            lessonPath="/course/system-design-a-z"
            image={{
              dayLabel: `Week ${recap.week}`,
              title: "Weekly Recap",
              definition: "",
            }}
            recap={{
              week: recap.week,
              topics: recap.topics,
              nextTopics: recap.nextTopics,
            }}
          />
        </TitledSection>
        <TitledSection
          id="topics"
          emoji="🧭"
          title="এই সপ্তাহের topic-গুলো (carousel-এর slide)"
        >
          <RecapTopicList recap={recap} />
        </TitledSection>
      </div>
    </main>
  );
}
