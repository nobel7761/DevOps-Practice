import LessonComingSoon from "@/components/system-design/lesson/LessonComingSoon";
import LessonSection from "@/components/system-design/lesson/LessonSection";
import { findSimulator } from "@/components/system-design/simulators/registry";

/** Section 7 "🎮 নিজে চালিয়ে দেখুন": the topic's simulator, or a placeholder if it isn't built yet. */
export default function LessonSimulator({
  simulatorId,
}: {
  simulatorId: string;
}) {
  const simulator = findSimulator(simulatorId);
  if (!simulator) {
    return (
      <LessonComingSoon
        section="simulator"
        title="Simulator"
        description={`"${simulatorId}" simulator এখানে বসবে।`}
      />
    );
  }
  const { Component } = simulator;
  return (
    <LessonSection section="simulator">
      <Component />
    </LessonSection>
  );
}
