"use client";

import {
  ChallengeList,
  EventLog,
  LessonBox,
  MetricLineChart,
  MetricTile,
  SimulatorHeader,
  SimulatorShell,
  type MetricPoint,
} from "@/components/shared/simulator";
import { RL_CHALLENGES } from "@/lib/system-design/sim/rate-limiter/challenges";
import {
  getRlMetrics,
  type RlState,
} from "@/lib/system-design/sim/rate-limiter/engine";
import { RlControls } from "./RlControls";
import { RlVisualization } from "./RlVisualization";
import { HOW_TO, LESSON, RL_CHALLENGE_SETUPS } from "./rl-content";
import { useRateLimiterLab } from "./useRateLimiterLab";

function HowTo() {
  return (
    <ol className="flex list-decimal flex-col gap-1.5 pl-4">
      {HOW_TO.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ol>
  );
}

function RlMetrics({
  state,
  history,
}: {
  state: RlState;
  history: MetricPoint[];
}) {
  const m = getRlMetrics(state);
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <MetricTile
          label="ছাড়া হলো"
          value={String(m.allowed)}
          tone={m.allowed > 0 ? "good" : "neutral"}
        />
        <MetricTile
          label="429 পেল"
          value={`${m.blocked} (${m.blockedPercent}%)`}
          tone={m.blocked > 0 ? "warning" : "neutral"}
        />
        <MetricTile label="গত ১s-এ ছাড়া" value={String(m.allowedLastSecond)} />
        <MetricTile label="গত ১s-এ 429" value={String(m.blockedLastSecond)} />
        <MetricTile
          label="যেকোনো ১s-এ সর্বোচ্চ"
          value={String(m.maxAllowedIn1s)}
        />
      </div>
      <MetricLineChart
        title="প্রতি সেকেন্ডে ছাড়া পাওয়া request"
        unit="টা"
        points={history}
      />
    </>
  );
}

/** Rate Limiter Simulator (Plan doc Section 9, Day 18). */
export function RateLimiterLab() {
  const lab = useRateLimiterLab();
  return (
    <SimulatorShell
      header={
        <SimulatorHeader
          title="Rate Limiter Simulator"
          howTo={<HowTo />}
          onReset={lab.reset}
        />
      }
      controls={<RlControls lab={lab} />}
      visualization={<RlVisualization state={lab.state} />}
      metrics={<RlMetrics state={lab.state} history={lab.history} />}
      log={<EventLog entries={lab.state.events} />}
      challenges={
        <ChallengeList
          challenges={RL_CHALLENGES}
          completedIds={lab.completedIds}
          onSetup={(id) => {
            const setup = RL_CHALLENGE_SETUPS[id];
            if (setup) lab.load(setup());
          }}
        />
      }
      lesson={<LessonBox>{LESSON}</LessonBox>}
    />
  );
}
