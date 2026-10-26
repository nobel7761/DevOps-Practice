"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shared/shadcn";
import type { RecallMap } from "@/lib/system-design/validate-topic";
import { FreeRecall } from "./FreeRecall";
import { KeywordRecall } from "./KeywordRecall";
import { RecallTopicStatusBar } from "./RecallTopicStatusBar";
import { useRecallStore } from "./useRecallStore";

/** Lesson section 16 "🧠 মনে আছে তো?": Keyword Recall and Free Recall for one topic. */
export function RecallMapSection({
  title,
  recall,
}: {
  title: string;
  recall: RecallMap;
}) {
  const store = useRecallStore();
  const records = store.records.filter((r) => r.topicId === recall.topicId);
  const terms = recall.points.map((p) => p.term);

  return (
    <div className="flex flex-col gap-3">
      <RecallTopicStatusBar records={records} />
      {store.error && <p className="text-sm text-destructive">{store.error}</p>}
      <Tabs defaultValue="keyword">
        <TabsList>
          <TabsTrigger value="keyword">Keyword Recall</TabsTrigger>
          <TabsTrigger value="free">Free Recall (কঠিন)</TabsTrigger>
        </TabsList>
        <TabsContent value="keyword" className="pt-2">
          <KeywordRecall
            title={title}
            recall={recall}
            records={records}
            onRate={(term, rating) =>
              store.rate(recall.topicId, term, terms, rating)
            }
          />
        </TabsContent>
        <TabsContent value="free" className="pt-2">
          <FreeRecall title={title} points={recall.points} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
