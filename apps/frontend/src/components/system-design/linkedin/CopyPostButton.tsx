"use client";

import { useRef, useState } from "react";
import CopyButton from "@/components/shared/CopyButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/shared/shadcn";
import {
  buildCopyText,
  needsExperienceWarning,
} from "@/lib/system-design/linkedin/post";
import type { LinkedInPost } from "@/lib/system-design/validate-topic";

/** "📋 Post copy করুন": asks first if the experience line is still empty, then copies without it. */
export function CopyPostButton({
  post,
  experience,
}: {
  post: LinkedInPost;
  experience: string;
}) {
  const [asking, setAsking] = useState(false);
  const answer = useRef<(ok: boolean) => void>(() => {});

  const confirmEmpty = () =>
    !needsExperienceWarning(post, experience) ||
    new Promise<boolean>((resolve) => {
      answer.current = resolve;
      setAsking(true);
    });

  const close = (ok: boolean) => {
    setAsking(false);
    answer.current(ok);
  };

  return (
    <>
      <CopyButton
        text={() => buildCopyText(post, experience)}
        label="Post copy করুন"
        size="default"
        variant="default"
        beforeCopy={confirmEmpty}
      />
      <AlertDialog open={asking} onOpenChange={(open) => !open && close(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>অভিজ্ঞতার লাইন খালি</AlertDialogTitle>
            <AlertDialogDescription>
              আপনার অভিজ্ঞতার লাইনটা এখনো লেখা হয়নি। তবুও copy করবেন?
              (placeholder লাইনটা বাদ দিয়ে copy হবে)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => close(false)}>
              না, লিখব
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => close(true)}>
              হ্যাঁ, copy করুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
