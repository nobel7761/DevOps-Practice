import { CircleAlert, CircleCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/shared/shadcn";

type AuthMessageProps = { message: string | null; tone?: "error" | "success" };

/** Form-level error/success banner (field errors are shown by the fields themselves). */
export default function AuthMessage({
  message,
  tone = "error",
}: AuthMessageProps) {
  if (!message) return null;
  const Icon = tone === "error" ? CircleAlert : CircleCheck;
  return (
    <Alert
      variant={tone === "error" ? "destructive" : "default"}
      className="mb-4"
    >
      <Icon />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
