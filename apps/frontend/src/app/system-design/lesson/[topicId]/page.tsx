import { notFound } from "next/navigation";
import { LessonPageScreen } from "@/components/system-design/lesson/LessonPageScreen";
import { getLessonBundle } from "@/lib/data/system-design/lessons";

export default async function SystemDesignLessonPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const bundle = getLessonBundle(topicId);
  if (!bundle) notFound();
  return <LessonPageScreen bundle={bundle} />;
}
