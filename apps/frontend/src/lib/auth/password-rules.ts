import { z } from "zod";

/** Same rules as the backend (apps/backend/src/auth/password-policy.ts). */
export const PASSWORD_RULES = [
  {
    id: "length",
    label: "8-16 characters",
    test: (pw: string) => pw.length >= 8 && pw.length <= 16,
  },
  {
    id: "upper",
    label: "An uppercase letter (A-Z)",
    test: (pw: string) => /[A-Z]/.test(pw),
  },
  {
    id: "lower",
    label: "A lowercase letter (a-z)",
    test: (pw: string) => /[a-z]/.test(pw),
  },
  {
    id: "number",
    label: "A number (0-9)",
    test: (pw: string) => /[0-9]/.test(pw),
  },
  {
    id: "special",
    label: "A special character (!@#$...)",
    test: (pw: string) => /[^A-Za-z0-9]/.test(pw),
  },
] as const;

export type PasswordRuleResult = { id: string; label: string; passed: boolean };

export const checkPasswordRules = (password: string): PasswordRuleResult[] =>
  PASSWORD_RULES.map(({ id, label, test }) => ({
    id,
    label,
    passed: test(password),
  }));

export const passwordSchema = z
  .string()
  .refine((pw) => PASSWORD_RULES.every((rule) => rule.test(pw)), {
    message: "Password doesn't meet all the requirements below",
  });

/** password + confirmPassword pair, shared by register and reset forms. */
export const newPasswordFields = {
  password: passwordSchema,
  confirmPassword: z.string().min(1, "Please re-type your password"),
};

export const passwordsMatch = <
  T extends { password: string; confirmPassword: string },
>(
  schema: z.ZodType<T>,
) =>
  schema.refine((v) => v.password === v.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
