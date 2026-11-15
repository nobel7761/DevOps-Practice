"use client";

import LanguageToggle from "@/components/shared/LanguageToggle";
import ThemeToggle from "@/components/shared/ThemeToggle";
import UserMenu from "@/components/auth/UserMenu";

/** One floating pill (language · theme · account) pinned top-right on every page. */
export default function TopControls() {
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-1.5 rounded-full border border-border bg-background/80 p-1 shadow-sm backdrop-blur-md">
      <LanguageToggle />
      <ThemeToggle />
      <UserMenu />
    </div>
  );
}
