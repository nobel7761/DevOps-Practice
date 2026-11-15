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
import { day005Lesson } from "./topics/day-005-scalability/lesson";
import day005Post from "./topics/day-005-scalability/linkedin.json";
import day005Recall from "./topics/day-005-scalability/recall.json";
import { day006Lesson } from "./topics/day-006-availability/lesson";
import day006Post from "./topics/day-006-availability/linkedin.json";
import day006Recall from "./topics/day-006-availability/recall.json";
import { day007Lesson } from "./topics/day-007-latency-vs-throughput/lesson";
import day007Post from "./topics/day-007-latency-vs-throughput/linkedin.json";
import day007Recall from "./topics/day-007-latency-vs-throughput/recall.json";
import { day008Lesson } from "./topics/day-008-cap-theorem/lesson";
import day008Post from "./topics/day-008-cap-theorem/linkedin.json";
import day008Recall from "./topics/day-008-cap-theorem/recall.json";
import { day010Lesson } from "./topics/day-010-databases/lesson";
import day010Post from "./topics/day-010-databases/linkedin.json";
import day010Recall from "./topics/day-010-databases/recall.json";
import { day009Lesson } from "./topics/day-009-load-balancers/lesson";
import day009Post from "./topics/day-009-load-balancers/linkedin.json";
import day009Recall from "./topics/day-009-load-balancers/recall.json";
import { day011Lesson } from "./topics/day-011-cdn/lesson";
import day011Post from "./topics/day-011-cdn/linkedin.json";
import day011Recall from "./topics/day-011-cdn/recall.json";
import { day014Lesson } from "./topics/day-014-stateful-vs-stateless/lesson";
import day014Post from "./topics/day-014-stateful-vs-stateless/linkedin.json";
import day014Recall from "./topics/day-014-stateful-vs-stateless/recall.json";
import { day013Lesson } from "./topics/day-013-vertical-vs-horizontal-scaling/lesson";
import day013Post from "./topics/day-013-vertical-vs-horizontal-scaling/linkedin.json";
import day013Recall from "./topics/day-013-vertical-vs-horizontal-scaling/recall.json";
import { day015Lesson } from "./topics/day-015-proxy-servers/lesson";
import day015Post from "./topics/day-015-proxy-servers/linkedin.json";
import day015Recall from "./topics/day-015-proxy-servers/recall.json";
import { day016Lesson } from "./topics/day-016-api-gateway/lesson";
import day016Post from "./topics/day-016-api-gateway/linkedin.json";
import day016Recall from "./topics/day-016-api-gateway/recall.json";
import { day019Lesson } from "./topics/day-019-capacity-estimation/lesson";
import day019Post from "./topics/day-019-capacity-estimation/linkedin.json";
import day019Recall from "./topics/day-019-capacity-estimation/recall.json";
import { day017Lesson } from "./topics/day-017-caching/lesson";
import day017Post from "./topics/day-017-caching/linkedin.json";
import day017Recall from "./topics/day-017-caching/recall.json";
import { day012Lesson } from "./topics/day-012-message-queues/lesson";
import day012Post from "./topics/day-012-message-queues/linkedin.json";
import day012Recall from "./topics/day-012-message-queues/recall.json";

export interface LessonBundle {
  lesson: SdLesson;
  recall?: RecallMap;
  post?: LinkedInPost;
}

export const LESSONS: Record<string, LessonBundle> = {
  "sd-day-017": {
    lesson: day017Lesson,
    recall: day017Recall as RecallMap,
    post: day017Post as LinkedInPost,
  },
  "sd-day-019": {
    lesson: day019Lesson,
    recall: day019Recall as RecallMap,
    post: day019Post as LinkedInPost,
  },
  "sd-day-016": {
    lesson: day016Lesson,
    recall: day016Recall as RecallMap,
    post: day016Post as LinkedInPost,
  },
  "sd-day-015": {
    lesson: day015Lesson,
    recall: day015Recall as RecallMap,
    post: day015Post as LinkedInPost,
  },
  "sd-day-013": {
    lesson: day013Lesson,
    recall: day013Recall as RecallMap,
    post: day013Post as LinkedInPost,
  },
  "sd-day-014": {
    lesson: day014Lesson,
    recall: day014Recall as RecallMap,
    post: day014Post as LinkedInPost,
  },
  "sd-day-011": {
    lesson: day011Lesson,
    recall: day011Recall as RecallMap,
    post: day011Post as LinkedInPost,
  },
  "sd-day-009": {
    lesson: day009Lesson,
    recall: day009Recall as RecallMap,
    post: day009Post as LinkedInPost,
  },
  "sd-day-010": {
    lesson: day010Lesson,
    recall: day010Recall as RecallMap,
    post: day010Post as LinkedInPost,
  },
  "sd-day-008": {
    lesson: day008Lesson,
    recall: day008Recall as RecallMap,
    post: day008Post as LinkedInPost,
  },
  "sd-day-007": {
    lesson: day007Lesson,
    recall: day007Recall as RecallMap,
    post: day007Post as LinkedInPost,
  },
  "sd-day-006": {
    lesson: day006Lesson,
    recall: day006Recall as RecallMap,
    post: day006Post as LinkedInPost,
  },
  "sd-day-005": {
    lesson: day005Lesson,
    recall: day005Recall as RecallMap,
    post: day005Post as LinkedInPost,
  },
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
