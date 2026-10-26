"use client";

import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { FormSubmitButton, RHFZodForm } from "@/components/shared/form";
import { authApi } from "@/lib/api/auth";
import { newPasswordFields, passwordsMatch } from "@/lib/auth/password-rules";
import AuthCard from "./AuthCard";
import AuthLink from "./AuthLink";
import AuthMessage from "./AuthMessage";
import NewPasswordFields from "./NewPasswordFields";
import { useAuthSubmit } from "./useAuthSubmit";
import { useFinishLogin } from "./useFinishLogin";

const resetSchema = passwordsMatch(z.object(newPasswordFields));
type ResetValues = z.infer<typeof resetSchema>;

function ResetPasswordForm({ token }: { token: string }) {
  const finishLogin = useFinishLogin();
  const { error, onSubmit } = useAuthSubmit(async (v: ResetValues) =>
    finishLogin(await authApi.resetPassword(token, v.password)),
  );
  return (
    <>
      <AuthMessage message={error} />
      <RHFZodForm
        schema={resetSchema}
        defaultValues={{ password: "", confirmPassword: "" }}
        onSubmit={onSubmit}
        className="space-y-4"
      >
        {() => (
          <>
            <NewPasswordFields label="New password" />
            <FormSubmitButton
              idleLabel="Reset password"
              loadingLabel="Saving..."
              className="w-full"
            />
          </>
        )}
      </RHFZodForm>
    </>
  );
}

export default function ResetPasswordScreen() {
  const token = useSearchParams().get("token");
  return (
    <AuthCard
      title="Choose a new password"
      footer={<AuthLink href="/login">Back to log in</AuthLink>}
    >
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <AuthMessage message="This reset link is missing its token. Please request a new one from the Forgot password page." />
      )}
    </AuthCard>
  );
}
