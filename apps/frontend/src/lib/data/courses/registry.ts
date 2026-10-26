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
import { forwardDeployedEngineeringCourse } from "./forward-deployed-engineering";
import { systemDesignSeason3Course } from "./system-design-season-3";
import {
  SYSTEM_DESIGN_A_Z_COURSE_ID,
  systemDesignAToZCourse,
} from "./system-design-a-z";
import { backendPythonAwsSeason2Course } from "./backend-python-aws-season-2";
import {
  VPS_MIGRATION_MASTERY_COURSE_ID,
  vpsMigrationMasteryCourse,
} from "./vps-migration-mastery";

export type CoursePlatform = "poridhi" | "udemy" | "own";

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
    id: SYSTEM_DESIGN_A_Z_COURSE_ID,
    platform: "own",
    course: systemDesignAToZCourse,
  },
  {
    id: VPS_MIGRATION_MASTERY_COURSE_ID,
    platform: "own",
    course: vpsMigrationMasteryCourse,
  },
  {
    id: "forward-deployed-engineering",
    platform: "poridhi",
    course: forwardDeployedEngineeringCourse,
  },
  {
    id: "system-design-season-3",
    platform: "poridhi",
    course: systemDesignSeason3Course,
  },
  {
    id: "backend-python-aws-season-2",
    platform: "poridhi",
    course: backendPythonAwsSeason2Course,
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
