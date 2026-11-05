"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/shared/shadcn";
import { loadKnownCards, saveKnownCards } from "@/lib/ccdv/storage";
import type { CcdvFlashcard } from "@/lib/data/ccdv/types";
import CardFace from "./CardFace";

export default function FlashcardDeck({
  chapterId,
  cards,
}: {
  chapterId: string;
  cards: CcdvFlashcard[];
}) {
  const [known, setKnown] = useState<number[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setKnown(loadKnownCards(chapterId));
  }, [chapterId]);

  if (cards.length === 0) return null;
  const card = cards[index];
  const go = (delta: number) => {
    setIndex((value) => (value + delta + cards.length) % cards.length);
    setFlipped(false);
  };
  const mark = (isKnown: boolean) => {
    const next = isKnown
      ? Array.from(new Set([...known, index]))
      : known.filter((i) => i !== index);
    setKnown(next);
    saveKnownCards(chapterId, next);
    go(1);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Card {index + 1} / {cards.length} · মনে আছে: {known.length}
      </p>
      <CardFace
        card={card}
        flipped={flipped}
        onFlip={() => setFlipped((v) => !v)}
      />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => go(-1)}>
          আগের
        </Button>
        <Button variant="outline" onClick={() => mark(false)}>
          আবার দেখব
        </Button>
        <Button onClick={() => mark(true)}>মনে আছে ✓</Button>
        <Button variant="outline" onClick={() => go(1)}>
          পরের
        </Button>
      </div>
    </div>
  );
}
