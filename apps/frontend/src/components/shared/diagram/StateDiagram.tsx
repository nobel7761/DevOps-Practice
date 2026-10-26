import {
  edgeEndpoints,
  offsetSegment,
} from "@/lib/system-design/diagram/geometry";
import { DiagramEdge } from "./DiagramEdge";

export interface DiagramState {
  id: string;
  label: string;
  /** Top-left corner, in diagram units. */
  x: number;
  y: number;
}

export interface DiagramTransition {
  from: string;
  to: string;
  label: string;
}

const STATE_WIDTH = 132;
const STATE_HEIGHT = 48;
const PADDING = 16;
/** How far apart A→B and B→A are drawn when both exist. */
const PAIR_OFFSET = 7;

const boxOf = (state: DiagramState) => ({
  x: state.x,
  y: state.y,
  width: STATE_WIDTH,
  height: STATE_HEIGHT,
});

function StateBox({ state, active }: { state: DiagramState; active: boolean }) {
  return (
    <g>
      <rect
        x={state.x}
        y={state.y}
        width={STATE_WIDTH}
        height={STATE_HEIGHT}
        rx={STATE_HEIGHT / 2}
        fill={active ? "var(--primary)" : "var(--sd-canvas)"}
        stroke={active ? "var(--primary)" : "var(--sd-edge)"}
        strokeWidth={active ? 2.5 : 1.5}
      />
      <text
        x={state.x + STATE_WIDTH / 2}
        y={state.y + STATE_HEIGHT / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={600}
        fill={active ? "var(--primary-foreground)" : "var(--sd-label)"}
      >
        {state.label}
      </text>
    </g>
  );
}

/** States and the events that move between them, e.g. Circuit Breaker (Plan doc Section 6.2). */
export function StateDiagram({
  states,
  transitions,
  activeId,
}: {
  states: DiagramState[];
  transitions: DiagramTransition[];
  activeId?: string;
}) {
  const byId = new Map(states.map((state) => [state.id, state]));
  const width = Math.max(...states.map((s) => s.x + STATE_WIDTH)) + PADDING;
  const height = Math.max(...states.map((s) => s.y + STATE_HEIGHT)) + PADDING;
  const hasReverse = (t: DiagramTransition) =>
    transitions.some((o) => o.from === t.to && o.to === t.from);

  return (
    <svg
      viewBox={`${-PADDING} ${-PADDING} ${width + PADDING} ${height + PADDING}`}
      width="100%"
    >
      {transitions.map((transition) => {
        const from = byId.get(transition.from);
        const to = byId.get(transition.to);
        if (!from || !to) return null;
        const segment = edgeEndpoints(boxOf(from), boxOf(to));
        return (
          <DiagramEdge
            key={`${transition.from}-${transition.to}`}
            segment={
              hasReverse(transition)
                ? offsetSegment(segment, PAIR_OFFSET)
                : segment
            }
            label={transition.label}
            tone={transition.from === activeId ? "active" : "normal"}
          />
        );
      })}
      {states.map((state) => (
        <StateBox key={state.id} state={state} active={state.id === activeId} />
      ))}
    </svg>
  );
}
