import Link from "next/link";
import { domainName } from "@/lib/data/ccdv/blueprint";
import { CHAPTERS, lessonContentId } from "@/lib/data/ccdv/schedule";
import type { DomainId } from "@/lib/data/ccdv/types";

export default function WeakAreas({ domains }: { domains: DomainId[] }) {
  if (domains.length === 0) {
    return (
      <p className="text-sm">
        কোনো domain ৭০%-এর নিচে নেই। এভাবেই চালিয়ে যাও!
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-2 text-sm">
      {domains.map((id) => (
        <li key={id}>
          <strong>
            D{id} · {domainName(id)}
          </strong>{" "}
          — revise:{" "}
          {CHAPTERS.filter((chapter) => chapter.domains.includes(id)).map(
            (chapter, i) => (
              <span key={chapter.id}>
                {i > 0 && ", "}
                <Link
                  className="underline"
                  href={`/ccdv/lesson/${lessonContentId(chapter.id, "lesson")}`}
                >
                  {chapter.id}
                </Link>
              </span>
            ),
          )}
        </li>
      ))}
    </ul>
  );
}
