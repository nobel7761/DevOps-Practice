import { DiagramEdge } from "@/components/shared/diagram";
import { InfoBox } from "./Day008Parts";

// Analogy illustration: two branches of one bank share a joint account; the
// phone line between them is cut while both brothers withdraw money.

function Figure({
  x,
  y,
  r,
  emoji,
  label,
  sub,
  tone = "user",
}: {
  x: number;
  y: number;
  r: number;
  emoji: string;
  label: string;
  sub?: string;
  tone?: "user" | "server";
}) {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={`var(--sd-${tone}-soft)`}
        stroke={`var(--sd-${tone})`}
        strokeWidth={1.5}
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={r * 0.85}
      >
        {emoji}
      </text>
      <text
        x={x}
        y={y + r + 17}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {label}
      </text>
      {sub && (
        <text
          x={x}
          y={y + r + 33}
          textAnchor="middle"
          fontSize={11}
          fill="var(--sd-edge)"
        >
          {sub}
        </text>
      )}
    </g>
  );
}

function CutPhoneLine() {
  return (
    <g>
      <line
        x1={165}
        y1={60}
        x2={525}
        y2={60}
        stroke="var(--sd-fail)"
        strokeWidth={2.5}
        strokeDasharray="8 6"
      />
      <text
        x={345}
        y={60}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={22}
        paintOrder="stroke"
        stroke="var(--sd-canvas)"
        strokeWidth={6}
      >
        ☎️
      </text>
      <text
        x={345}
        y={90}
        textAnchor="middle"
        fontSize={12.5}
        fontWeight={700}
        fill="var(--sd-fail)"
      >
        ✕ লাইন কাটা (= partition)
      </text>
    </g>
  );
}

function Branches() {
  return (
    <g>
      <Figure
        x={130}
        y={60}
        r={32}
        emoji="🏦"
        label="মতিঝিল শাখা"
        tone="server"
      />
      <Figure
        x={560}
        y={60}
        r={32}
        emoji="🏦"
        label="আগ্রাবাদ শাখা"
        tone="server"
      />
      <InfoBox
        x={60}
        y={135}
        width={140}
        height={56}
        title="খাতা: ৳১,০০০"
        lines={["সর্বশেষ"]}
        tone="ok"
      />
      <InfoBox
        x={490}
        y={135}
        width={140}
        height={56}
        title="খাতা: ৳৫,০০০"
        lines={["পুরনো খবর"]}
        tone="warn"
      />
    </g>
  );
}

function Brothers() {
  return (
    <g>
      <Figure
        x={130}
        y={262}
        r={24}
        emoji="🧑"
        label="রহিম"
        sub="৳৪,০০০ তুললেন"
      />
      <DiagramEdge segment={{ x1: 130, y1: 237, x2: 130, y2: 193 }} />
      <Figure x={715} y={163} r={24} emoji="🧔" label="করিম" sub="৳৪,০০০ চাই" />
      <DiagramEdge segment={{ x1: 690, y1: 163, x2: 632, y2: 163 }} />
    </g>
  );
}

function ManagerChoices() {
  return (
    <g>
      <DiagramEdge segment={{ x1: 545, y1: 192, x2: 480, y2: 248 }} />
      <DiagramEdge segment={{ x1: 575, y1: 192, x2: 665, y2: 248 }} />
      <InfoBox
        x={385}
        y={250}
        width={180}
        height={60}
        title="CP: লাইন ফিরলে আসুন"
        lines={["হিসাব ঠিক, সেবা নেই"]}
        tone="ok"
      />
      <InfoBox
        x={580}
        y={250}
        width={180}
        height={60}
        title="AP: দিয়ে দিই"
        lines={["সেবা পেল, পরে −৳৩,০০০"]}
        tone="warn"
      />
    </g>
  );
}

/** Analogy illustration: bank branches whose phone line is cut. */
export function Day008Analogy() {
  return (
    <svg viewBox="0 0 770 330" width="100%">
      <CutPhoneLine />
      <Branches />
      <Brothers />
      <ManagerChoices />
    </svg>
  );
}
