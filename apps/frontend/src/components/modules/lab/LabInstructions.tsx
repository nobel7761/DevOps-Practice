"use client";

import { useEffect, useState } from "react";
import Markdown from "@/components/shared/Markdown";
import { useLanguage } from "@/contexts/LanguageContext";
import client from "@/lib/api/client";

export default function LabInstructions({
  labId,
  markdown,
}: {
  labId: string;
  markdown: string | null;
}) {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    if (language !== "bn" || !markdown || translated) return;
    let cancelled = false;
    setTranslating(true);
    client
      .post<{ markdown: string }>(
        `/translate/lab/${labId}`,
        { markdown },
        // A full lab's markdown can take the model well over axios's default
        // 30s timeout on a cache miss; cached hits return almost instantly.
        { timeout: 120000 },
      )
      .then((res) => {
        if (!cancelled) setTranslated(res.data.markdown);
      })
      .finally(() => {
        if (!cancelled) setTranslating(false);
      });
    return () => {
      cancelled = true;
    };
  }, [language, markdown, labId, translated]);

  if (!markdown) {
    return (
      <p className="text-sm text-muted-foreground">
        No instructions were found for this lab.
      </p>
    );
  }

  const displayMarkdown =
    language === "bn" && translated ? translated : markdown;

  return (
    <div className="text-sm">
      {language === "bn" && translating && !translated && (
        <p className="mb-3 text-xs text-muted-foreground">
          বাংলায় অনুবাদ হচ্ছে...
        </p>
      )}
      <Markdown>{displayMarkdown}</Markdown>
    </div>
  );
}
