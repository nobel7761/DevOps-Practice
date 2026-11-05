"use client";

import { useEffect, useState } from "react";
import { loadAttempts, type AttemptRecord } from "@/lib/ccdv/storage";

export function useAttempts(): AttemptRecord[] | null {
  const [attempts, setAttempts] = useState<AttemptRecord[] | null>(null);
  useEffect(() => {
    setAttempts(loadAttempts());
  }, []);
  return attempts;
}
