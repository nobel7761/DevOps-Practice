"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthProvider>
        {children}
        <ThemeToggle />
      </AuthProvider>
    </ThemeProvider>
  );
}
