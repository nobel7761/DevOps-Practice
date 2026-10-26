import { Suspense } from "react";
import RegisterScreen from "@/components/auth/RegisterScreen";

export default function Page() {
  return (
    <Suspense>
      <RegisterScreen />
    </Suspense>
  );
}
