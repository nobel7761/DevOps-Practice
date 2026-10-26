"use client";

import ModuleBreadcrumb from "@/components/modules/ModuleBreadcrumb";
import FetchLatestContentsButton from "@/components/modules/content-details/FetchLatestContentsButton";
import PoridhiTokenForm from "@/components/modules/content-details/PoridhiTokenForm";
import SyncedContentTree from "@/components/modules/content-details/SyncedContentTree";
import type {
  SyncedCourseData,
  SyncStatus,
} from "@/components/modules/content-details/content-details.types";
import useAPI from "@/hooks/api/useAPI";

export default function ContentDetailsScreen({
  courseId,
  courseTitle,
}: {
  courseId: string;
  courseTitle: string;
}) {
  const { data: status, refetch: refetchStatus } = useAPI<SyncStatus>({
    url: "/poridhi-sync/status",
  });
  const { data: latest, refetch: refetchLatest } =
    useAPI<SyncedCourseData | null>({
      url: "/poridhi-sync/latest",
    });

  return (
    <main className="mx-auto w-[95%] max-w-4xl py-8 sm:py-12">
      <ModuleBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: courseTitle, href: `/course/${courseId}` },
          { label: "Content Details" },
        ]}
      />

      <h1 className="mb-1 text-2xl font-bold">Content Details</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        poridhi.io থেকে সরাসরি সব milestone/module/content (duration সহ) fetch
        করুন — যা এখন পর্যন্ত release হয়েছে সবই।
      </p>

      <PoridhiTokenForm
        hasToken={status?.hasToken ?? false}
        onSaved={() => refetchStatus()}
      />

      <FetchLatestContentsButton
        disabled={!status?.hasToken}
        lastFetchedAt={status?.lastFetchedAt ?? null}
        onFetched={() => {
          refetchStatus();
          refetchLatest();
        }}
      />

      {latest ? (
        <SyncedContentTree course={latest} />
      ) : (
        <p className="text-sm text-muted-foreground">
          এখনো কোনো content fetch করা হয়নি।
        </p>
      )}
    </main>
  );
}
