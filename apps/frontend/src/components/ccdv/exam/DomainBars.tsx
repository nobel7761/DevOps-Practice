import { cn } from "@/lib/utils";
import { domainPercent, type DomainTally } from "@/lib/ccdv/scoring";
import { DOMAINS } from "@/lib/data/ccdv/blueprint";
import type { DomainId } from "@/lib/data/ccdv/types";

/** Per-domain % correct, like the official score report. Bars under 70% are marked weak. */
export default function DomainBars({
  byDomain,
}: {
  byDomain: Record<DomainId, DomainTally>;
}) {
  return (
    <ul className="flex flex-col gap-2">
      {DOMAINS.map((domain) => {
        const tally = byDomain[domain.id];
        const percent = domainPercent(tally);
        if (percent === null) return null;
        return (
          <li key={domain.id} className="text-sm">
            <div className="mb-1 flex justify-between gap-2">
              <span>
                D{domain.id} · {domain.name}
              </span>
              <span className="font-mono">
                {tally.correct}/{tally.total} ({percent}%)
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded bg-muted">
              <div
                className={cn(
                  "h-full",
                  percent >= 70 ? "bg-green-600" : "bg-red-500",
                )}
                style={{ width: `${percent}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
