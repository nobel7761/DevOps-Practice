import type { CourseSummary } from "@/lib/data/course-modules";
import { masteringAwsDevopsSeason4 } from "@/lib/data/course-modules";
import {
  aiBuilderN8nCourse,
  courseUrl as aiBuilderN8nUrl,
} from "./ai-builder-n8n";
import {
  aiCoderAgenticEngineerCourse,
  courseUrl as aiCoderAgenticEngineerUrl,
} from "./ai-coder-agentic-engineer";
import {
  aiLeaderExecutiveBriefingCourse,
  courseUrl as aiLeaderExecutiveBriefingUrl,
} from "./ai-leader-executive-briefing";
import {
  llmEngineeringCoreTrackCourse,
  courseUrl as llmEngineeringCoreTrackUrl,
} from "./llm-engineering-core-track";
import {
  agenticAiEngineeringCourse,
  courseUrl as agenticAiEngineeringUrl,
} from "./agentic-ai-engineering";
import {
  generativeAgenticAiProductionCourse,
  courseUrl as generativeAgenticAiProductionUrl,
} from "./generative-agentic-ai-production";

export type CoursePlatform = "poridhi" | "udemy";

export interface CourseRegistryEntry {
  id: string;
  platform: CoursePlatform;
  course: CourseSummary;
  externalUrl?: string;
}

export const courseRegistry: CourseRegistryEntry[] = [
  {
    id: "devops-season-4",
    platform: "poridhi",
    course: masteringAwsDevopsSeason4,
  },
  {
    id: "ai-builder-n8n",
    platform: "udemy",
    course: aiBuilderN8nCourse,
    externalUrl: aiBuilderN8nUrl,
  },
  {
    id: "ai-coder-agentic-engineer",
    platform: "udemy",
    course: aiCoderAgenticEngineerCourse,
    externalUrl: aiCoderAgenticEngineerUrl,
  },
  {
    id: "ai-leader-executive-briefing",
    platform: "udemy",
    course: aiLeaderExecutiveBriefingCourse,
    externalUrl: aiLeaderExecutiveBriefingUrl,
  },
  {
    id: "llm-engineering-core-track",
    platform: "udemy",
    course: llmEngineeringCoreTrackCourse,
    externalUrl: llmEngineeringCoreTrackUrl,
  },
  {
    id: "agentic-ai-engineering",
    platform: "udemy",
    course: agenticAiEngineeringCourse,
    externalUrl: agenticAiEngineeringUrl,
  },
  {
    id: "generative-agentic-ai-production",
    platform: "udemy",
    course: generativeAgenticAiProductionCourse,
    externalUrl: generativeAgenticAiProductionUrl,
  },
];

export function getCourseEntry(id: string): CourseRegistryEntry | undefined {
  return courseRegistry.find((entry) => entry.id === id);
}
