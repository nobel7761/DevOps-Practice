import { describe, expect, it } from "vitest";
import { canAccessCourse, canUseAskAi } from "./access";

const user = (o = {}) => ({
  role: "user" as const,
  courseIds: ["a"],
  askAiEnabled: false,
  ...o,
});

describe("frontend access helpers", () => {
  it("course access follows assignment; super admin sees all", () => {
    expect(canAccessCourse(user(), "a")).toBe(true);
    expect(canAccessCourse(user(), "b")).toBe(false);
    expect(canAccessCourse(user({ role: "superadmin" }), "b")).toBe(true);
  });
  it("Ask AI follows the flag; super admin always", () => {
    expect(canUseAskAi(user())).toBe(false);
    expect(canUseAskAi(user({ askAiEnabled: true }))).toBe(true);
    expect(canUseAskAi(user({ role: "superadmin" }))).toBe(true);
  });
});
