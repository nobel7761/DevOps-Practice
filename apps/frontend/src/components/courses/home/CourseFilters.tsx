import { Search } from "lucide-react";
import { Input } from "@/components/shared/shadcn";

export type PlatformFilter = "all" | "poridhi" | "udemy" | "own";

const CHIPS: { id: PlatformFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "poridhi", label: "Poridhi" },
  { id: "own", label: "Original" },
  { id: "udemy", label: "Udemy" },
];

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

export default function CourseFilters({
  query,
  onQuery,
  platform,
  onPlatform,
}: {
  query: string;
  onQuery: (q: string) => void;
  platform: PlatformFilter;
  onPlatform: (p: PlatformFilter) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {CHIPS.map((c) => (
          <FilterChip
            key={c.id}
            active={platform === c.id}
            label={c.label}
            onClick={() => onPlatform(c.id)}
          />
        ))}
      </div>
      <div className="relative sm:w-72">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search courses…"
          className="pl-9"
          aria-label="Search courses"
        />
      </div>
    </div>
  );
}
