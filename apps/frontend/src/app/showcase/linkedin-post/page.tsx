import { ShowcaseShell } from "@/components/showcase/ShowcaseShell";
import { LinkedInPostShowcase } from "@/components/showcase/linkedin/LinkedInPostShowcase";

export default function LinkedInPostPage() {
  return (
    <ShowcaseShell
      title="LinkedIn post card"
      description="Story, poll and weekly recap posts (Plan doc Section 8.4) with placeholder text."
    >
      <LinkedInPostShowcase />
    </ShowcaseShell>
  );
}
