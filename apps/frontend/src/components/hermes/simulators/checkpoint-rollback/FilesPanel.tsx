import { FILES, type Contents } from "./logic";

export default function FilesPanel({
  files,
  handEdited,
}: {
  files: Contents;
  handEdited: string[];
}) {
  return (
    <ul className="grid gap-2 sm:grid-cols-3">
      {FILES.map((f) => (
        <li
          key={f}
          className="rounded-lg border border-border bg-background/60 p-2 text-sm"
        >
          <p className="font-mono text-xs text-muted-foreground">{f}</p>
          <p className={files[f] === null ? "text-destructive" : ""}>
            {files[f] ?? "🗑️ মুছে গেছে"}
          </p>
          {handEdited.includes(f) && (
            <p className="text-xs text-muted-foreground">✍️ hand-edit</p>
          )}
        </li>
      ))}
    </ul>
  );
}
