import { Dot } from "lucide-react";
import type { LessonModule } from "@/lib/generate.server";

/** Condensed reference guide for the current topic. */
export function CheatSheet({ sections }: { sections: LessonModule["cheatSheet"] }) {
  return (
    <div className="fade-up space-y-4">
      {sections.map((s) => (
        <section key={s.heading} className="rounded-3xl border border-border bg-card p-5">
          <h3 className="font-display text-lg text-primary">{s.heading}</h3>
          <ul className="mt-3 space-y-2">
            {s.points.map((p, i) => (
              <li key={i} className="flex gap-1 text-sm leading-relaxed text-muted-foreground">
                <Dot className="mt-0.5 size-5 shrink-0 text-accent" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
