import type { DiagramKind } from "@/components/shared/diagram";
import { kindColor, kindSoftColor } from "@/components/shared/diagram";

// Where caches live: one request passes these layers from the user's device
// to the disk; each layer can answer and stop the request early.

interface Layer {
  name: string;
  kind: DiagramKind;
  where: string;
  holds: string;
  cost: string;
}

const LAYERS: Layer[] = [
  {
    name: "Browser / app cache",
    kind: "client",
    where: "User-এর device",
    holds: "ছবি, JS, CSS, GET response",
    cost: "network-ই লাগে না",
  },
  {
    name: "CDN edge (Day 11)",
    kind: "cdn",
    where: "User-এর কাছের শহর",
    holds: "static file, public page",
    cost: "~১০-৩০ms",
  },
  {
    name: "Reverse proxy / gateway (Day 15-16)",
    kind: "gateway",
    where: "আপনার datacenter-এর দরজা",
    holds: "পুরো HTTP response",
    cost: "app-এ যেতেই হয় না",
  },
  {
    name: "App in-memory (local)",
    kind: "server",
    where: "App process-এর RAM",
    holds: "object, config, ছোট গরম data",
    cost: "~১০০ns-µs",
  },
  {
    name: "Distributed cache (Redis/Memcached)",
    kind: "cache",
    where: "আলাদা server, সব app-এর ভাগে",
    holds: "query ফল, object, session",
    cost: "~০.৫-১ms (network)",
  },
  {
    name: "DB buffer cache (Day 10)",
    kind: "database",
    where: "Database-এর RAM",
    holds: "disk-এর page (৮KB)",
    cost: "query তবুও চলে",
  },
];

const W = 760;
const ROW_H = 46;
const TOP = 34;
const H = TOP + LAYERS.length * ROW_H + 40;

/** Internal structure: the cache layers a request passes on its way to the disk. */
export function Day017Layers() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%">
      {["স্তর", "কোথায়", "কী রাখে", "খরচ"].map((head, i) => (
        <text
          key={head}
          x={[20, 300, 470, 640][i]}
          y={20}
          fontSize={12}
          fontWeight={700}
          fill="var(--sd-edge)"
        >
          {head}
        </text>
      ))}
      {LAYERS.map((layer, i) => {
        const y = TOP + i * ROW_H;
        return (
          <g key={layer.name}>
            <rect
              x={10}
              y={y}
              width={W - 20}
              height={ROW_H - 8}
              rx={8}
              fill={kindSoftColor(layer.kind)}
              stroke={kindColor(layer.kind)}
              strokeWidth={1.5}
            />
            <text
              x={20}
              y={y + (ROW_H - 8) / 2}
              dominantBaseline="central"
              fontSize={12}
              fontWeight={700}
              fill="var(--sd-label)"
            >
              {layer.name}
            </text>
            {[layer.where, layer.holds, layer.cost].map((text, j) => (
              <text
                key={text}
                x={[300, 470, 640][j]}
                y={y + (ROW_H - 8) / 2}
                dominantBaseline="central"
                fontSize={11}
                fill="var(--sd-label)"
              >
                {text}
              </text>
            ))}
          </g>
        );
      })}
      <text
        x={W / 2}
        y={H - 12}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        উপরের স্তর যত আগে উত্তর দেয়, নিচের স্তরে তত কম চাপ। সবার নিচে disk।
        (সময়গুলো আনুমানিক)
      </text>
    </svg>
  );
}
