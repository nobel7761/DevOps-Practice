import {
  DiagramEdge,
  kindColor,
  kindSoftColor,
  type DiagramKind,
} from "@/components/shared/diagram";

// Internal structure of availability math: series multiplies, parallel uses 1 − (1 − A)ⁿ.

const BLOCK_W = 140;
const BLOCK_H = 56;

function Block({
  x,
  y,
  kind,
  name,
  value,
}: {
  x: number;
  y: number;
  kind: DiagramKind;
  name: string;
  value: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={BLOCK_W}
        height={BLOCK_H}
        rx={10}
        fill={kindSoftColor(kind)}
        stroke={kindColor(kind)}
        strokeWidth={1.5}
      />
      <text
        x={x + BLOCK_W / 2}
        y={y + 21}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {name}
      </text>
      <text
        x={x + BLOCK_W / 2}
        y={y + 41}
        textAnchor="middle"
        fontSize={13}
        fill="var(--sd-label)"
      >
        {value}
      </text>
    </g>
  );
}

function Result({
  x,
  y,
  value,
  sub,
}: {
  x: number;
  y: number;
  value: string;
  sub: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={150}
        height={BLOCK_H}
        rx={10}
        fill="var(--sd-canvas)"
        stroke="var(--sd-ok)"
        strokeWidth={2}
      />
      <text
        x={x + 75}
        y={y + 22}
        textAnchor="middle"
        fontSize={16}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {value}
      </text>
      <text
        x={x + 75}
        y={y + 42}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        {sub}
      </text>
    </g>
  );
}

function Heading({ y, text }: { y: number; text: string }) {
  return (
    <text x={20} y={y} fontSize={14} fontWeight={700} fill="var(--sd-label)">
      {text}
    </text>
  );
}

function Formula({ y, text }: { y: number; text: string }) {
  return (
    <text x={20} y={y} fontSize={13} fill="var(--sd-edge)">
      {text}
    </text>
  );
}

function SeriesRow() {
  const y = 44;
  const mid = y + BLOCK_H / 2;
  return (
    <g>
      <Heading
        y={26}
        text="Series: সবগুলো চালু থাকতে হবে → availability গুণ হয়"
      />
      <Block x={20} y={y} kind="load-balancer" name="LB" value="99.99%" />
      <DiagramEdge segment={{ x1: 160, y1: mid, x2: 208, y2: mid }} />
      <Block x={210} y={y} kind="server" name="App" value="99.9%" />
      <DiagramEdge segment={{ x1: 350, y1: mid, x2: 398, y2: mid }} />
      <Block x={400} y={y} kind="database" name="DB" value="99.9%" />
      <DiagramEdge
        segment={{ x1: 540, y1: mid, x2: 588, y2: mid }}
        tone="active"
      />
      <Result x={590} y={y} value="≈ 99.79%" sub="বছরে ~১৮ ঘণ্টা বন্ধ" />
      <Formula
        y={128}
        text="0.9999 × 0.999 × 0.999 ≈ 0.9979 → সবচেয়ে দুর্বল অংশের চেয়েও কম"
      />
    </g>
  );
}

function ParallelRow() {
  const topY = 196;
  const bottomY = 286;
  const splitX = 60;
  const joinX = 420;
  const midY = 269;
  return (
    <g>
      <Heading
        y={176}
        text="Parallel: যেকোনো একটা চালু থাকলেই হবে → 1 − (1 − A)ⁿ"
      />
      <circle cx={splitX} cy={midY} r={5} fill="var(--sd-edge)" />
      <DiagramEdge
        segment={{ x1: splitX, y1: midY, x2: 158, y2: topY + BLOCK_H / 2 }}
      />
      <DiagramEdge
        segment={{ x1: splitX, y1: midY, x2: 158, y2: bottomY + BLOCK_H / 2 }}
      />
      <Block x={160} y={topY} kind="server" name="App A" value="99%" />
      <Block x={160} y={bottomY} kind="server" name="App B" value="99%" />
      <DiagramEdge
        segment={{ x1: 300, y1: topY + BLOCK_H / 2, x2: joinX, y2: midY }}
      />
      <DiagramEdge
        segment={{ x1: 300, y1: bottomY + BLOCK_H / 2, x2: joinX, y2: midY }}
      />
      <circle cx={joinX} cy={midY} r={5} fill="var(--sd-edge)" />
      <DiagramEdge
        segment={{ x1: joinX + 6, y1: midY, x2: 588, y2: midY }}
        tone="active"
      />
      <Result
        x={590}
        y={midY - BLOCK_H / 2}
        value="99.99%"
        sub="বছরে ~৫৩ মিনিট বন্ধ"
      />
      <Formula
        y={372}
        text="1 − (0.01 × 0.01) = 0.9999 → কিন্তু শুধু তখনই, যখন দুটো একসাথে পড়ে না (স্বাধীন failure)"
      />
    </g>
  );
}

export function Day006SeriesParallel() {
  return (
    <svg viewBox="0 0 760 390" width="100%">
      <SeriesRow />
      <ParallelRow />
    </svg>
  );
}
