import { notFound } from "next/navigation";
import LabDetailScreen from "@/components/modules/lab/LabDetailScreen";
import { getLabContent } from "@/lib/data/lab-content";

export default async function LabPage({
  params,
}: {
  params: Promise<{ labId: string }>;
}) {
  const { labId } = await params;
  const lab = getLabContent(labId);

  if (!lab) {
    notFound();
  }

  return <LabDetailScreen lab={lab} />;
}
