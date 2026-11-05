"use client";

import { Card, CardContent } from "@/components/shared/shadcn";
import DomainBars from "../exam/DomainBars";
import AttemptTable from "./AttemptTable";
import SummaryTiles from "./SummaryTiles";
import TrendBars from "./TrendBars";
import WeakAreas from "./WeakAreas";
import { totalsByDomain, weakDomains } from "./aggregate";
import { useAttempts } from "./useAttempts";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent>
        <h3 className="mb-3 text-base font-semibold">{title}</h3>
        {children}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsScreen() {
  const attempts = useAttempts();
  if (attempts === null) return null;
  if (attempts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        এখনো কোনো Mock Exam দাওনি। প্রথম exam দিলেই এখানে score, domain-wise
        analysis ও trend দেখা যাবে।
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <SummaryTiles attempts={attempts} />
      <Section title="Score trend (dashed line = 720 pass)">
        <TrendBars attempts={attempts} />
      </Section>
      <Section title="Domain-wise % correct (সব attempt মিলিয়ে)">
        <DomainBars byDomain={totalsByDomain(attempts)} />
      </Section>
      <Section title="দুর্বল area (৭০%-এর নিচে)">
        <WeakAreas domains={weakDomains(attempts)} />
      </Section>
      <Section title="সব attempt">
        <AttemptTable attempts={attempts} />
      </Section>
    </div>
  );
}
