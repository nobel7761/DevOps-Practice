import {
  ComponentChip,
  DIAGRAM_KINDS,
  type DiagramKind,
} from "@/components/shared/diagram";

export function DiagramKindsShowcase() {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(DIAGRAM_KINDS) as DiagramKind[]).map((kind) => (
        <ComponentChip key={kind} kind={kind} />
      ))}
    </div>
  );
}
