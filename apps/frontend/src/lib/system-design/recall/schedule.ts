// Recall Map spaced repetition (Plan doc Section 5.1). Every core point has
// its own schedule: first review the day after the lesson, 🟢 steps through
// 1 → 3 → 7 → 14 → 30 days, 🟡 repeats the gap, 🔴 drops back to 1 day.
// Dates are local calendar days as "YYYY-MM-DD".

export const REVIEW_INTERVALS = [1, 3, 7, 14, 30] as const;
/** A topic is "মজবুত 💪" once every point has reached this step (7 days) or beyond. */
const STRONG_INTERVAL_INDEX = 2;

export type RecallRating = "good" | "partial" | "forgot";
export type RecallTopicStatus = "not-started" | "in-progress" | "strong";
export type RecallColor = "green" | "yellow" | "red" | "gray";

export interface RecallRecord {
  topicId: string;
  term: string;
  /** Index into REVIEW_INTERVALS of the current gap. */
  intervalIndex: number;
  lastRating: RecallRating | null;
  nextDue: string;
}

const MS_PER_DAY = 86_400_000;

/** Calendar arithmetic in UTC so daylight-saving changes never shift a day. */
export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) + days * MS_PER_DAY)
    .toISOString()
    .slice(0, 10);
}

/** Today's local date as "YYYY-MM-DD". */
export function localToday(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function startRecall(
  topicId: string,
  terms: string[],
  completedOn: string,
): RecallRecord[] {
  return terms.map((term) => ({
    topicId,
    term,
    intervalIndex: 0,
    lastRating: null,
    nextDue: addDays(completedOn, REVIEW_INTERVALS[0]),
  }));
}

export function applyRating(
  record: RecallRecord,
  rating: RecallRating,
  today: string,
): RecallRecord {
  const last = REVIEW_INTERVALS.length - 1;
  const intervalIndex =
    rating === "good"
      ? Math.min(record.intervalIndex + 1, last)
      : rating === "partial"
        ? record.intervalIndex
        : 0;
  return {
    ...record,
    intervalIndex,
    lastRating: rating,
    nextDue: addDays(today, REVIEW_INTERVALS[intervalIndex]),
  };
}

export const isDue = (record: RecallRecord, today: string) =>
  record.nextDue <= today;

/** Today's due points, grouped by topic in topic-id (= day) order. */
export function duePointsByTopic(records: RecallRecord[], today: string) {
  const groups = new Map<string, RecallRecord[]>();
  for (const record of records) {
    if (!isDue(record, today)) continue;
    groups.set(record.topicId, [...(groups.get(record.topicId) ?? []), record]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([topicId, points]) => ({ topicId, points }));
}

export function topicRecallStatus(records: RecallRecord[]): RecallTopicStatus {
  if (records.length === 0) return "not-started";
  return records.every((r) => r.intervalIndex >= STRONG_INTERVAL_INDEX)
    ? "strong"
    : "in-progress";
}

const RATING_COLOR: Record<RecallRating, RecallColor> = {
  good: "green",
  partial: "yellow",
  forgot: "red",
};

export const pointColor = (record: RecallRecord | undefined): RecallColor =>
  record?.lastRating ? RATING_COLOR[record.lastRating] : "gray";

/** Consecutive days with at least one review, ending today — or yesterday, since today isn't over yet. */
export function recallStreak(reviewDates: string[], today: string): number {
  const days = new Set(reviewDates);
  let day = days.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (days.has(day)) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

/** Topics with points last rated 🔴, most first. */
export function weakestTopics(records: RecallRecord[]) {
  const counts = new Map<string, number>();
  for (const record of records) {
    if (record.lastRating === "forgot")
      counts.set(record.topicId, (counts.get(record.topicId) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([topicId, forgotten]) => ({ topicId, forgotten }))
    .sort(
      (a, b) => b.forgotten - a.forgotten || a.topicId.localeCompare(b.topicId),
    );
}
