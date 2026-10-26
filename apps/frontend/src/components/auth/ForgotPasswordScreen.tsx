"use client";

import { useState } from "react";
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

const forgotSchema = z.object({ email: z.email("Enter a valid email") });
type ForgotValues = z.infer<typeof forgotSchema>;

function ForgotPasswordForm({ onSent }: { onSent: (message: string) => void }) {
  const { error, onSubmit } = useAuthSubmit(async (v: ForgotValues) =>
    onSent(await authApi.forgotPassword(v.email)),
  );
  return (
    <>
      <AuthMessage message={error} />
      <RHFZodForm
        schema={forgotSchema}
        defaultValues={{ email: "" }}
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
            <FormSubmitButton
              idleLabel="Send reset link"
              loadingLabel="Sending..."
              className="w-full"
            />
          </>
        )}
      </RHFZodForm>
    </>
  );
}

export default function ForgotPasswordScreen() {
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter your email and we'll send you a link to reset it."
      footer={<AuthLink href="/login">Back to log in</AuthLink>}
    >
      {sentMessage ? (
        <AuthMessage tone="success" message={sentMessage} />
      ) : (
        <ForgotPasswordForm onSent={setSentMessage} />
      )}
    </AuthCard>
  );
}
