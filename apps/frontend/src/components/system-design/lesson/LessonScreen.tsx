import LessonDeepDive from "@/components/system-design/lesson/LessonDeepDive";
import LessonExplainYourself from "@/components/system-design/lesson/LessonExplainYourself";
import LessonHandsOnLab from "@/components/system-design/lesson/LessonHandsOnLab";
import LessonHeader from "@/components/system-design/lesson/LessonHeader";
import LessonInterviewQuestions from "@/components/system-design/lesson/LessonInterviewQuestions";
import LessonLinkedIn from "@/components/system-design/lesson/LessonLinkedIn";
import LessonMistakes from "@/components/system-design/lesson/LessonMistakes";
import LessonObjectives from "@/components/system-design/lesson/LessonObjectives";
import LessonPrerequisites from "@/components/system-design/lesson/LessonPrerequisites";
import LessonProseBlock from "@/components/system-design/lesson/LessonProseBlock";
import LessonQuiz from "@/components/system-design/lesson/LessonQuiz";
import LessonRecall from "@/components/system-design/lesson/LessonRecall";
import LessonSimulator from "@/components/system-design/lesson/LessonSimulator";
import LessonSummary from "@/components/system-design/lesson/LessonSummary";
import LessonTradeOffs from "@/components/system-design/lesson/LessonTradeOffs";
import type { LessonMeta, SdLesson } from "@/lib/system-design/lesson.types";
import type {
  LinkedInPost,
  RecallMap,
} from "@/lib/system-design/validate-topic";

/** The full 18-section lesson template, in Plan doc Section 5 order. Recall and post come from the topic's recall.json / linkedin.json. */
export default function LessonScreen({
  lesson,
  recall,
  post,
}: {
  lesson: SdLesson;
  recall?: RecallMap;
  post?: LinkedInPost;
}) {
  const meta: LessonMeta = {
    topicId: lesson.topicId,
    day: lesson.day,
    title: lesson.title,
    definition: lesson.definition,
  };
  return (
    <article className="flex w-full flex-col gap-10 py-6">
      <LessonHeader day={lesson.day} title={lesson.title} />
      <LessonObjectives objectives={lesson.objectives} />
      <LessonPrerequisites prerequisites={lesson.prerequisites} />
      <LessonProseBlock
        section="problem"
        content={lesson.problem}
        meta={meta}
      />
      <LessonProseBlock
        section="analogy"
        content={lesson.analogy}
        meta={meta}
      />
      <LessonProseBlock
        section="coreConcept"
        content={lesson.coreConcept}
        meta={meta}
      />
      <LessonDeepDive items={lesson.deepDive} meta={meta} />
      {lesson.simulator && <LessonSimulator simulatorId={lesson.simulator} />}
      <LessonTradeOffs tradeOffs={lesson.tradeOffs} />
      <LessonProseBlock
        section="industry"
        content={lesson.industry}
        meta={meta}
      />
      <LessonMistakes mistakes={lesson.mistakes} />
      <LessonHandsOnLab steps={lesson.lab} />
      <LessonProseBlock
        section="connections"
        content={lesson.connections}
        meta={meta}
      />
      <LessonExplainYourself questions={lesson.explainYourself} />
      <LessonInterviewQuestions questions={lesson.interviewQuestions} />
      <LessonSummary summary={lesson.summary} meta={meta} />
      <LessonRecall title={lesson.title} recall={recall} />
      <LessonQuiz topicId={lesson.topicId} />
      <LessonLinkedIn lesson={lesson} post={post} />
    </article>
  );
}
