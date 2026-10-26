import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/shared/shadcn";

const TIPS = [
  "প্রতিদিন একই সময়ে post করুন।",
  "Post করার পর প্রথম এক ঘণ্টা comment-এর উত্তর দিন।",
  "Link post-এর ভেতরে না দিয়ে প্রথম comment-এ দিন।",
];

export function PostingTips() {
  return (
    <Collapsible>
      <CollapsibleTrigger className="text-xs font-medium text-primary hover:underline">
        💡 Posting tips
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground">
          {TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
