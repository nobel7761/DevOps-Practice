import type { ReactNode } from "react";
import MarkCompleteButton from "@/components/shared/MarkCompleteButton";
import { Card, CardContent } from "@/components/shared/shadcn";

export default function PartPanel({
  title,
  contentId,
  children,
}: {
  title: string;
  contentId: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <MarkCompleteButton contentKey={contentId} type="video" />
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
