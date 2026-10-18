"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import CustomButton from "@/components/shared/CustomButton";
import client from "@/lib/api/client";

export default function MarkCompleteButton({
  contentKey,
  type,
}: {
  contentKey: string;
  type: "video" | "lab";
}) {
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    client
      .get<{ completedKeys: string[] }>("/progress")
      .then((res) => {
        if (!cancelled)
          setCompleted(res.data.completedKeys.includes(contentKey));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [contentKey]);

  const handleClick = async () => {
    if (completed || loading) return;
    setLoading(true);
    try {
      await client.post(`/progress/${type}/${contentKey}/complete`);
      setCompleted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomButton
      variant={completed ? "secondary" : "primary"}
      onClick={handleClick}
      disabled={completed || loading}
    >
      <Check className="size-4" />
      {completed ? "Completed" : "Mark as Completed"}
    </CustomButton>
  );
}
