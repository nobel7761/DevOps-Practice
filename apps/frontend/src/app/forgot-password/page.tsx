import { Suspense } from "react";
import ForgotPasswordScreen from "@/components/auth/ForgotPasswordScreen";

export default function Page() {
  return (
    <Suspense>
      <ForgotPasswordScreen />
    </Suspense>
  );
}
