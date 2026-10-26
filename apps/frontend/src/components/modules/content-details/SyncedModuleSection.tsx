import { Badge } from "@/components/shared/shadcn";
import type { SyncedModule } from "@/components/modules/content-details/content-details.types";

export default function SyncedModuleSection({
  module,
}: {
  module: SyncedModule;
}) {
  return (
    <div>
      <h4 className="mb-1 text-sm font-medium">{module.title}</h4>
      <ul className="flex flex-col gap-1">
        {module.contents.map((item, index) => (
          <li
            key={`${item.type}-${index}`}
            className="flex flex-wrap items-center gap-2 text-xs"
          >
            <Badge variant="outline">{item.type}</Badge>
            <span className={item.completed ? "text-muted-foreground" : ""}>
              {item.title}
            </span>
            {item.durationLabel && (
              <span className="text-muted-foreground">
                ({item.durationLabel})
              </span>
            )}
            {item.completed && <span className="text-muted-foreground">✓</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
