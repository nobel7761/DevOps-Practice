import type { ComponentType } from "react";
import { SIMULATORS } from "@/components/hermes/simulators/registry";
import { CCDV_SIMULATORS } from "@/components/ccdv/simulators/registry";

export default function LessonSimulator({
  id,
  props,
}: {
  id: string;
  props?: Record<string, unknown>;
}) {
  const Simulator = (SIMULATORS[id] ?? CCDV_SIMULATORS[id]) as
    ComponentType<Record<string, unknown>> | undefined;
  if (!Simulator) return null;
  return (
    <div className="my-6">
      <Simulator {...(props ?? {})} />
    </div>
  );
}
