import { DiagramNode, NODE_HEIGHT, NODE_WIDTH } from "./DiagramNode";
import type { DiagramKind } from "./diagram-kinds";

export interface SequenceParticipant {
  id: string;
  kind: DiagramKind;
  label?: string;
}

export interface SequenceMessage {
  from: string;
  to: string;
  label: string;
  /** Dashed line, for responses. */
  dashed?: boolean;
}

const COLUMN_WIDTH = 180;
const ROW_HEIGHT = 48;
const TOP = NODE_HEIGHT + 32;

function MessageArrow({
  x1,
  x2,
  y,
  message,
  active,
}: {
  x1: number;
  x2: number;
  y: number;
  message: SequenceMessage;
  active: boolean;
}) {
  const direction = x2 > x1 ? 1 : -1;
  const color = active ? "var(--primary)" : "var(--sd-edge)";
  return (
    <g>
      <line
        x1={x1}
        y1={y}
        x2={x2 - direction * 8}
        y2={y}
        stroke={color}
        strokeWidth={active ? 2.5 : 1.5}
        strokeDasharray={message.dashed ? "6 4" : undefined}
      />
      <polygon
        points={`${x2},${y} ${x2 - direction * 9},${y - 5} ${x2 - direction * 9},${y + 5}`}
        fill={color}
      />
      <text
        x={(x1 + x2) / 2}
        y={y - 8}
        textAnchor="middle"
        fontSize={12}
        fill="var(--sd-label)"
      >
        {message.label}
      </text>
    </g>
  );
}

/**
 * Who-sends-what-when diagram (Plan doc Section 6.2). Pass `activeStep` to
 * highlight one message, e.g. from a StepThrough; messages after it are hidden.
 */
export function SequenceDiagram({
  participants,
  messages,
  activeStep,
}: {
  participants: SequenceParticipant[];
  messages: SequenceMessage[];
  activeStep?: number;
}) {
  const centerX = (id: string) =>
    participants.findIndex((p) => p.id === id) * COLUMN_WIDTH +
    COLUMN_WIDTH / 2;
  const width = participants.length * COLUMN_WIDTH;
  const height = TOP + messages.length * ROW_HEIGHT + 16;
  const visible =
    activeStep === undefined ? messages : messages.slice(0, activeStep + 1);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ minWidth: width * 0.75 }}
    >
      {participants.map((participant) => {
        const cx = centerX(participant.id);
        return (
          <g key={participant.id}>
            <line
              x1={cx}
              y1={NODE_HEIGHT}
              x2={cx}
              y2={height}
              stroke="var(--sd-edge)"
              strokeDasharray="3 5"
            />
            <DiagramNode
              kind={participant.kind}
              label={participant.label}
              x={cx - NODE_WIDTH / 2}
              y={0}
            />
          </g>
        );
      })}
      {visible.map((message, index) => (
        <MessageArrow
          key={index}
          x1={centerX(message.from)}
          x2={centerX(message.to)}
          y={TOP + index * ROW_HEIGHT + 20}
          message={message}
          active={index === activeStep}
        />
      ))}
    </svg>
  );
}
