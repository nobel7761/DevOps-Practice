"use client";

import {
  ChallengeList,
  EventLog,
  LessonBox,
  SimulatorHeader,
  SimulatorShell,
} from "@/components/shared/simulator";
import { LB_CHALLENGES } from "@/lib/system-design/sim/load-balancer/challenges";
import { LbControls } from "./LbControls";
import { LbHowTo } from "./LbHowTo";
import { LbMetricsPanel } from "./LbMetricsPanel";
import { LbVisualization } from "./LbVisualization";
import { CHALLENGE_SETUPS, LESSON } from "./lb-lab-content";
import { useLoadBalancerLab } from "./useLoadBalancerLab";

/** Load Balancer Lab (Plan doc Section 9.2) — the reference simulator for Days 9, 13, 14 and 87. */
export function LoadBalancerLab() {
  const lab = useLoadBalancerLab();

  return (
    <SimulatorShell
      header={
        <SimulatorHeader
          title="Load Balancer Lab"
          howTo={<LbHowTo />}
          onReset={lab.reset}
        />
      }
      controls={<LbControls lab={lab} />}
      visualization={<LbVisualization state={lab.state} />}
      metrics={<LbMetricsPanel state={lab.state} history={lab.history} />}
      log={<EventLog entries={lab.state.log} />}
      challenges={
        <ChallengeList
          challenges={LB_CHALLENGES}
          completedIds={lab.completedIds}
          onSetup={(id) => {
            const setup = CHALLENGE_SETUPS[id];
            if (setup) lab.load(setup());
          }}
        />
      }
      lesson={<LessonBox>{LESSON}</LessonBox>}
    />
  );
}
