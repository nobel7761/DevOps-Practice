"use client";

import { useState } from "react";
import { authErrorMessage } from "@/lib/api/auth";

/** Wraps a form submit so a failed request becomes a banner message instead of an unhandled rejection. */
export function useAuthSubmit<T>(action: (values: T) => Promise<void>) {
  const [error, setError] = useState<string | null>(null);
  const onSubmit = async (values: T) => {
    setError(null);
    try {
      await action(values);
    } catch (err) {
      setError(authErrorMessage(err));
    }
  };
  return { error, onSubmit };
}
