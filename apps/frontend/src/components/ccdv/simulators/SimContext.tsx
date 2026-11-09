"use client";

import { createContext, useContext, type ReactNode } from "react";

export interface SimContextValue {
  chapterId: string;
  /** "s<block index>": identifies this simulator inside the chapter. */
  simKey: string;
}

const SimContext = createContext<SimContextValue | null>(null);

/** Tells a simulator which chapter/block it sits in, so it can save its answers. Only set where the submit flow is on. */
export function SimContextProvider({
  value,
  children,
}: {
  value: SimContextValue;
  children: ReactNode;
}) {
  return <SimContext.Provider value={value}>{children}</SimContext.Provider>;
}

export function useSimContext(): SimContextValue | null {
  return useContext(SimContext);
}
