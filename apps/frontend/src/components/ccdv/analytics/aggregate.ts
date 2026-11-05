import { domainPercent, type DomainTally } from "@/lib/ccdv/scoring";
import type { AttemptRecord } from "@/lib/ccdv/storage";
import { DOMAIN_IDS } from "@/lib/data/ccdv/blueprint";
import type { DomainId } from "@/lib/data/ccdv/types";

/** Sums domain tallies over every attempt. */
export function totalsByDomain(
  attempts: AttemptRecord[],
): Record<DomainId, DomainTally> {
  const totals = Object.fromEntries(
    DOMAIN_IDS.map((id) => [id, { correct: 0, total: 0 }]),
  ) as Record<DomainId, DomainTally>;
  for (const attempt of attempts) {
    for (const id of DOMAIN_IDS) {
      totals[id].correct += attempt.result.byDomain[id]?.correct ?? 0;
      totals[id].total += attempt.result.byDomain[id]?.total ?? 0;
    }
  }
  return totals;
}

/** Domains under 70% over all attempts, weakest first. */
export function weakDomains(attempts: AttemptRecord[]): DomainId[] {
  const totals = totalsByDomain(attempts);
  return DOMAIN_IDS.filter((id) => {
    const percent = domainPercent(totals[id]);
    return percent !== null && percent < 70;
  }).sort(
    (a, b) => (domainPercent(totals[a]) ?? 0) - (domainPercent(totals[b]) ?? 0),
  );
}

export function averageSecondsPerQuestion(attempt: AttemptRecord): number {
  const spent = Object.values(attempt.timeSpent).reduce(
    (sum, value) => sum + value,
    0,
  );
  return attempt.result.total === 0
    ? 0
    : Math.round(spent / attempt.result.total);
}
