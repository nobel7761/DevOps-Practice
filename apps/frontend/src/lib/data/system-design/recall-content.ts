// Recall Map content per topic (Plan doc Section 5.1), taken from each
// written lesson's recall.json (see lessons.ts).

import type { RecallMap } from "@/lib/system-design/validate-topic";
import { LESSONS } from "./lessons";

export const getRecallContent = (topicId: string): RecallMap | undefined =>
  LESSONS[topicId]?.recall;
