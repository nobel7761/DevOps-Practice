import { describe, expect, it } from "vitest";
import {
  findModuleLocation,
  findLabLocation,
  findContentLocation,
} from "./course-modules";

// "Your First Agentic Workflow" — a real module id in
// forwardDeployedEngineeringCourse (lib/data/courses/forward-deployed-engineering.ts),
// a course distinct from masteringAwsDevopsSeason4.
const FDE_MODULE_ID = "e641fad2-5581-49cd-b1f3-1113d2b1e98a";

// "Linux Fundamentals" — a real module id in masteringAwsDevopsSeason4, used
// to prove the devops-season-4 lookup still works after generalizing the
// search to span multiple courses.
const DEVOPS_MODULE_ID = "74b6214c-6880-4092-a870-0dd99de179b0";

describe("findModuleLocation", () => {
  it("finds a module belonging to a non-devops-season-4 course and tags it with that course's registry id", () => {
    const location = findModuleLocation(FDE_MODULE_ID);

    expect(location).not.toBeNull();
    expect(location?.courseId).toBe("forward-deployed-engineering");
    expect(location?.module.title).toBe("Your First Agentic Workflow");
  });

  it("still finds a module belonging to devops-season-4", () => {
    const location = findModuleLocation(DEVOPS_MODULE_ID);

    expect(location).not.toBeNull();
    expect(location?.courseId).toBe("devops-season-4");
  });

  it("returns null for an id that exists in no registered course", () => {
    expect(findModuleLocation("does-not-exist")).toBeNull();
  });
});

describe("findLabLocation", () => {
  it("still finds a lab belonging to devops-season-4 after the search was generalized", () => {
    // A real labId from masteringAwsDevopsSeason4 — any devops-season-4 lab works
    // since this is a regression check for the generalized multi-course search.
    const location = findLabLocation("69b1d50d23b200e2a40fbde2");

    expect(location).not.toBeNull();
    expect(location?.courseId).toBe("devops-season-4");
  });

  it("returns null for a labId that exists in no registered course", () => {
    expect(findLabLocation("does-not-exist")).toBeNull();
  });
});

describe("findContentLocation", () => {
  it("still finds content belonging to devops-season-4 after the search was generalized", () => {
    const location = findContentLocation(
      "8a09cdd5-d87e-44d2-9179-8ddd047c1fdb",
    );

    expect(location).not.toBeNull();
    expect(location?.courseId).toBe("devops-season-4");
  });

  it("returns null for a contentId that exists in no registered course", () => {
    expect(findContentLocation("does-not-exist")).toBeNull();
  });
});
