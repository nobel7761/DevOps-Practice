"use client";

import { Check, X } from "lucide-react";
import {
  checkPasswordRules,
  type PasswordRuleResult,
} from "@/lib/auth/password-rules";

function ChecklistItem({ rule }: { rule: PasswordRuleResult }) {
  const Icon = rule.passed ? Check : X;
  return (
    <li
      className={`flex items-center gap-2 text-sm transition-colors ${
        rule.passed
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-muted-foreground"
      }`}
    >
      <span
        className={`flex size-4 items-center justify-center rounded-full ${
          rule.passed ? "bg-emerald-500/15" : "bg-muted"
        }`}
      >
        <Icon className="size-3" strokeWidth={3} />
      </span>
      {rule.label}
    </li>
  );
}

/** Live list of password requirements, each ticked as soon as it's met. */
export default function PasswordStrengthChecklist({
  password,
}: {
  password: string;
}) {
  const rules = checkPasswordRules(password ?? "");
  return (
    <ul
      className="grid gap-1.5 rounded-xl border border-border bg-muted/40 p-3"
      aria-live="polite"
    >
      {rules.map((rule) => (
        <ChecklistItem key={rule.id} rule={rule} />
      ))}
    </ul>
  );
}
