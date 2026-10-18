import { describe, expect, it } from "vitest";
import { mergeNotesIntoCourse } from "./merge-notes";
import type { CourseSummary } from "./course-modules";

function makeCourse(
  contents: CourseSummary["milestones"][0]["modules"][0]["contents"],
): CourseSummary {
  return {
    courseTitle: "Test",
    milestones: [
      {
        id: "m1",
        title: "Milestone 1",
        modules: [
          {
            id: "mod1",
            title: "Module 1",
            contentCounts: {},
            progress: { completed: 0, total: contents.length, percentage: 0 },
            contents,
          },
        ],
      },
    ],
  };
}

describe("mergeNotesIntoCourse", () => {
  it("marks an item hasNote when its content id is in notedContentIds", () => {
    const course = makeCourse([
      {
        type: "udemy_lecture",
        title: "L1",
        completed: false,
        contentId: "lec-1",
      },
    ]);

    const result = mergeNotesIntoCourse(course, new Set(["lec-1"]));

    expect(result.milestones[0].modules[0].contents[0].hasNote).toBe(true);
  });

  it("leaves an item unchanged when its content id is not in notedContentIds", () => {
    const course = makeCourse([
      {
        type: "udemy_lecture",
        title: "L1",
        completed: false,
        contentId: "lec-1",
      },
    ]);

    const result = mergeNotesIntoCourse(course, new Set(["other-id"]));

    expect(result.milestones[0].modules[0].contents[0].hasNote).toBeUndefined();
  });

  it("does not throw for an item without a content id", () => {
    const course = makeCourse([
      { type: "lab", title: "Lab A", completed: false, labId: "lab-1" },
    ]);

    const result = mergeNotesIntoCourse(course, new Set(["lec-1"]));

    expect(result.milestones[0].modules[0].contents[0].hasNote).toBeUndefined();
  });
});
