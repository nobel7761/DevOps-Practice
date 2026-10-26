"use client";

import { useCallback, useEffect, useState } from "react";
import client from "@/lib/api/client";
import {
  applyRating,
  localToday,
  startRecall,
  type RecallRating,
  type RecallRecord,
} from "@/lib/system-design/recall/schedule";

interface RecallResponse {
  points: RecallRecord[];
  reviewDates: string[];
}

/** Loads every saved Recall Map point and saves ratings back to the backend (/sd-recall). */
export function useRecallStore() {
  const [records, setRecords] = useState<RecallRecord[]>([]);
  const [reviewDates, setReviewDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    client
      .get<RecallResponse>("/sd-recall")
      .then((res) => {
        if (cancelled) return;
        setRecords(res.data.points);
        setReviewDates(res.data.reviewDates);
      })
      .catch(
        () =>
          !cancelled &&
          setError("Recall-এর তথ্য load করা যায়নি। Backend চালু আছে তো?"),
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  /** Starts a topic's schedule (first review tomorrow). Points already scheduled are left alone. */
  const start = useCallback(
    async (topicId: string, terms: string[]) => {
      const today = localToday();
      const known = new Set(
        records.filter((r) => r.topicId === topicId).map((r) => r.term),
      );
      const fresh = startRecall(
        topicId,
        terms.filter((t) => !known.has(t)),
        today,
      );
      if (fresh.length === 0) return;
      setRecords((current) => [...current, ...fresh]);
      await client
        .post("/sd-recall/start", { points: fresh })
        .catch(() => setError("Recall শুরু save করা যায়নি।"));
    },
    [records],
  );

  /** Self-rating after checking the answer. Rating a point of an unstarted topic starts that topic too. */
  const rate = useCallback(
    async (
      topicId: string,
      term: string,
      allTerms: string[],
      rating: RecallRating,
    ) => {
      const today = localToday();
      const existing = records.find(
        (r) => r.topicId === topicId && r.term === term,
      );
      if (!existing) await start(topicId, allTerms);
      const base = existing ?? startRecall(topicId, [term], today)[0];
      const updated = applyRating(base, rating, today);
      setRecords((current) => [
        ...current.filter((r) => !(r.topicId === topicId && r.term === term)),
        updated,
      ]);
      setReviewDates((dates) =>
        dates.includes(today) ? dates : [...dates, today],
      );
      await client
        .post("/sd-recall/review", { point: updated, date: today })
        .catch(() => setError("Rating save করা যায়নি।"));
    },
    [records, start],
  );

  return { records, reviewDates, loading, error, start, rate };
}

export type RecallStore = ReturnType<typeof useRecallStore>;
