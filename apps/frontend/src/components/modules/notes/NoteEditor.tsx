"use client";

import { useEffect, useState } from "react";
import CustomButton from "@/components/shared/CustomButton";
import { Textarea } from "@/components/shared/shadcn";
import useAPI from "@/hooks/api/useAPI";

interface NoteDto {
  contentId: string;
  content: string;
}

export default function NoteEditor({ contentId }: { contentId: string }) {
  const [draft, setDraft] = useState("");

  const {
    data,
    loading,
    callApi: fetchNote,
  } = useAPI<NoteDto>({
    url: `/notes/${contentId}`,
    lazy: true,
  });
  const { callApi: saveNote, loading: saving } = useAPI<
    NoteDto,
    { content: string }
  >({
    url: `/notes/${contentId}`,
    method: "PUT",
    lazy: true,
  });

  useEffect(() => {
    fetchNote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId]);

  useEffect(() => {
    if (data) setDraft(data.content);
  }, [data]);

  return (
    <div className="mt-2 flex flex-col gap-2 rounded-md border border-border bg-background/50 p-3">
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="এখানে আপনার transcript/নোট paste করুন..."
        className="min-h-24 text-sm"
        disabled={loading}
      />
      <CustomButton
        variant="secondary"
        className="self-end"
        disabled={saving}
        onClick={() => saveNote({ content: draft })}
      >
        {saving ? "Saving..." : "Save note"}
      </CustomButton>
    </div>
  );
}
