"use client";

import { useWatch } from "react-hook-form";
import { FormInput } from "@/components/shared/form";
import PasswordStrengthChecklist from "@/components/shared/PasswordStrengthChecklist";

/** Password + live checklist + re-type, for register and reset. Must be rendered inside RHFZodForm. */
export default function NewPasswordFields({
  label = "Password",
}: {
  label?: string;
}) {
  const password = useWatch({ name: "password" }) as string | undefined;
  return (
    <>
      <FormInput
        name="password"
        label={label}
        type="password"
        showPasswordToggle
        required
        autoComplete="new-password"
      />
      <PasswordStrengthChecklist password={password ?? ""} />
      <FormInput
        name="confirmPassword"
        label="Re-type password"
        type="password"
        showPasswordToggle
        required
        autoComplete="new-password"
      />
    </>
  );
}
