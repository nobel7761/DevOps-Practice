import { describe, expect, it } from "vitest";
import { resolveContentHref } from "./content-href";
import type { CourseContentItem } from "./course-modules";

const MODULE_ID = "mod-1";
const hasInterview = (moduleId: string) => moduleId === "has-interview";

function item(overrides: Partial<CourseContentItem>): CourseContentItem {
  return { type: "pre_class", title: "Title", completed: false, ...overrides };
}

describe("resolveContentHref", () => {
  it("links a lab with a labId to the lab route", () => {
    const href = resolveContentHref(
      item({ type: "lab", labId: "lab-1" }),
      MODULE_ID,
      hasInterview,
    );
    expect(href).toBe("/module/lab/lab-1");
  });

  it("returns null for a lab with no labId (not yet provisioned)", () => {
    const href = resolveContentHref(
      item({ type: "lab", labId: null }),
      MODULE_ID,
      hasInterview,
    );
    expect(href).toBeNull();
  });

  it("links a pre_class item with both contentId and videoUrl to the video route", () => {
    const href = resolveContentHref(
      item({ contentId: "c1", videoUrl: "https://example.com/v.m3u8" }),
      MODULE_ID,
      hasInterview,
    );
    expect(href).toBe("/module/video/c1");
  });

  it("links a pre_class item with a contentId but no videoUrl to the text-only story route", () => {
    const href = resolveContentHref(
      item({ contentId: "c1", videoUrl: undefined }),
      MODULE_ID,
      hasInterview,
    );
    expect(href).toBe("/module/story/c1");
  });

  it("links a live_class item with a contentId but no videoUrl to the text-only story route too", () => {
    const href = resolveContentHref(
      item({ type: "live_class", contentId: "c2", videoUrl: null }),
      MODULE_ID,
      hasInterview,
    );
    expect(href).toBe("/module/story/c2");
  });

  it("returns null for a pre_class item with no contentId at all", () => {
    const href = resolveContentHref(item({}), MODULE_ID, hasInterview);
    expect(href).toBeNull();
  });

  it("links ai_interview to the interview route when the module has one", () => {
    const href = resolveContentHref(
      item({ type: "ai_interview" }),
      "has-interview",
      hasInterview,
    );
    expect(href).toBe("/module/interview/has-interview");
  });

  it("returns null for ai_interview when the module has no interview authored", () => {
    const href = resolveContentHref(
      item({ type: "ai_interview" }),
      MODULE_ID,
      hasInterview,
    );
    expect(href).toBeNull();
  });

  it("links a System Design lesson to its lesson page", () => {
    const href = resolveContentHref(
      item({ type: "sd_lesson", contentId: "sd-day-012" }),
      MODULE_ID,
      hasInterview,
    );
    expect(href).toBe("/system-design/lesson/sd-day-012");
  });
});
