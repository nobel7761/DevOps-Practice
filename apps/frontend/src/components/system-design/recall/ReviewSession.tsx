"use client";

import { useState } from "react";
import { Button, Progress } from "@/components/shared/shadcn";
import { findSystemDesignTopic } from "@/lib/data/courses/system-design-a-z";
import { getRecallContent } from "@/lib/data/system-design/recall-content";
import type {
  RecallRating,
  RecallRecord,
} from "@/lib/system-design/recall/schedule";
import { RecallPointCard } from "./RecallPointCard";

/**
 * Review mode: one due point at a time. The answer stays hidden until "উত্তর দেখুন",
 * because rating without checking can't tell "I think I know" from "I know".
 */
export function ReviewSession({
  queue,
  onRate,
  onDone,
}: {
  queue: RecallRecord[];
  onRate: (
    record: RecallRecord,
    allTerms: string[],
    rating: RecallRating,
  ) => void;
  onDone: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const current = queue[index];

  if (!current) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-border p-4">
        <p className="font-semibold">আজকের review শেষ 🎉</p>
        <Button variant="outline" onClick={onDone}>
          Dashboard-এ ফিরুন
        </Button>
      </div>
    );
  }

  const content = getRecallContent(current.topicId);
  const point = content?.points.find((p) => p.term === current.term);
  const topic = findSystemDesignTopic(current.topicId);
  const next = () => {
    setRevealed(false);
    setIndex((i) => i + 1);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="tabular-nums">
          {index + 1}/{queue.length}
        </span>
        <Progress
          value={(index / queue.length) * 100}
          className="h-1.5 flex-1"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Day {topic?.day} · {topic?.title}
      </p>
      <div className="rounded-xl border border-border p-6 text-center">
        <p className="text-xl font-bold">{current.term}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          মনে মনে বা জোরে ব্যাখ্যা করুন, তারপর মিলিয়ে দেখুন।
        </p>
      </div>
      {!point ? (
        <Button variant="outline" className="w-fit" onClick={next}>
          এই point-এর লেখা পাওয়া যায়নি, পরেরটা
        </Button>
      ) : revealed ? (
        <RecallPointCard
          point={point}
          lastRating={null}
          lessonHref={topic?.href}
          onRate={(rating) => {
            onRate(
              current,
              content!.points.map((p) => p.term),
              rating,
            );
            next();
          }}
        />
      ) : (
        <Button className="w-fit" onClick={() => setRevealed(true)}>
          উত্তর দেখুন
        </Button>
      )}
    </div>
  );
}
