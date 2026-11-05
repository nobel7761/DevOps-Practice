export default function ComingSoon({ what }: { what: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
      {what} এখনো লেখা হয়নি। পরের batch-এ যোগ হবে।
    </div>
  );
}
