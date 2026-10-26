import TitledSection from "@/components/shared/TitledSection";
import { ArchitectureShowcase } from "@/components/showcase/diagrams/ArchitectureShowcase";
import { ComparisonShowcase } from "@/components/showcase/diagrams/ComparisonShowcase";
import { DiagramKindsShowcase } from "@/components/showcase/diagrams/DiagramKindsShowcase";
import { NodeRow } from "@/components/showcase/diagrams/NodeRow";
import { SequenceShowcase } from "@/components/showcase/diagrams/SequenceShowcase";
import { SimulatorShellShowcase } from "@/components/showcase/diagrams/SimulatorShellShowcase";

export function DiagramsShowcase() {
  return (
    <div className="flex flex-col gap-10">
      <TitledSection id="kinds" emoji="🧩" title="Component kinds">
        <DiagramKindsShowcase />
      </TitledSection>
      <TitledSection id="states" emoji="🚦" title="Node states">
        <NodeRow />
      </TitledSection>
      <TitledSection
        id="architecture"
        emoji="🏗️"
        title="Architecture, state diagram & downloads"
      >
        <ArchitectureShowcase />
      </TitledSection>
      <TitledSection id="sequence" emoji="🔁" title="Sequence + step-by-step">
        <SequenceShowcase />
      </TitledSection>
      <TitledSection
        id="compare"
        emoji="⚖️"
        title="Before/After + summary card"
      >
        <ComparisonShowcase />
      </TitledSection>
      <TitledSection id="simulator" emoji="🎮" title="Simulator shell">
        <SimulatorShellShowcase />
      </TitledSection>
    </div>
  );
}
