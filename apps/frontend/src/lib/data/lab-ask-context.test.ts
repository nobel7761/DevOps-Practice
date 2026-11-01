import { describe, expect, it } from "vitest";
import { getLabAskContext } from "./lab-ask-context";

describe("getLabAskContext", () => {
  it("returns the module id, sibling labs (excluding itself), and hasInterview for a known lab", () => {
    // "Linux User Modification" lives in the "Linux Fundamentals" module,
    // which has an AI interview and 9 sibling labs.
    const context = getLabAskContext("69b1d51f4a49372ba7883025");

    expect(context.moduleId).toBe("74b6214c-6880-4092-a870-0dd99de179b0");
    expect(context.hasInterview).toBe(true);

    const titles = context.labs.map((lab) => lab.title);
    expect(titles).not.toContain("LAB EXAM: Linux User Modification");
    expect(titles).toContain(
      "LAB EXAM: Mastering Linux File System Navigation",
    );
    expect(titles).toContain("LAB EXAM: Linux User and Group Management");
  });

  it("returns an empty, interview-less context for an unknown lab id", () => {
    const context = getLabAskContext("does-not-exist");

    expect(context).toEqual({ moduleId: null, labs: [], hasInterview: false });
  });
});
