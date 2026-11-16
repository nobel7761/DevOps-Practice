import { RefreshCw, ServerCrash } from "lucide-react";
import { Button } from "@/components/shared/shadcn";

/** Shown instead of an endless spinner when the API can't be reached (e.g. 502 from the backend host). */
export default function ServerUnavailable({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
      <ServerCrash className="size-10 text-muted-foreground" />
      <p className="font-medium">We can&apos;t reach the server right now</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        The service may be starting up or temporarily down. Please try again in
        a minute.
      </p>
      <Button variant="outline" onClick={onRetry}>
        <RefreshCw /> Try again
      </Button>
    </div>
  );
}
