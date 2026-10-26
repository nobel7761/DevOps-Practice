import { describe, expect, it } from "vitest";
import {
  addDays,
  applyRating,
  duePointsByTopic,
  isDue,
  localToday,
  pointColor,
  recallStreak,
  startRecall,
  topicRecallStatus,
  weakestTopics,
  type RecallRecord,
} from "./schedule";

const record = (overrides: Partial<RecallRecord> = {}): RecallRecord => ({
  topicId: "sd-day-012",
  term: "Dead Letter Queue",
  intervalIndex: 0,
  lastRating: null,
  nextDue: "2026-10-24",
  ...overrides,
});

describe("addDays", () => {
  it("adds calendar days across month and year ends", () => {
    expect(addDays("2026-10-30", 3)).toBe("2026-11-02");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
  });
});

describe("startRecall", () => {
  it("schedules every core point for its first review the day after the lesson", () => {
    const records = startRecall(
      "sd-day-012",
      ["Producer", "Broker"],
      "2026-10-23",
    );
    expect(records).toEqual([
      {
        topicId: "sd-day-012",
        term: "Producer",
        intervalIndex: 0,
        lastRating: null,
        nextDue: "2026-10-24",
      },
      {
        topicId: "sd-day-012",
        term: "Broker",
        intervalIndex: 0,
        lastRating: null,
        nextDue: "2026-10-24",
      },
    ]);
  });
});

describe("applyRating", () => {
  it("🟢 moves to the next step: 1 → 3 → 7 → 14 → 30 days", () => {
    let r = record();
    const gaps: number[] = [];
    let today = "2026-10-24";
    for (let i = 0; i < 5; i++) {
      r = applyRating(r, "good", today);
      gaps.push((Date.parse(r.nextDue) - Date.parse(today)) / 86_400_000);
      today = r.nextDue;
    }
    expect(gaps).toEqual([3, 7, 14, 30, 30]);
  });

  it("🟡 repeats the same gap", () => {
    const r = applyRating(
      record({ intervalIndex: 2 }),
      "partial",
      "2026-10-24",
    );
    expect(r).toMatchObject({
      intervalIndex: 2,
      lastRating: "partial",
      nextDue: "2026-10-31",
    });
  });

  it("🔴 goes back to 1 day", () => {
    const r = applyRating(record({ intervalIndex: 3 }), "forgot", "2026-10-24");
    expect(r).toMatchObject({
      intervalIndex: 0,
      lastRating: "forgot",
      nextDue: "2026-10-25",
    });
  });
});

describe("isDue / duePointsByTopic", () => {
  it("a point is due on or after its date", () => {
    expect(isDue(record({ nextDue: "2026-10-24" }), "2026-10-24")).toBe(true);
    expect(isDue(record({ nextDue: "2026-10-20" }), "2026-10-24")).toBe(true);
    expect(isDue(record({ nextDue: "2026-10-25" }), "2026-10-24")).toBe(false);
  });

  it("groups today's due points by topic, in day order", () => {
    const records = [
      record({ topicId: "sd-day-017", term: "LRU" }),
      record({ topicId: "sd-day-012", term: "Broker" }),
      record({ topicId: "sd-day-012", term: "DLQ", nextDue: "2026-11-01" }),
      record({ topicId: "sd-day-012", term: "Ack" }),
    ];
    expect(duePointsByTopic(records, "2026-10-24")).toEqual([
      { topicId: "sd-day-012", points: [records[1], records[3]] },
      { topicId: "sd-day-017", points: [records[0]] },
    ]);
  });
});

describe("topicRecallStatus", () => {
  it("is not started with no records", () => {
    expect(topicRecallStatus([])).toBe("not-started");
  });

  it("is strong 💪 once every point has reached the 7-day step or beyond", () => {
    expect(
      topicRecallStatus([
        record({ intervalIndex: 2 }),
        record({ intervalIndex: 4 }),
      ]),
    ).toBe("strong");
  });

  it("is in progress while any point is below the 7-day step", () => {
    expect(
      topicRecallStatus([
        record({ intervalIndex: 2 }),
        record({ intervalIndex: 1 }),
      ]),
    ).toBe("in-progress");
  });
});

describe("pointColor", () => {
  it("colours a mind-map point by its last rating, grey if never reviewed", () => {
    expect(pointColor(record({ lastRating: "good" }))).toBe("green");
    expect(pointColor(record({ lastRating: "partial" }))).toBe("yellow");
    expect(pointColor(record({ lastRating: "forgot" }))).toBe("red");
    expect(pointColor(record({ lastRating: null }))).toBe("gray");
    expect(pointColor(undefined)).toBe("gray");
  });
});

describe("recallStreak", () => {
  it("counts consecutive review days ending today", () => {
    expect(
      recallStreak(["2026-10-22", "2026-10-23", "2026-10-24"], "2026-10-24"),
    ).toBe(3);
  });

  it("keeps yesterday's streak alive until today is over", () => {
    expect(recallStreak(["2026-10-22", "2026-10-23"], "2026-10-24")).toBe(2);
  });

  it("breaks on a missed day and ignores duplicates", () => {
    expect(
      recallStreak(
        ["2026-10-20", "2026-10-23", "2026-10-24", "2026-10-24"],
        "2026-10-24",
      ),
    ).toBe(2);
    expect(recallStreak(["2026-10-20"], "2026-10-24")).toBe(0);
  });
});

describe("weakestTopics", () => {
  it("lists topics by how many points were last rated 🔴, most first", () => {
    const records = [
      record({ topicId: "a", lastRating: "forgot" }),
      record({ topicId: "b", lastRating: "forgot" }),
      record({ topicId: "b", term: "x", lastRating: "forgot" }),
      record({ topicId: "c", lastRating: "good" }),
    ];
    expect(weakestTopics(records)).toEqual([
      { topicId: "b", forgotten: 2 },
      { topicId: "a", forgotten: 1 },
    ]);
  });
});

describe("localToday", () => {
  it("formats the local calendar date, not UTC", () => {
    expect(localToday(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
  });
});
