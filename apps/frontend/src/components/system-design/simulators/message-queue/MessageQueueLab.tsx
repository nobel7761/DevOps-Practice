"use client";

import {
  ChallengeList,
  EventLog,
  LessonBox,
  SimulatorHeader,
  SimulatorShell,
} from "@/components/shared/simulator";
import { MQ_CHALLENGES } from "@/lib/system-design/sim/message-queue/challenges";
import { MqControls } from "./MqControls";
import { MqMetricsPanel } from "./MqMetricsPanel";
import { MqVisualization } from "./MqVisualization";
import { HOW_TO, LESSON, MQ_CHALLENGE_SETUPS } from "./mq-lab-content";
import { useMessageQueueLab } from "./useMessageQueueLab";

function HowTo() {
  return (
    <ol className="flex list-decimal flex-col gap-1.5 pl-4">
      {HOW_TO.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ol>
  );
}

/** Message Queue Lab (Plan doc Section 9.3) — used in Days 12, 56 and 57. */
export function MessageQueueLab() {
  const lab = useMessageQueueLab();
  return (
    <SimulatorShell
      header={
        <SimulatorHeader
          title="Message Queue Lab"
          howTo={<HowTo />}
          onReset={lab.reset}
        />
      }
      controls={<MqControls lab={lab} />}
      visualization={<MqVisualization state={lab.state} />}
      metrics={<MqMetricsPanel state={lab.state} history={lab.history} />}
      log={<EventLog entries={lab.state.log} />}
      challenges={
        <ChallengeList
          challenges={MQ_CHALLENGES}
          completedIds={lab.completedIds}
          onSetup={(id) => {
            const setup = MQ_CHALLENGE_SETUPS[id];
            if (setup) lab.load(setup());
          }}
        />
      }
      lesson={<LessonBox>{LESSON}</LessonBox>}
    />
  );
}
