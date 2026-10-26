import { Suspense } from "react";
import ResetPasswordScreen from "@/components/auth/ResetPasswordScreen";

export default function Page() {
  return (
    <Suspense>
      <ResetPasswordScreen />
    </Suspense>
  );
}
