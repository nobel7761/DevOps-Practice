import { describe, expect, it } from "vitest";
import { collectNotableContentIds } from "./collect-content-ids";
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

describe("collectNotableContentIds", () => {
  it("collects the content id of every item that has one", () => {
    const course = makeCourse([
      {
        type: "udemy_lecture",
        title: "L1",
        completed: false,
        contentId: "lec-1",
      },
      { type: "live_class", title: "V1", completed: false, contentId: "vid-1" },
    ]);

    expect(collectNotableContentIds(course)).toEqual(["lec-1", "vid-1"]);
  });

  it("skips items without a content id", () => {
    const course = makeCourse([
      { type: "lab", title: "Lab A", completed: false, labId: "lab-1" },
    ]);

    expect(collectNotableContentIds(course)).toEqual([]);
  });

  it("de-duplicates repeated content ids across modules", () => {
    const course: CourseSummary = {
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
              progress: { completed: 0, total: 1, percentage: 0 },
              contents: [
                {
                  type: "udemy_lecture",
                  title: "L1",
                  completed: false,
                  contentId: "lec-1",
                },
              ],
            },
            {
              id: "mod2",
              title: "Module 2",
              contentCounts: {},
              progress: { completed: 0, total: 1, percentage: 0 },
              contents: [
                {
                  type: "udemy_lecture",
                  title: "L1 dup",
                  completed: false,
                  contentId: "lec-1",
                },
              ],
            },
          ],
        },
      ],
    };

    expect(collectNotableContentIds(course)).toEqual(["lec-1"]);
  });
});
