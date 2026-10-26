// Written lessons, by topic id. Each topic folder holds lesson.ts, recall.json
// and linkedin.json (docs/SYSTEM_DESIGN_CONTENT_STRUCTURE.md); the quiz bank
// lives in the backend (apps/backend/src/system-design-quiz/data).

import type { SdLesson } from "@/lib/system-design/lesson.types";
import type {
  LinkedInPost,
  RecallMap,
} from "@/lib/system-design/validate-topic";
import { day002Lesson } from "./topics/day-002-client-server-internet/lesson";
import day002Post from "./topics/day-002-client-server-internet/linkedin.json";
import day002Recall from "./topics/day-002-client-server-internet/recall.json";
import { day001Lesson } from "./topics/day-001-what-is-system-design/lesson";
import day001Post from "./topics/day-001-what-is-system-design/linkedin.json";
import day001Recall from "./topics/day-001-what-is-system-design/recall.json";
import { day003Lesson } from "./topics/day-003-dns-http-url/lesson";
import day003Post from "./topics/day-003-dns-http-url/linkedin.json";
import day003Recall from "./topics/day-003-dns-http-url/recall.json";
import { day004Lesson } from "./topics/day-004-api-rest-basics/lesson";
import day004Post from "./topics/day-004-api-rest-basics/linkedin.json";
import day004Recall from "./topics/day-004-api-rest-basics/recall.json";
import { day018Lesson } from "./topics/day-018-rate-limiting/lesson";
import day018Post from "./topics/day-018-rate-limiting/linkedin.json";
import day018Recall from "./topics/day-018-rate-limiting/recall.json";
import { day022Lesson } from "./topics/day-022-database-indexes/lesson";
import day022Post from "./topics/day-022-database-indexes/linkedin.json";
import day022Recall from "./topics/day-022-database-indexes/recall.json";
import { day012Lesson } from "./topics/day-012-message-queues/lesson";
import day012Post from "./topics/day-012-message-queues/linkedin.json";
import day012Recall from "./topics/day-012-message-queues/recall.json";

export interface LessonBundle {
  lesson: SdLesson;
  recall?: RecallMap;
  post?: LinkedInPost;
}

export const LESSONS: Record<string, LessonBundle> = {
  "sd-day-022": {
    lesson: day022Lesson,
    recall: day022Recall as RecallMap,
    post: day022Post as LinkedInPost,
  },
  "sd-day-018": {
    lesson: day018Lesson,
    recall: day018Recall as RecallMap,
    post: day018Post as LinkedInPost,
  },
  "sd-day-004": {
    lesson: day004Lesson,
    recall: day004Recall as RecallMap,
    post: day004Post as LinkedInPost,
  },
  "sd-day-003": {
    lesson: day003Lesson,
    recall: day003Recall as RecallMap,
    post: day003Post as LinkedInPost,
  },
  "sd-day-001": {
    lesson: day001Lesson,
    recall: day001Recall as RecallMap,
    post: day001Post as LinkedInPost,
  },
  "sd-day-002": {
    lesson: day002Lesson,
    recall: day002Recall as RecallMap,
    post: day002Post as LinkedInPost,
  },
  "sd-day-012": {
    lesson: day012Lesson,
    recall: day012Recall as RecallMap,
    post: day012Post as LinkedInPost,
  },
};

export const getLessonBundle = (topicId: string): LessonBundle | undefined =>
  LESSONS[topicId];
