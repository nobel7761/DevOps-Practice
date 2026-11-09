import FlashcardDeck from "@/components/ccdv/flashcards/FlashcardDeck";
import QuizDeck from "@/components/ccdv/flashcards/quiz/QuizDeck";
import Markdown from "@/components/shared/Markdown";
import { hasInteractiveFlashcards } from "@/lib/data/ccdv/schedule";
import type { CcdvChapterContent } from "@/lib/data/ccdv/types";

export default function NotesPanel({
  chapterId,
  content,
}: {
  chapterId: string;
  content: CcdvChapterContent;
}) {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <h3 className="mb-2 text-base font-semibold">📝 Study notes</h3>
        <Markdown>{content.notes}</Markdown>
      </section>
      <section>
        <h3 className="mb-2 text-base font-semibold">🃏 Flashcards</h3>
        {hasInteractiveFlashcards(chapterId) ? (
          <QuizDeck chapterId={chapterId} cards={content.flashcards} />
        ) : (
          <FlashcardDeck chapterId={chapterId} cards={content.flashcards} />
        )}
      </section>
    </div>
  );
}
