"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import TopControls from "@/components/shared/TopControls";
import { Toaster } from "@/components/shared/shadcn";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthProvider>
        <LanguageProvider>
          <TopControls />
          {children}
          <Toaster />
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
