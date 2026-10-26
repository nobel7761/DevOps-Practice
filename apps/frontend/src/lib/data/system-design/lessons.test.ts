import { describe, expect, it } from "vitest";
import { LESSONS } from "./lessons";
import { WRITTEN_TOPIC_IDS } from "./written-topics";

describe("written lessons", () => {
  it("lists exactly the lessons that exist, so the course links every lesson and nothing else", () => {
    expect([...WRITTEN_TOPIC_IDS].sort()).toEqual(Object.keys(LESSONS).sort());
  });

  it("files every lesson under its own topic id", () => {
    for (const [topicId, bundle] of Object.entries(LESSONS)) {
      expect(bundle.lesson.topicId).toBe(topicId);
      if (bundle.recall) expect(bundle.recall.topicId).toBe(topicId);
    }
  });
});
