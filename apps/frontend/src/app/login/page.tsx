import { Suspense } from "react";
import LoginScreen from "@/components/auth/LoginScreen";

export default function Page() {
  return (
    <Suspense>
      <LoginScreen />
    </Suspense>
  );
}
