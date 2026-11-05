import { SIMULATORS } from "@/components/hermes/simulators/registry";

export default function LessonSimulator({ id }: { id: string }) {
  const Simulator = SIMULATORS[id];
  if (!Simulator) return null;
  return (
    <div className="my-6">
      <Simulator />
    </div>
  );
}
