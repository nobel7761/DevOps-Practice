"use client";

import { z } from "zod";
import {
  FormInput,
  FormSubmitButton,
  RHFZodForm,
} from "@/components/shared/form";
import { authApi } from "@/lib/api/auth";
import { newPasswordFields, passwordsMatch } from "@/lib/auth/password-rules";
import AuthCard from "./AuthCard";
import AuthLink from "./AuthLink";
import AuthMessage from "./AuthMessage";
import NewPasswordFields from "./NewPasswordFields";
import { useAuthSubmit } from "./useAuthSubmit";
import { useFinishLogin } from "./useFinishLogin";

const registerSchema = passwordsMatch(
  z.object({
    firstName: z.string().trim().min(1, "First name is required").max(50),
    lastName: z.string().trim().min(1, "Last name is required").max(50),
    email: z.email("Enter a valid email"),
    ...newPasswordFields,
  }),
);
type RegisterValues = z.infer<typeof registerSchema>;

function NameFields() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormInput
        name="firstName"
        label="First name"
        required
        autoComplete="given-name"
      />
      <FormInput
        name="lastName"
        label="Last name"
        required
        autoComplete="family-name"
      />
    </div>
  );
}

function RegisterForm() {
  const finishLogin = useFinishLogin();
  const { error, onSubmit } = useAuthSubmit(
    async ({ confirmPassword: _, ...input }: RegisterValues) =>
      finishLogin(await authApi.register(input)),
  );
  return (
    <>
      <AuthMessage message={error} />
      <RHFZodForm
        schema={registerSchema}
        defaultValues={{
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
        }}
        onSubmit={onSubmit}
        className="space-y-4"
      >
        {() => (
          <>
            <NameFields />
            <FormInput
              name="email"
              label="Email"
              type="email"
              required
              autoComplete="email"
            />
            <NewPasswordFields />
            <FormSubmitButton
              idleLabel="Create account"
              loadingLabel="Creating account..."
              className="w-full"
            />
          </>
        )}
      </RHFZodForm>
    </>
  );
}

export default function RegisterScreen() {
  return (
    <AuthCard
      title="Create your account"
      description="Start tracking your learning journey."
      footer={
        <span>
          Already have an account? <AuthLink href="/login">Log in</AuthLink>
        </span>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
