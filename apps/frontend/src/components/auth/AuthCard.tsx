import type { ReactNode } from "react";
import { GraduationCap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shared/shadcn";

export const PLATFORM_NAME = "One Step Closer Learning Platform";

function AuthBrand() {
  return (
    <div className="mb-6 flex items-center justify-center gap-2 text-primary">
      <GraduationCap className="size-6" />
      <span className="text-sm font-semibold tracking-wide">
        {PLATFORM_NAME}
      </span>
    </div>
  );
}

type AuthCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

/** Centered card shell shared by every auth screen. */
export default function AuthCard({
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <AuthBrand />
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{title}</CardTitle>
            {description ? (
              <CardDescription>{description}</CardDescription>
            ) : null}
          </CardHeader>
          <CardContent>{children}</CardContent>
          {footer ? (
            <CardFooter className="justify-center text-sm text-muted-foreground">
              {footer}
            </CardFooter>
          ) : null}
        </Card>
      </div>
    </main>
  );
}
