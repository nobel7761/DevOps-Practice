"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type Language = "en" | "bn";

interface LanguageContextValue {
  language: Language;
  toggle: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "bn") setLanguage(stored);
    } catch {
      // localStorage unavailable (private mode, etc.) — default stays "en".
    }
  }, []);

  const toggle = () => {
    setLanguage((prev) => {
      const next: Language = prev === "en" ? "bn" : "en";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // per-viewer convenience only — fine if it doesn't persist
      }
      return next;
    });
  };

  return (
    <LanguageContext.Provider value={{ language, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
