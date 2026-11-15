import { z } from "zod";

/** Same rules as the backend (apps/backend/src/auth/password-policy.ts). */
const count = (pw: string, re: RegExp) => (pw.match(re) ?? []).length;

export const PASSWORD_RULES = [
  {
    id: "length",
    label: "8-48 characters",
    test: (pw: string) => pw.length >= 8 && pw.length <= 48,
  },
  {
    id: "upper",
    label: "At least 2 uppercase letters (A-Z)",
    test: (pw: string) => count(pw, /[A-Z]/g) >= 2,
  },
  {
    id: "lower",
    label: "At least 2 lowercase letters (a-z)",
    test: (pw: string) => count(pw, /[a-z]/g) >= 2,
  },
  {
    id: "number",
    label: "At least 2 numbers (0-9)",
    test: (pw: string) => count(pw, /[0-9]/g) >= 2,
  },
  {
    id: "special",
    label: "At least 2 special characters (!@#$...)",
    test: (pw: string) => count(pw, /[^A-Za-z0-9]/g) >= 2,
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
