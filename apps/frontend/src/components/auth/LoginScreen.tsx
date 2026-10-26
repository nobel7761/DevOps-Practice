"use client";

import { z } from "zod";
import {
  FormInput,
  FormSubmitButton,
  RHFZodForm,
} from "@/components/shared/form";
import { authApi } from "@/lib/api/auth";
import AuthCard from "./AuthCard";
import AuthLink from "./AuthLink";
import AuthMessage from "./AuthMessage";
import { useAuthSubmit } from "./useAuthSubmit";
import { useFinishLogin } from "./useFinishLogin";

const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type LoginValues = z.infer<typeof loginSchema>;

function ForgotPasswordLink() {
  return (
    <div className="-mt-2 text-right text-sm">
      <AuthLink href="/forgot-password">Forgot password?</AuthLink>
    </div>
  );
}

function LoginForm() {
  const finishLogin = useFinishLogin();
  const { error, onSubmit } = useAuthSubmit(async (v: LoginValues) =>
    finishLogin(await authApi.login(v.email, v.password)),
  );
  return (
    <>
      <AuthMessage message={error} />
      <RHFZodForm
        schema={loginSchema}
        defaultValues={{ email: "", password: "" }}
        onSubmit={onSubmit}
        className="space-y-4"
      >
        {() => (
          <>
            <FormInput
              name="email"
              label="Email"
              type="email"
              required
              autoComplete="email"
            />
            <FormInput
              name="password"
              label="Password"
              type="password"
              showPasswordToggle
              required
              autoComplete="current-password"
            />
            <ForgotPasswordLink />
            <FormSubmitButton
              idleLabel="Log in"
              loadingLabel="Logging in..."
              className="w-full"
            />
          </>
        )}
      </RHFZodForm>
    </>
  );
}

export default function LoginScreen() {
  return (
    <AuthCard
      title="Welcome back"
      description="Log in to continue learning."
      footer={
        <span>
          New here? <AuthLink href="/register">Create an account</AuthLink>
        </span>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}
