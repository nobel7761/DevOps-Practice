import { ShowcaseShell } from "@/components/showcase/ShowcaseShell";
import { DiagramsShowcase } from "@/components/showcase/diagrams/DiagramsShowcase";

export default function DiagramsPage() {
  return (
    <ShowcaseShell
      title="System Design diagrams & simulator shell"
      description="The shared visual language (Plan doc Section 6.3) and simulator layout (Section 9.1), with placeholder data."
    >
      <DiagramsShowcase />
    </ShowcaseShell>
  );
}
