// Weekly recap carousel (Plan doc Section 6.4): cover, one slide per topic of
// the week, then a "পরের সপ্তাহে কী আসছে" slide.

const DAYS_PER_WEEK = 7;

export interface RecapTopic {
  day: number;
  title: string;
  definition: string;
}

export type RecapSlide =
  | { kind: "cover"; week: number; firstDay: number; lastDay: number }
  | ({ kind: "topic" } & RecapTopic)
  | { kind: "next"; topics: string[] };

export function buildRecapSlides({
  week,
  topics,
  nextTopics,
}: {
  week: number;
  topics: RecapTopic[];
  nextTopics: string[];
}): RecapSlide[] {
  const ordered = [...topics].sort((a, b) => a.day - b.day);
  return [
    {
      kind: "cover",
      week,
      firstDay: ordered[0]?.day ?? 0,
      lastDay: ordered.at(-1)?.day ?? 0,
    },
    ...ordered.map((topic) => ({ kind: "topic" as const, ...topic })),
    { kind: "next", topics: nextTopics },
  ];
}

export const weekOfDay = (day: number) => Math.ceil(day / DAYS_PER_WEEK);

export const isRecapDay = (day: number) => day % DAYS_PER_WEEK === 0;
