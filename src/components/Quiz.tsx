import { useState } from "react";
import { Check, X, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { LessonModule } from "@/lib/lesson-types";

/** Multiple-choice quiz with instant feedback and explanations. */
export function Quiz({
  questions,
  onFinish,
}: {
  questions: LessonModule["quiz"];
  onFinish: (correct: number, total: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = questions[index];

  if (done || !q) {
    return (
      <div className="fade-up space-y-4 rounded-3xl border border-border bg-card p-6 text-center">
        <Trophy className="mx-auto size-10 text-primary" />
        <h3 className="font-display text-2xl">
          {score} / {questions.length} correct
        </h3>
        <p className="text-sm text-muted-foreground">
          {score === questions.length ? "Flawless run — badge-worthy." : "Review the cheat sheet and try again later."}
        </p>
        <Button
          variant="secondary"
          onClick={() => {
            setIndex(0);
            setChoice(null);
            setScore(0);
            setDone(false);
          }}
        >
          Retake quiz
        </Button>
      </div>
    );
  }

  const answered = choice !== null;

  const next = () => {
    if (index + 1 >= questions.length) {
      setDone(true);
      onFinish(score, questions.length);
    } else {
      setIndex(index + 1);
      setChoice(null);
    }
  };

  return (
    <div className="fade-up space-y-4">
      <Progress value={((index + (answered ? 1 : 0)) / questions.length) * 100} className="h-1.5" />
      <p className="text-xs text-muted-foreground">
        Question {index + 1} of {questions.length}
      </p>
      <h3 className="font-display text-xl leading-snug">{q.question}</h3>

      <div className="space-y-2" role="radiogroup" aria-label="Answer options">
        {q.options.map((opt, i) => {
          const isAnswer = i === q.answerIndex;
          const picked = choice === i;
          const state = !answered
            ? "border-border bg-card hover:border-primary/60"
            : isAnswer
              ? "border-success/60 bg-success/10"
              : picked
                ? "border-destructive/60 bg-destructive/10"
                : "border-border bg-card opacity-60";
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={picked}
              disabled={answered}
              onClick={() => {
                setChoice(i);
                if (isAnswer) setScore((s) => s + 1);
              }}
              className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left text-sm transition-colors ${state}`}
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-xs">
                {answered && isAnswer ? <Check className="size-4" /> : answered && picked ? <X className="size-4" /> : String.fromCharCode(65 + i)}
              </span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="fade-up space-y-3 rounded-2xl border border-border bg-secondary p-4 text-sm text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">Why: </span>
            {q.explanation}
          </p>
          <Button className="w-full" onClick={next}>
            {index + 1 >= questions.length ? "See results" : "Next question"}
          </Button>
        </div>
      )}
    </div>
  );
}
