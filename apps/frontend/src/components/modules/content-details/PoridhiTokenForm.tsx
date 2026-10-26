"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import CustomButton from "@/components/shared/CustomButton";
import { Textarea } from "@/components/shared/shadcn";
import useAPI from "@/hooks/api/useAPI";

export default function PoridhiTokenForm({
  hasToken,
  onSaved,
}: {
  hasToken: boolean;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState("");
  const {
    data,
    loading,
    callApi: saveToken,
  } = useAPI<{ saved: true }, { token: string }>({
    url: "/poridhi-sync/token",
    method: "POST",
    lazy: true,
  });

  useEffect(() => {
    if (!data) return;
    toast.success("Token saved");
    setDraft("");
    onSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <div className="mb-6 rounded-lg border border-border p-4">
      <h2 className="font-semibold">poridhi.io Access Token</h2>
      <p className="mb-3 text-xs text-muted-foreground">
        {hasToken
          ? "একটা token save করা আছে — expire হয়ে গেলে এখানে একটা fresh token paste করুন।"
          : "এখনো কোনো token save করা হয়নি। poridhi.io-তে login করে browser DevTools → Application → Local Storage → access_token থেকে copy করুন।"}
      </p>
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="access_token এখানে paste করুন..."
        className="mb-2 min-h-16 font-mono text-xs"
        disabled={loading}
      />
      <CustomButton
        variant="secondary"
        disabled={!draft.trim() || loading}
        onClick={() => saveToken({ token: draft.trim() })}
      >
        {loading ? "Saving..." : "Save Token"}
      </CustomButton>
    </div>
  );
}
