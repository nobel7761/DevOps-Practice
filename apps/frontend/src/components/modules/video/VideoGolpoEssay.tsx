import Markdown from "@/components/shared/Markdown";

export default function VideoGolpoEssay({ markdown }: { markdown: string }) {
  return (
    <div className="text-sm">
      <Markdown>{markdown}</Markdown>
    </div>
  );
}
