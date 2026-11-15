// Two ways to carry identity: an opaque session id (looked up in a store)
// vs a JWT (verified locally, readable by anyone, valid until exp).

const W = 780;
const H = 300;

const JWT_PARTS = [
  {
    title: "Header",
    body: ['{"alg": "RS256",', ' "kid": "2026-11"}'],
    color: "var(--sd-gateway)",
    soft: "var(--sd-gateway-soft)",
  },
  {
    title: "Payload (claims)",
    body: ['{"sub": "42",', ' "role": "admin",', ' "exp": 1763000900}'],
    color: "var(--sd-cache)",
    soft: "var(--sd-cache-soft)",
  },
  {
    title: "Signature",
    body: ["private key দিয়ে", "header.payload-এ", "সই"],
    color: "var(--sd-database)",
    soft: "var(--sd-database-soft)",
  },
];

function Note({
  x,
  y,
  text,
  tone,
}: {
  x: number;
  y: number;
  text: string;
  tone?: "ok" | "fail";
}) {
  const fill =
    tone === "ok"
      ? "var(--sd-ok)"
      : tone === "fail"
        ? "var(--sd-fail)"
        : "var(--sd-edge)";
  return (
    <text x={x} y={y} fontSize={11} fill={fill}>
      {text}
    </text>
  );
}

function OpaquePanel() {
  return (
    <g>
      <text x={20} y={30} fontSize={14} fontWeight={700} fill="var(--sd-label)">
        Opaque session id (cookie)
      </text>
      <rect
        x={20}
        y={48}
        width={250}
        height={44}
        rx={8}
        fill="var(--sd-canvas)"
        stroke="var(--sd-edge)"
      />
      <text
        x={145}
        y={70}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontFamily="monospace"
        fill="var(--sd-label)"
      >
        sid=9f2c41d07be3a8…
      </text>
      <Note x={20} y={118} text="• 128-bit random, নিজে কিছুই বোঝায় না" />
      <Note x={20} y={140} text="• প্রতি request-এ store-এ lookup লাগে" />
      <Note x={20} y={162} text="• ছোট: ~৩২ character" tone="ok" />
      <Note
        x={20}
        y={184}
        text="• Logout = store থেকে DEL, সাথে সাথে"
        tone="ok"
      />
      <Note
        x={20}
        y={206}
        text="• Store down = কেউ login থাকে না"
        tone="fail"
      />
    </g>
  );
}

function JwtPanel() {
  const x0 = 320;
  const partW = 145;
  return (
    <g>
      <text x={x0} y={30} fontSize={14} fontWeight={700} fill="var(--sd-label)">
        JWT = header . payload . signature
      </text>
      {JWT_PARTS.map((part, i) => {
        const x = x0 + i * (partW + 8);
        return (
          <g key={part.title}>
            <rect
              x={x}
              y={48}
              width={partW}
              height={96}
              rx={8}
              fill={part.soft}
              stroke={part.color}
              strokeWidth={1.5}
            />
            <text
              x={x + 10}
              y={68}
              fontSize={12}
              fontWeight={700}
              fill="var(--sd-label)"
            >
              {part.title}
            </text>
            {part.body.map((line, j) => (
              <text
                key={line}
                x={x + 10}
                y={90 + j * 16}
                fontSize={10.5}
                fontFamily="monospace"
                fill="var(--sd-label)"
              >
                {line}
              </text>
            ))}
            {i < JWT_PARTS.length - 1 && (
              <text
                x={x + partW + 4}
                y={100}
                textAnchor="middle"
                fontSize={20}
                fontWeight={700}
                fill="var(--sd-label)"
              >
                .
              </text>
            )}
          </g>
        );
      })}
      <Note
        x={x0}
        y={170}
        text="• Base64url, encrypted না: যে কেউ payload পড়তে পারে"
        tone="fail"
      />
      <Note
        x={x0}
        y={192}
        text="• Public key দিয়ে local-এ verify, store lookup নেই"
        tone="ok"
      />
      <Note
        x={x0}
        y={214}
        text="• প্রতি request-এ পুরোটা যায়: প্রায়ই কয়েকশো byte"
      />
      <Note
        x={x0}
        y={236}
        text="• exp-এর আগে logout বা role বদল টের পায় না"
        tone="fail"
      />
      <Note x={x0} y={258} text="• kid দেখে কোন key, তাই key rotation সম্ভব" />
    </g>
  );
}

/** Opaque session id vs JWT, side by side. */
export function Day014TokenAnatomy() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%">
      <OpaquePanel />
      <line
        x1={296}
        y1={16}
        x2={296}
        y2={H - 16}
        stroke="var(--sd-edge)"
        strokeDasharray="4 4"
      />
      <JwtPanel />
    </svg>
  );
}
