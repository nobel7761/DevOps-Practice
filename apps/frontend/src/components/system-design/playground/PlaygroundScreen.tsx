import Link from "next/link";
import { PlaygroundSimulator } from "@/components/system-design/playground/PlaygroundSimulator";
import { SIMULATORS } from "@/components/system-design/simulators/registry";

function PlaygroundHeader() {
  return (
    <header className="mb-8 flex flex-col gap-2">
      <Link
        href="/course/system-design-a-z"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← System Design A-Z
      </Link>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Playground
      </h1>
      <p className="text-sm text-muted-foreground">
        সব simulator এক জায়গায়। Lesson-এর বাইরে নিজের মতো পরীক্ষা করুন।
      </p>
    </header>
  );
}

export function PlaygroundScreen() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
      <PlaygroundHeader />
      <div className="flex flex-col gap-12">
        {SIMULATORS.map((simulator) => (
          <PlaygroundSimulator key={simulator.id} simulator={simulator} />
        ))}
      </div>
    </main>
  );
}
