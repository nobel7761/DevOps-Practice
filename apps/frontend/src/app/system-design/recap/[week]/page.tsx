import { notFound } from "next/navigation";
import { RecapScreen } from "@/components/system-design/recap/RecapScreen";
import { getRecap } from "@/lib/data/system-design/recaps";

export default async function WeeklyRecapPage({
  params,
}: {
  params: Promise<{ week: string }>;
}) {
  const { week } = await params;
  const recap = getRecap(Number(week));
  if (!recap) notFound();
  return <RecapScreen recap={recap} />;
}
