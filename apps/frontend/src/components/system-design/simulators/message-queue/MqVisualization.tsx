"use client";

import {
  DiagramEdge,
  DiagramNode,
  NODE_HEIGHT,
  NODE_WIDTH,
} from "@/components/shared/diagram";
import type {
  MqConsumer,
  MqMessage,
  MqState,
} from "@/lib/system-design/sim/message-queue/engine";

const W = 760;
const TILE = 18;
const TILES_PER_ROW = 10;
const MAX_TILES = 40;
const QUEUE_X = 250;
const QUEUE_W = TILES_PER_ROW * (TILE + 4) + 20;
const CONSUMER_X = 560;
const ROW = 74;

const isVisible = (m: MqMessage, now: number) =>
  m.status === "waiting" || (m.status === "in-flight" && m.visibleAt <= now);

function tileColor(m: MqMessage, now: number) {
  if (m.poison) return "var(--sd-fail)";
  if (m.status === "in-flight" && m.visibleAt <= now) return "var(--sd-warn)"; // timed out, waiting for redelivery
  return m.attempts > 0 ? "var(--sd-warn)" : "var(--sd-queue)";
}

function QueueBox({ state, height }: { state: MqState; height: number }) {
  const waiting = state.messages
    .filter((m) => isVisible(m, state.timeMs))
    .sort((a, b) => a.enqueuedAt - b.enqueuedAt || a.id - b.id);
  const shown = waiting.slice(0, MAX_TILES);
  return (
    <g>
      <rect
        x={QUEUE_X}
        y={20}
        width={QUEUE_W}
        height={height}
        rx={12}
        fill="var(--sd-queue-soft)"
        stroke="var(--sd-queue)"
        strokeWidth={2}
      />
      <text
        x={QUEUE_X + 12}
        y={40}
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        Queue · {waiting.length}টা অপেক্ষায়
      </text>
      {shown.map((m, i) => (
        <rect
          key={m.id}
          x={QUEUE_X + 10 + (i % TILES_PER_ROW) * (TILE + 4)}
          y={52 + Math.floor(i / TILES_PER_ROW) * (TILE + 4)}
          width={TILE}
          height={TILE}
          rx={4}
          fill={tileColor(m, state.timeMs)}
        >
          <title>{`Message #${m.id}${m.poison ? " (poison)" : ""}, চেষ্টা ${m.attempts}`}</title>
        </rect>
      ))}
      {waiting.length > MAX_TILES && (
        <text
          x={QUEUE_X + 12}
          y={height + 10}
          fontSize={11}
          fill="var(--sd-label)"
        >
          +{waiting.length - MAX_TILES}টা আরও
        </text>
      )}
    </g>
  );
}

function ConsumerRow({
  consumer,
  message,
  y,
}: {
  consumer: MqConsumer;
  message?: MqMessage;
  y: number;
}) {
  const status =
    consumer.status === "crashed"
      ? "failed"
      : consumer.status === "busy"
        ? "highlight"
        : "normal";
  const label =
    consumer.status === "crashed"
      ? "crashed, restart হচ্ছে"
      : message
        ? `#${message.id}${message.poison ? " ☣" : ""} process হচ্ছে`
        : "খালি";
  return (
    <g>
      <DiagramNode
        kind="server"
        label={consumer.name}
        x={CONSUMER_X}
        y={y}
        status={status}
      />
      <text
        x={CONSUMER_X + NODE_WIDTH + 8}
        y={y + NODE_HEIGHT / 2}
        dominantBaseline="central"
        fontSize={11}
        fill="var(--sd-label)"
      >
        {label}
      </text>
    </g>
  );
}

/** Producer → queue (one tile per waiting message) → consumers, with the DLQ below. */
export function MqVisualization({ state }: { state: MqState }) {
  const consumerCount = Math.max(1, state.consumers.length);
  const height = Math.max(300, consumerCount * ROW + 40);
  const queueHeight = 150;
  const dlq = state.messages.filter((m) => m.status === "dlq").length;
  const queueMid = 20 + queueHeight / 2;

  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      width="100%"
      style={{ minWidth: 600 }}
      role="img"
      aria-label={`Producer থেকে queue হয়ে ${state.consumers.length} জন consumer`}
    >
      <DiagramNode
        kind="server"
        label="Producer"
        x={20}
        y={queueMid - NODE_HEIGHT / 2}
        status="highlight"
      />
      <DiagramEdge
        segment={{
          x1: 20 + NODE_WIDTH,
          y1: queueMid,
          x2: QUEUE_X,
          y2: queueMid,
        }}
        label="publish"
        tone="active"
      />
      <QueueBox state={state} height={queueHeight} />
      {state.consumers.map((consumer, i) => {
        const y = 20 + i * ROW;
        return (
          <g key={consumer.id}>
            <DiagramEdge
              segment={{
                x1: QUEUE_X + QUEUE_W,
                y1: queueMid,
                x2: CONSUMER_X,
                y2: y + NODE_HEIGHT / 2,
              }}
            />
            <ConsumerRow
              consumer={consumer}
              message={state.messages.find((m) => m.id === consumer.messageId)}
              y={y}
            />
          </g>
        );
      })}
      {state.config.dlqEnabled && (
        <g>
          <DiagramEdge
            segment={{
              x1: QUEUE_X + QUEUE_W / 2,
              y1: 20 + queueHeight,
              x2: QUEUE_X + QUEUE_W / 2,
              y2: 230,
            }}
            dashed
            tone="failed"
            label="বারবার fail"
          />
          <DiagramNode
            kind="queue"
            label={`DLQ · ${dlq}টা`}
            x={QUEUE_X + QUEUE_W / 2 - NODE_WIDTH / 2}
            y={230}
            status={dlq > 0 ? "failed" : "normal"}
          />
        </g>
      )}
    </svg>
  );
}
