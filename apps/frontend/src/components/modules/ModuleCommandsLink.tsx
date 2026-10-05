import Link from "next/link";
import { BookOpenText } from "lucide-react";
import { Button } from "@/components/shared/shadcn";

export default function ModuleCommandsLink({ moduleId }: { moduleId: string }) {
  return (
    <Button asChild variant="outline" size="sm">
      <Link href={`/module/commands/${moduleId}`}>
        <BookOpenText /> এই module-এর সব Command শিখুন
      </Link>
    </Button>
  );
}
