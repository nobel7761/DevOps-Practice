import { DiagramEdge } from "@/components/shared/diagram";

// Clustered (InnoDB) vs heap (PostgreSQL): where the row lives, and what a secondary index stores.

const MONO = "ui-monospace, Menlo, monospace";

function Box({
  x,
  y,
  w,
  h,
  title,
  lines,
  kind,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  lines: string[];
  kind: "index" | "data";
}) {
  const stroke = kind === "index" ? "var(--sd-client)" : "var(--sd-database)";
  const fill =
    kind === "index" ? "var(--sd-client-soft)" : "var(--sd-database-soft)";
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.8}
      />
      <text
        x={x + 10}
        y={y + 20}
        fontSize={12}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {title}
      </text>
      {lines.map((line, i) => (
        <text
          key={line}
          x={x + 10}
          y={y + 42 + i * 18}
          fontSize={11}
          fontFamily={MONO}
          fill="var(--sd-label)"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function PanelTitle({
  x,
  title,
  sub,
}: {
  x: number;
  title: string;
  sub: string;
}) {
  return (
    <g>
      <text x={x} y={20} fontSize={14} fontWeight={700} fill="var(--sd-label)">
        {title}
      </text>
      <text x={x} y={38} fontSize={11} fill="var(--sd-edge)">
        {sub}
      </text>
    </g>
  );
}

function InnoDbPanel() {
  return (
    <g>
      <PanelTitle
        x={10}
        title="MySQL InnoDB: clustered index"
        sub="Table-টাই primary key-র B+tree"
      />
      <Box
        x={10}
        y={60}
        w={320}
        h={84}
        kind="index"
        title="১. Secondary index (email)"
        lines={["rahim@x.com → PK 42", "salma@x.com → PK 7"]}
      />
      <DiagramEdge
        segment={{ x1: 170, y1: 146, x2: 170, y2: 196 }}
        label="২. PK 42 দিয়ে আবার খোঁজা"
        tone="active"
      />
      <Box
        x={10}
        y={198}
        w={320}
        h={84}
        kind="data"
        title="Clustered index (PK) · leaf-এ পুরো row"
        lines={["7  | salma@x.com | Sylhet", "42 | rahim@x.com | Dhaka"]}
      />
      <text x={10} y={306} fontSize={11} fill="var(--sd-edge)">
        PK দিয়ে খুঁজলে এক tree-তেই শেষ; বড় PK = সব secondary index বড়
      </text>
    </g>
  );
}

function PostgresPanel() {
  return (
    <g>
      <PanelTitle
        x={380}
        title="PostgreSQL: heap table"
        sub="Row এলোমেলো heap-এ; সব index সমান"
      />
      <Box
        x={380}
        y={60}
        w={160}
        h={84}
        kind="index"
        title="users_pkey"
        lines={["42 → (17,3)", "7 → (2,5)"]}
      />
      <Box
        x={555}
        y={60}
        w={160}
        h={84}
        kind="index"
        title="idx_email"
        lines={["rahim@… → (17,3)", "salma@… → (2,5)"]}
      />
      <DiagramEdge
        segment={{ x1: 460, y1: 146, x2: 520, y2: 196 }}
        tone="active"
      />
      <DiagramEdge
        segment={{ x1: 635, y1: 146, x2: 575, y2: 196 }}
        label="TID"
        tone="active"
      />
      <Box
        x={380}
        y={198}
        w={335}
        h={84}
        kind="data"
        title="Heap (table) · page, slot"
        lines={[
          "(2,5)  7  | salma@x.com | Sylhet",
          "(17,3) 42 | rahim@x.com | Dhaka",
        ]}
      />
      <text x={380} y={306} fontSize={11} fill="var(--sd-edge)">
        যেকোনো index → সরাসরি TID; row সরলে index-ও বদলায়
      </text>
    </g>
  );
}

/** Clustered vs non-clustered storage, side by side. */
export function Day022Clustered() {
  return (
    <svg viewBox="0 0 725 320" width="100%">
      <InnoDbPanel />
      <PostgresPanel />
    </svg>
  );
}
