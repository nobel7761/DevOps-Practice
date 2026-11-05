"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Loader from "@/components/shared/Loader";
import useAPI from "@/hooks/api/useAPI";
import TranscriptEditForm from "./TranscriptEditForm";
import TranscriptView from "./TranscriptView";

interface NoteDto {
  contentId: string;
  content: string;
}

export default function TranscriptModalBody({
  contentId,
  onSaved,
  onDone,
}: {
  contentId: string;
  onSaved: (hasContent: boolean) => void;
  onDone: () => void;
}) {
  const [editing, setEditing] = useState(false);

  const {
    data,
    loading,
    callApi: fetchNote,
  } = useAPI<NoteDto>({ url: `/notes/${contentId}`, lazy: true });
  const {
    data: saved,
    callApi: saveNote,
    loading: saving,
  } = useAPI<NoteDto, { content: string }>({
    url: `/notes/${contentId}`,
    method: "PUT",
    lazy: true,
  });

  useEffect(() => {
    fetchNote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId]);

  useEffect(() => {
    if (!saved) return;
    toast.success("Transcript saved", {
      description: "Transcript সফলভাবে add হয়েছে।",
    });
    onSaved(saved.content.trim().length > 0);
    onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved]);

  if (loading) return <Loader />;

  const existing = data?.content ?? "";
  const hasExisting = existing.trim().length > 0;

  if (hasExisting && !editing) {
    return (
      <TranscriptView content={existing} onEdit={() => setEditing(true)} />
    );
  }

  return (
    <TranscriptEditForm
      initialValue={existing}
      saving={saving}
      onSubmit={(content) => saveNote({ content })}
      onCancel={hasExisting ? () => setEditing(false) : undefined}
    />
  );
}
