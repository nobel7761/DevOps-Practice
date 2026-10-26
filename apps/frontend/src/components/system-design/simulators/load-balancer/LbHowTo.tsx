import { HOW_TO } from "./lb-lab-content";

export function LbHowTo() {
  return (
    <ol className="flex list-decimal flex-col gap-1.5 pl-4">
      {HOW_TO.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ol>
  );
}
