import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/shared/shadcn";

export default function LabComingSoonPanel({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>
          <h3 className="font-medium">{title}</h3>
        </div>
        <Badge variant="secondary">শীঘ্রই আসছে</Badge>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
