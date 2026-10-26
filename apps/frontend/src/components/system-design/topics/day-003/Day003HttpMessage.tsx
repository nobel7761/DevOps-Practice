// HTTP request and response side by side: start line, headers, blank line, body.

type Part = "start" | "header" | "blank" | "body";

const PART_COLOR: Record<Part, string> = {
  start: "var(--sd-client)",
  header: "var(--sd-server)",
  blank: "var(--sd-edge)",
  body: "var(--sd-database)",
};

const PART_LABEL: Record<Part, string> = {
  start: "প্রথম লাইন",
  header: "Header",
  blank: "খালি লাইন",
  body: "Body",
};

const REQUEST: [Part, string][] = [
  ["start", "GET /books?q=jibanananda HTTP/1.1"],
  ["header", "Host: www.boighor.com"],
  ["header", "Accept: text/html"],
  ["header", "Cookie: session=a8f3k2"],
  ["blank", ""],
  ["body", "(GET-এ সাধারণত body নেই)"],
];

const RESPONSE: [Part, string][] = [
  ["start", "HTTP/1.1 200 OK"],
  ["header", "Content-Type: text/html"],
  ["header", "Cache-Control: max-age=60"],
  ["header", "Set-Cookie: lang=bn"],
  ["blank", ""],
  ["body", "<!doctype html> ..."],
];

const LINE = 26;
const PANEL_W = 360;
const TOP = 56;

function Panel({
  x,
  title,
  sub,
  lines,
}: {
  x: number;
  title: string;
  sub: string;
  lines: [Part, string][];
}) {
  // One bracket per run of same-part lines, labelled on the right.
  const runs: { part: Part; from: number; to: number }[] = [];
  lines.forEach(([part], i) => {
    const last = runs[runs.length - 1];
    if (last && last.part === part) last.to = i;
    else runs.push({ part, from: i, to: i });
  });

  return (
    <g>
      <text x={x} y={20} fontSize={14} fontWeight={700} fill="var(--sd-label)">
        {title}
      </text>
      <text x={x} y={38} fontSize={11} fill="var(--sd-edge)">
        {sub}
      </text>
      <rect
        x={x}
        y={TOP - 18}
        width={PANEL_W - 90}
        height={lines.length * LINE + 12}
        rx={8}
        fill="var(--sd-canvas)"
        stroke="var(--sd-edge)"
      />
      {lines.map(([part, text], i) => (
        <text
          key={i}
          x={x + 10}
          y={TOP + i * LINE}
          fontSize={12}
          fontFamily="ui-monospace, monospace"
          fontWeight={part === "start" ? 700 : 400}
          fill={part === "body" ? "var(--sd-edge)" : "var(--sd-label)"}
        >
          {text}
        </text>
      ))}
      {runs.map((run) => {
        const bx = x + PANEL_W - 82;
        const y1 = TOP + run.from * LINE - 14;
        const y2 = TOP + run.to * LINE + 6;
        const color = PART_COLOR[run.part];
        return (
          <g key={`${run.part}-${run.from}`}>
            <path
              d={`M ${bx} ${y1} h 6 V ${y2} h -6`}
              fill="none"
              stroke={color}
              strokeWidth={2}
            />
            <text
              x={bx + 12}
              y={(y1 + y2) / 2}
              dominantBaseline="central"
              fontSize={11}
              fontWeight={700}
              fill={color}
            >
              {PART_LABEL[run.part]}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Request and response share one shape: start line, headers, blank line, optional body. */
export function Day003HttpMessage() {
  return (
    <svg
      viewBox={`0 0 ${PANEL_W * 2 + 20} ${TOP + REQUEST.length * LINE + 10}`}
      width="100%"
    >
      <Panel
        x={0}
        title="Request (Browser → Server)"
        sub="method · path · version"
        lines={REQUEST}
      />
      <Panel
        x={PANEL_W + 20}
        title="Response (Server → Browser)"
        sub="version · status code · reason"
        lines={RESPONSE}
      />
    </svg>
  );
}
