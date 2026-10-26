"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import CustomButton from "@/components/shared/CustomButton";
import useAPI from "@/hooks/api/useAPI";

export default function FetchLatestContentsButton({
  disabled,
  lastFetchedAt,
  onFetched,
}: {
  disabled: boolean;
  lastFetchedAt: string | null;
  onFetched: () => void;
}) {
  const {
    data,
    error,
    loading,
    callApi: fetchContents,
  } = useAPI<{ fetchedAt: string }>({
    url: "/poridhi-sync/fetch",
    method: "POST",
    lazy: true,
    // A full-course sync walks every module and fetches video metadata for
    // every pre_class/live_class item — comfortably over axios's default
    // 30s timeout, so this needs a much longer budget (same idea as the
    // translate endpoints' 120s timeout elsewhere in this app).
    timeout: 300000,
  });

  useEffect(() => {
    if (!data) return;
    toast.success("Latest content fetched");
    onFetched();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (!error) return;
    toast.error("Fetch failed", {
      description:
        error.message ?? "Token expired হতে পারে — নতুন token paste করুন।",
    });
  }, [error]);

  return (
    <div className="mb-8 flex flex-wrap items-center gap-3">
      <CustomButton
        variant="primary"
        disabled={disabled || loading}
        onClick={() => fetchContents()}
      >
        {loading
          ? "Fetching... (একটু সময় লাগতে পারে)"
          : "Fetch Latest Contents"}
      </CustomButton>
      {lastFetchedAt && (
        <span className="text-xs text-muted-foreground">
          Last fetched: {new Date(lastFetchedAt).toLocaleString()}
        </span>
      )}
    </div>
  );
}
