"use client";

import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { Button } from "@/components/shared/shadcn";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageToggle() {
  const { language, toggle } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        aria-hidden
        className="invisible fixed top-4 right-16 z-50"
      />
    );
  }

  const isBangla = language === "bn";

  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed top-4 right-16 z-50"
      aria-label={isBangla ? "Switch to English" : "বাংলায় দেখুন"}
      title={isBangla ? "Switch to English" : "বাংলায় দেখুন"}
      onClick={toggle}
    >
      {isBangla ? <span className="text-xs font-bold">EN</span> : <Languages />}
    </Button>
  );
}
