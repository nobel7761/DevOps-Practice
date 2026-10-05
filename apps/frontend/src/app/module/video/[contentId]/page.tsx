import { notFound } from "next/navigation";
import VideoDetailScreen from "@/components/modules/video/VideoDetailScreen";
import { findContentLocation } from "@/lib/data/course-modules";

export default async function VideoPage({
  params,
}: {
  params: Promise<{ contentId: string }>;
}) {
  const { contentId } = await params;
  const location = findContentLocation(contentId);

  if (!location || !location.content.videoUrl) {
    notFound();
  }

  return (
    <VideoDetailScreen
      milestone={location.milestone}
      module={location.module}
      title={location.content.title ?? "Video"}
      videoUrl={location.content.videoUrl}
    />
  );
}
