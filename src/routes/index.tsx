import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Flame,
  Sparkles,
  Loader2,
  ShieldCheck,
  Trash2,
  Zap,
  Award,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Flashcards } from "@/components/Flashcards";
import { Quiz } from "@/components/Quiz";
import { CheatSheet } from "@/components/CheatSheet";
import { PrivacyDialog } from "@/components/PrivacyDialog";
import { createLesson } from "@/lib/lesson.functions";
import { LEVELS, type Level, type LessonModule } from "@/lib/lesson-types";
import {
  BADGES,
  CONSENT_KEY,
  awardXp,
  clearAllData,
  emptyProgress,
  levelFromXp,
  loadProgress,
  saveProgress,
  type Progress as ProgressData,
} from "@/lib/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MicroLearn — AI Micro-Learning PWA, Private by Design" },
      {
        name: "description",
        content:
          "Learn any topic in minutes with AI flashcards, quizzes and cheat sheets. XP, streaks and badges stored only on your device — LGPD & GDPR friendly.",
      },
      { property: "og:title", content: "MicroLearn — AI Micro-Learning, Private by Design" },
      {
        property: "og:description",
        content: "Flashcards, quizzes and cheat sheets for any subject. Your progress never leaves your browser.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const PRESETS = ["Coding", "Languages", "Science", "History", "Finance", "Design"];

function Home() {
  const [progress, setProgress] = useState<ProgressData>(emptyProgress);
  const [consented, setConsented] = useState(true); // avoid SSR flash; corrected on mount
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<Level>("Beginner");
  const [lesson, setLesson] = useState<LessonModule | null>(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  // Local-first hydration: read the visitor's own device storage after mount.
  useEffect(() => {
    setProgress(loadProgress());
    setConsented(window.localStorage.getItem(CONSENT_KEY) === "granted");
  }, []);

  const persist = (next: ProgressData) => {
    setProgress(next);
    saveProgress(next);
  };

  const award = (xp: number, completedTopic?: string) => {
    const before = progress.badges;
    const next = awardXp(progress, xp, completedTopic);
    persist(next);
    toast.success(`+${xp} XP`);
    const fresh = next.badges.filter((b) => !before.includes(b));
    fresh.forEach((id) =>
      toast(`Badge unlocked: ${BADGES.find((b) => b.id === id)?.label ?? id}`, { icon: "🏅" }),
    );
  };

  const generate = useServerFn(createLesson);
  const mutation = useMutation({
    mutationFn: (vars: { topic: string; level: Level }) => generate({ data: vars }),
    onSuccess: (data) => {
      setLesson(data as LessonModule);
      award(20);
    },
    onError: (e: Error) => toast.error(e.message || "Could not generate this lesson."),
  });

  const start = (t: string) => {
    const clean = t.trim();
    if (clean.length < 2) {
      toast.error("Type a topic first.");
      return;
    }
    setTopic(clean);
    mutation.mutate({ topic: clean, level });
  };

  const xpInfo = levelFromXp(progress.xp);

  /* ---------- Consent gate (LGPD art. 8 / GDPR art. 7) ---------- */
  if (!consented) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
        <div className="fade-up space-y-4 rounded-3xl border border-border bg-card p-6">
          <ShieldCheck className="size-9 text-primary" />
          <h1 className="font-display text-3xl">Your data stays on your device</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            MicroLearn keeps your XP, streak and badges in this browser only. No account, no cookies,
            no tracking. You can erase everything with one tap, anytime.
          </p>
          <Button
            className="w-full"
            onClick={() => {
              window.localStorage.setItem(CONSENT_KEY, "granted");
              setConsented(true);
            }}
          >
            I understand — start learning
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setPrivacyOpen(true)}>
            Read the privacy notice & terms
          </Button>
        </div>
        <PrivacyDialog open={privacyOpen} onOpenChange={setPrivacyOpen} />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 pb-24 pt-6">
      {/* Header + gamification */}
      <header className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl">
            Micro<span className="text-primary">Learn</span>
          </h1>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs">
              <Flame className="size-3.5 text-primary" /> {progress.streak}d
            </span>
            <span className="flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs">
              <Zap className="size-3.5 text-accent" /> {progress.xp} XP
            </span>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Level {xpInfo.level}</span>
            <span>{250 - xpInfo.into} XP to next level</span>
          </div>
          <Progress value={xpInfo.pct} className="h-1.5" />
        </div>
      </header>

      {!lesson ? (
        <div className="fade-up space-y-6">
          <section className="rounded-3xl border border-border bg-card p-5">
            <h2 className="font-display text-xl">What do you want to learn today?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Any subject. Three minutes. Flashcards, a quiz and a cheat sheet.
            </p>
            <div className="mt-4 space-y-3">
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && start(topic)}
                placeholder="e.g. React hooks, Spanish verbs, photosynthesis…"
                aria-label="Topic to learn"
              />
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTopic(p)}
                    className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs transition-colors hover:border-primary/60"
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Difficulty level">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    aria-pressed={level === l}
                    onClick={() => setLevel(l)}
                    className={`rounded-2xl border px-2 py-2.5 text-xs transition-colors ${
                      level === l
                        ? "border-primary bg-primary/15 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <Button className="w-full" onClick={() => start(topic)} disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" /> Building your lesson…
                  </>
                ) : (
                  <>
                    <Sparkles /> Generate lesson
                  </>
                )}
              </Button>
            </div>
          </section>

          {/* Badges */}
          <section className="rounded-3xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 font-display text-lg">
              <Award className="size-4 text-primary" /> Badges
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {BADGES.map((b) => {
                const earned = progress.badges.includes(b.id);
                return (
                  <div
                    key={b.id}
                    className={`rounded-2xl border p-3 text-xs ${
                      earned ? "border-primary/50 bg-primary/10" : "border-border bg-secondary opacity-60"
                    }`}
                  >
                    <p className="font-semibold text-foreground">{b.label}</p>
                    <p className="text-muted-foreground">{b.hint}</p>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {progress.completedTopics.length} topic(s) completed on this device.
            </p>
          </section>

          {/* Privacy controls */}
          <section className="rounded-3xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 font-display text-lg">
              <ShieldCheck className="size-4 text-accent" /> Privacy & your data
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Everything above is stored only in this browser. Nothing is uploaded.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button variant="secondary" className="sm:flex-1" onClick={() => setPrivacyOpen(true)}>
                Privacy notice & terms
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="sm:flex-1">
                    <Trash2 /> Clear all my data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Erase everything on this device?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Your XP, streak, badges and completed topics will be permanently deleted. This
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        clearAllData();
                        setProgress(emptyProgress);
                        setLesson(null);
                        setConsented(false);
                        toast.success("All your data has been erased.");
                      }}
                    >
                      Delete my data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </section>
        </div>
      ) : (
        <div className="fade-up space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-accent">{lesson.level}</p>
              <h2 className="font-display text-2xl leading-tight">{lesson.topic}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{lesson.intro}</p>
            </div>
            <Button variant="ghost" size="icon" aria-label="Back to topics" onClick={() => setLesson(null)}>
              <ArrowLeft />
            </Button>
          </div>

          <Tabs defaultValue="cards">
            <TabsList className="w-full">
              <TabsTrigger value="cards" className="flex-1">
                Flashcards
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex-1">
                Quiz
              </TabsTrigger>
              <TabsTrigger value="sheet" className="flex-1">
                Cheat sheet
              </TabsTrigger>
            </TabsList>
            <TabsContent value="cards" className="mt-4">
              <Flashcards cards={lesson.flashcards} onComplete={() => award(30)} />
            </TabsContent>
            <TabsContent value="quiz" className="mt-4">
              <Quiz
                questions={lesson.quiz}
                onFinish={(correct, total) => award(correct * 15 + (correct === total ? 25 : 0), lesson.topic)}
              />
            </TabsContent>
            <TabsContent value="sheet" className="mt-4">
              <CheatSheet sections={lesson.cheatSheet} />
            </TabsContent>
          </Tabs>
        </div>
      )}

      <PrivacyDialog open={privacyOpen} onOpenChange={setPrivacyOpen} />
    </main>
  );
}
