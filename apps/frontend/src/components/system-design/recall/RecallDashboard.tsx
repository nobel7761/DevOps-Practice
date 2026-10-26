"use client";

import Link from "next/link";
import { useState } from "react";
import Loader from "@/components/shared/Loader";
import { Button } from "@/components/shared/shadcn";
import TitledSection from "@/components/shared/TitledSection";
import { MetricTile } from "@/components/shared/simulator";
import {
  duePointsByTopic,
  localToday,
  recallStreak,
  topicRecallStatus,
  weakestTopics,
  type RecallRecord,
} from "@/lib/system-design/recall/schedule";
import { ReviewSession } from "./ReviewSession";
import { DueTopicList, WeakTopicList } from "./RecallTopicLists";
import { useRecallStore } from "./useRecallStore";

function strongTopicCount(records: RecallRecord[]) {
  const topics = new Set(records.map((r) => r.topicId));
  return [...topics].filter(
    (id) =>
      topicRecallStatus(records.filter((r) => r.topicId === id)) === "strong",
  ).length;
}

function DashboardHeader() {
  return (
    <header className="mb-6 flex flex-col gap-2">
      <Link
        href="/course/system-design-a-z"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← System Design A-Z
      </Link>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        🧠 আজকের Recall
      </h1>
    </header>
  );
}

/** "আজকের Recall" (Plan doc Section 5.1): what's due today by topic, the weakest topics, and the streak. */
export function RecallDashboard() {
  const store = useRecallStore();
  const [session, setSession] = useState<RecallRecord[] | null>(null);
  const today = localToday();
  const due = duePointsByTopic(store.records, today);
  const dueCount = due.reduce((sum, g) => sum + g.points.length, 0);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
      <DashboardHeader />
      {store.loading ? (
        <Loader size="md" />
      ) : session ? (
        <ReviewSession
          queue={session}
          onRate={(record, terms, rating) =>
            store.rate(record.topicId, record.term, terms, rating)
          }
          onDone={() => setSession(null)}
        />
      ) : (
        <div className="flex flex-col gap-8">
          {store.error && (
            <p className="text-sm text-destructive">{store.error}</p>
          )}
          <div className="grid grid-cols-3 gap-2">
            <MetricTile
              label="আজ review"
              value={`${dueCount}টা`}
              tone={dueCount > 0 ? "warning" : "good"}
            />
            <MetricTile
              label="Streak"
              value={`${recallStreak(store.reviewDates, today)} দিন`}
            />
            <MetricTile
              label="মজবুত 💪"
              value={`${strongTopicCount(store.records)}টা topic`}
            />
          </div>
          <TitledSection id="due" emoji="📅" title="আজ যা review করার কথা">
            {dueCount > 0 && (
              <Button
                className="mb-3"
                onClick={() => setSession(due.flatMap((g) => g.points))}
              >
                সব শুরু করুন ({dueCount}টা)
              </Button>
            )}
            <DueTopicList groups={due} onStart={setSession} />
          </TitledSection>
          <TitledSection id="weak" emoji="🔴" title="সবচেয়ে দুর্বল topic">
            <WeakTopicList topics={weakestTopics(store.records)} />
          </TitledSection>
        </div>
      )}
    </main>
  );
}
