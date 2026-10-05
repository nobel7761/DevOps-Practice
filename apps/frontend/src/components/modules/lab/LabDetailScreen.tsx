import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/shared/shadcn";
import LabHeader from "@/components/modules/lab/LabHeader";
import LabInstructions from "@/components/modules/lab/LabInstructions";
import type { LabContent } from "@/lib/data/lab-content";

export default function LabDetailScreen({ lab }: { lab: LabContent }) {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/module"
        className="mb-4 inline-block text-sm text-muted-foreground hover:underline"
      >
        ← Back to modules
      </Link>
      <Card>
        <CardHeader>
          <LabHeader lab={lab} />
        </CardHeader>
        <CardContent>
          <LabInstructions markdown={lab.markdown} />
        </CardContent>
      </Card>
    </main>
  );
}
