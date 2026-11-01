import { getLabExamSpec } from "@/lib/lab-exam/loader";
import { findLabLocation } from "./course-modules";
import { hasInterview } from "./interview-modules";
import type { RelatedLab } from "./video-ask-context";

export interface LabAskContext {
  moduleId: string | null;
  labs: RelatedLab[];
  hasInterview: boolean;
}

/** Collects what's available for a lab's "Ask AI" tab: this lab's sibling labs (same module, excluding itself) and whether that module has an interview. */
export function getLabAskContext(labId: string): LabAskContext {
  const location = findLabLocation(labId);
  if (!location) {
    return { moduleId: null, labs: [], hasInterview: false };
  }

  const labs: RelatedLab[] = location.module.contents
    .filter(
      (content) =>
        content.type === "lab" && content.labId && content.labId !== labId,
    )
    .map((content) => getLabExamSpec(content.labId as string))
    .filter((spec): spec is NonNullable<typeof spec> => spec !== null)
    .map((spec) => ({ title: spec.title, intro: spec.intro }));

  return {
    moduleId: location.module.id,
    labs,
    hasInterview: hasInterview(location.module.id),
  };
}
