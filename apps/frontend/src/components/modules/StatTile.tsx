export default function StatTile({
  value,
  label,
  ring,
}: {
  value: string;
  label: string;
  ring?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-border bg-background/70 px-4 py-4 text-center backdrop-blur-sm">
      {ring ? (
        <div
          className="flex size-12 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(var(--primary) ${parseInt(value, 10) * 3.6}deg, var(--muted) 0deg)`,
          }}
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-background text-xs font-bold">
            {value}
          </span>
        </div>
      ) : (
        <span className="text-xl font-bold">{value}</span>
      )}
      <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
    </div>
  );
}
