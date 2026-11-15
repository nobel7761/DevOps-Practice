"use client";

import LanguageToggle from "@/components/shared/LanguageToggle";
import ThemeToggle from "@/components/shared/ThemeToggle";
import UserMenu from "@/components/auth/UserMenu";

/**
 * One pill (language · theme · account) on every page. On phones it sits in the
 * page flow above the content so it can't cover headers; from `sm` up it floats top-right.
 */
export default function TopControls() {
  return (
    <div className="flex justify-end px-4 pt-3 sm:fixed sm:top-4 sm:right-4 sm:z-50 sm:p-0">
      <div className="flex items-center gap-1.5 rounded-full border border-border bg-background/80 p-1 shadow-sm backdrop-blur-md">
        <LanguageToggle />
        <ThemeToggle />
        <UserMenu />
      </div>
    </div>
  );
}
