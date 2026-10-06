import {
  Activity,
  Boxes,
  Cloud,
  GitBranch,
  Layers,
  Terminal,
} from "lucide-react";

const ICON_RULES: { match: RegExp; Icon: typeof Terminal }[] = [
  { match: /linux|scripting|container/i, Icon: Terminal },
  { match: /cloud|aws/i, Icon: Cloud },
  { match: /infrastructure|iac|server/i, Icon: Boxes },
  { match: /kubernetes/i, Icon: Layers },
  { match: /observability|monitoring|logging/i, Icon: Activity },
  { match: /ci\/cd|gitops|production/i, Icon: GitBranch },
];

export default function MilestoneIcon({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  const Icon = ICON_RULES.find((rule) => rule.match.test(title))?.Icon ?? Boxes;
  return <Icon className={className} />;
}
