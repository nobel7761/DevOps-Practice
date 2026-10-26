"use client";

import { Check, Copy } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { toast } from "sonner";
import { Button } from "@/components/shared/shadcn";

/** Copies `text` to the clipboard and confirms with a toast. `beforeCopy` can veto (e.g. a confirm dialog). */
export default function CopyButton({
  text,
  label,
  beforeCopy,
  ...buttonProps
}: {
  text: string | (() => string);
  label: string;
  beforeCopy?: () => boolean | Promise<boolean>;
} & Omit<ComponentProps<typeof Button>, "onClick" | "children">) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (beforeCopy && !(await beforeCopy())) return;
    try {
      await navigator.clipboard.writeText(
        typeof text === "function" ? text() : text,
      );
      setCopied(true);
      toast.success("Copy হয়েছে");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy করা যায়নি। Browser clipboard-এর অনুমতি দিন।");
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={copy} {...buttonProps}>
      {copied ? <Check /> : <Copy />}
      {label}
    </Button>
  );
}
