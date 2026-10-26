import TitledSection from "@/components/shared/TitledSection";
import type { SimulatorEntry } from "@/components/system-design/simulators/registry";

export function PlaygroundSimulator({
  simulator,
}: {
  simulator: SimulatorEntry;
}) {
  const { Component } = simulator;
  return (
    <TitledSection id={simulator.id} emoji="🎮" title={simulator.title}>
      <p className="mb-3 text-sm text-muted-foreground">
        {simulator.description} · Day {simulator.days.join(", ")}-এ ব্যবহার হয়।
      </p>
      <Component />
    </TitledSection>
  );
}
