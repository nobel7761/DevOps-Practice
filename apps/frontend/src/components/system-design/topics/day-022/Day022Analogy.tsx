import { DiagramEdge } from "@/components/shared/diagram";

// Analogy: the grocery shop's credit ledger (বাকির খাতা) with an alphabetical name index at the back.

const SUCHI = [
  { name: "করিম", pages: "১২, ৮৮" },
  { name: "জামাল", pages: "৪৫" },
  { name: "রহিম চাচা", pages: "৭, ১৩১, ৪০২", hit: true },
  { name: "সালমা আপা", pages: "২০৯" },
];

const LEDGER_PAGES = [
  { page: "পাতা ৭", line: "রহিম চাচা · চাল ১২০৳" },
  { page: "পাতা ১৩১", line: "রহিম চাচা · তেল ৩৫০৳" },
  { page: "পাতা ৪০২", line: "রহিম চাচা · ডিম ৮০৳" },
];

function Shopkeeper() {
  return (
    <g>
      <circle
        cx={60}
        cy={130}
        r={30}
        fill="var(--sd-user-soft)"
        stroke="var(--sd-user)"
        strokeWidth={1.5}
      />
      <text
        x={60}
        y={130}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={26}
      >
        🧔
      </text>
      <text
        x={60}
        y={178}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        দোকানদার
      </text>
      <text
        x={60}
        y={60}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        {'"রহিম চাচার'}
      </text>
      <text
        x={60}
        y={76}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        {'বাকি কত?"'}
      </text>
    </g>
  );
}

function SuchiPage() {
  return (
    <g>
      <rect
        x={160}
        y={40}
        width={232}
        height={180}
        rx={10}
        fill="var(--sd-database-soft)"
        stroke="var(--sd-database)"
        strokeWidth={2}
      />
      <text
        x={276}
        y={64}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        📑 শেষের সূচি (নাম অনুযায়ী)
      </text>
      {SUCHI.map((row, i) => (
        <g key={row.name}>
          <rect
            x={174}
            y={80 + i * 32}
            width={204}
            height={26}
            rx={4}
            fill="var(--sd-canvas)"
            stroke={row.hit ? "var(--primary)" : "var(--sd-database)"}
            strokeWidth={row.hit ? 2.5 : 1}
          />
          <text
            x={184}
            y={93 + i * 32}
            dominantBaseline="central"
            fontSize={11.5}
            fontWeight={row.hit ? 700 : 400}
            fill="var(--sd-label)"
          >
            {row.name} → পাতা {row.pages}
          </text>
        </g>
      ))}
      <text
        x={276}
        y={244}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        = Index (sorted, ছোট)
      </text>
    </g>
  );
}

function Ledger() {
  return (
    <g>
      <rect
        x={470}
        y={20}
        width={230}
        height={210}
        rx={10}
        fill="var(--sd-canvas)"
        stroke="var(--sd-database)"
        strokeWidth={2}
        strokeDasharray="6 4"
      />
      <text
        x={585}
        y={44}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        📒 বাকির খাতা (৫০০ পাতা)
      </text>
      <text
        x={585}
        y={62}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        তারিখ অনুযায়ী লেখা, নাম এলোমেলো
      </text>
      {LEDGER_PAGES.map((p, i) => (
        <g key={p.page}>
          <rect
            x={486}
            y={78 + i * 48}
            width={198}
            height={38}
            rx={4}
            fill="var(--sd-database-soft)"
            stroke="var(--sd-database)"
          />
          <text
            x={496}
            y={92 + i * 48}
            fontSize={11}
            fontWeight={700}
            fill="var(--sd-label)"
          >
            {p.page}
          </text>
          <text x={496} y={108 + i * 48} fontSize={11} fill="var(--sd-label)">
            {p.line}
          </text>
        </g>
      ))}
      <text
        x={585}
        y={252}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        = Table (আসল data)
      </text>
    </g>
  );
}

/** Analogy illustration: look the name up in the sorted back-index, then jump straight to those pages. */
export function Day022Analogy() {
  return (
    <svg viewBox="0 0 720 270" width="100%">
      <Shopkeeper />
      <DiagramEdge
        segment={{ x1: 92, y1: 130, x2: 158, y2: 130 }}
        label="১. নাম"
        tone="active"
      />
      <SuchiPage />
      {LEDGER_PAGES.map((p, i) => (
        <DiagramEdge
          key={p.page}
          segment={{ x1: 380, y1: 157, x2: 484, y2: 97 + i * 48 }}
          label={i === 0 ? "২. পাতা" : undefined}
          tone="active"
        />
      ))}
      <Ledger />
    </svg>
  );
}
