import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LessonModule } from "@/lib/generate.server";

/** Swipeable flashcard deck with a 3D flip animation. */
export function Flashcards({
  cards,
  onComplete,
}: {
  cards: LessonModule["flashcards"];
  onComplete: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = cards[index];
  if (!card) return null;

  const go = (dir: number) => {
    const next = index + dir;
    if (next < 0 || next >= cards.length) return;
    setFlipped(false);
    setIndex(next);
    if (next === cards.length - 1) onComplete();
  };

  return (
    <div className="fade-up space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Card {index + 1} of {cards.length}
        </span>
        <span>Tap the card to flip</span>
      </div>

      <div className="flip-scene">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          aria-label={flipped ? "Show question" : "Show answer"}
          className={`flip-inner ${flipped ? "is-flipped" : ""} block h-64 w-full text-left`}
        >
          <span className="flip-face absolute inset-0 flex flex-col justify-center gap-3 rounded-3xl border border-border bg-card p-6 shadow-lg">
            <span className="text-xs font-medium uppercase tracking-widest text-primary">Concept</span>
            <span className="font-display text-2xl leading-snug text-foreground">{card.front}</span>
          </span>
          <span className="flip-face flip-back absolute inset-0 flex flex-col justify-center gap-3 overflow-auto rounded-3xl border border-primary/40 bg-secondary p-6 shadow-lg">
            <span className="text-xs font-medium uppercase tracking-widest text-accent">Answer</span>
            <span className="text-base leading-relaxed text-foreground">{card.back}</span>
          </span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" size="icon" onClick={() => go(-1)} disabled={index === 0} aria-label="Previous card">
          <ChevronLeft />
        </Button>
        <Button variant="secondary" size="icon" onClick={() => setFlipped((f) => !f)} aria-label="Flip card">
          <RotateCcw />
        </Button>
        <Button className="flex-1" onClick={() => go(1)} disabled={index === cards.length - 1}>
          Next card <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
