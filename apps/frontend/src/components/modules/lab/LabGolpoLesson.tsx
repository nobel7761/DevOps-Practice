import type { CommandEntry } from "@/lib/data/commands";

export default function LabGolpoLesson({
  labTitle,
  commands,
}: {
  labTitle: string;
  commands: CommandEntry[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm leading-relaxed text-muted-foreground">
        <strong className="text-foreground">{labTitle}</strong> lab-টা শুরু থেকে
        শেষ পর্যন্ত, প্রতিটা command যে ক্রমে ব্যবহার হয়েছে ঠিক সেই ক্রমে, গল্প
        আকারে নিচে সাজানো হলো।
      </p>

      <ol className="flex flex-col gap-5">
        {commands.map((entry, index) => (
          <li key={entry.id} className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {index + 1}
            </span>
            <div className="flex flex-col gap-2">
              <code className="w-fit rounded bg-muted px-2 py-1 font-mono text-xs">
                {entry.command}
              </code>
              <p className="text-sm leading-relaxed">{entry.story}</p>
              {entry.tip && (
                <p className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs leading-relaxed text-amber-600 dark:text-amber-400">
                  {entry.tip}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>

      <p className="text-sm leading-relaxed text-muted-foreground">
        এই ছিল <strong className="text-foreground">{labTitle}</strong>-এর পুরো
        journey! এবার Terminal tab-এ নিজে হাতে practice করো, আর Quiz দিয়ে যাচাই
        করে নাও কতটা মনে থাকলো।
      </p>
    </div>
  );
}
