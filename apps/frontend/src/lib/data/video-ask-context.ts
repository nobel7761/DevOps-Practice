import { getLabExamSpec } from "@/lib/lab-exam/loader";
import { findContentLocation } from "./course-modules";
import { hasInterview } from "./interview-modules";

export interface RelatedLab {
  title: string;
  intro: string;
}

export interface VideoAskContext {
  moduleId: string | null;
  labs: RelatedLab[];
  hasInterview: boolean;
}

/** Collects what's available for the "Ask OpenAI" tab: this video's sibling labs (same module) and whether that module has an interview. */
export function getVideoAskContext(contentId: string): VideoAskContext {
  const location = findContentLocation(contentId);
  if (!location) {
    return { moduleId: null, labs: [], hasInterview: false };
  }

  const labs: RelatedLab[] = location.module.contents
    .filter((content) => content.type === "lab" && content.labId)
    .map((content) => getLabExamSpec(content.labId as string))
    .filter((spec): spec is NonNullable<typeof spec> => spec !== null)
    .map((spec) => ({ title: spec.title, intro: spec.intro }));

  return {
    moduleId: location.module.id,
    labs,
    hasInterview: hasInterview(location.module.id),
  };
}
