"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Language } from "@/contexts/LanguageContext";

const OPTIONS: { id: Language; label: string; title: string }[] = [
  { id: "en", label: "EN", title: "English" },
  { id: "bn", label: "বাং", title: "বাংলা" },
];

/** Two-option segmented switch (English / বাংলা). */
export default function LanguageToggle() {
  const { language, toggle } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div
      role="group"
      aria-label="Language"
      className="flex rounded-full bg-muted p-0.5"
    >
      {OPTIONS.map(({ id, label, title }) => {
        const active = mounted && language === id;
        return (
          <button
            key={id}
            type="button"
            title={title}
            aria-pressed={active}
            onClick={() => language !== id && toggle()}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
