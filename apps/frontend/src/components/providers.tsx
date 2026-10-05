"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { Toaster } from "@/components/shared/shadcn";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthProvider>
        {children}
        <ThemeToggle />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
