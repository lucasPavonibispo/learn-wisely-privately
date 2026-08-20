/**
 * Local-first progress store (LGPD/GDPR).
 * Everything lives in the visitor's own browser (localStorage) — nothing is
 * uploaded. `clearAllData()` implements the right to erasure.
 */

export const STORAGE_KEY = "microlearn.progress.v1";
export const CONSENT_KEY = "microlearn.consent.v1";

export interface Progress {
  xp: number;
  streak: number;
  lastActiveDate: string | null;
  completedTopics: string[];
  badges: string[];
}

export const emptyProgress: Progress = {
  xp: 0,
  streak: 0,
  lastActiveDate: null,
  completedTopics: [],
  badges: [],
};

const todayISO = () => new Date().toISOString().slice(0, 10);

export function loadProgress(): Progress {
  if (typeof window === "undefined") return emptyProgress;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...emptyProgress, ...(JSON.parse(raw) as Progress) } : emptyProgress;
  } catch {
    return emptyProgress;
  }
}

export function saveProgress(p: Progress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

/** Adds XP, refreshes the daily streak and unlocks badges. */
export function awardXp(p: Progress, xp: number, topic?: string): Progress {
  const today = todayISO();
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  let streak = p.streak;
  if (p.lastActiveDate !== today) {
    streak = p.lastActiveDate === yesterday ? p.streak + 1 : 1;
  }
  if (streak === 0) streak = 1;

  const completedTopics =
    topic && !p.completedTopics.includes(topic) ? [...p.completedTopics, topic] : p.completedTopics;

  const next: Progress = {
    ...p,
    xp: p.xp + xp,
    streak,
    lastActiveDate: today,
    completedTopics,
  };
  next.badges = earnedBadges(next);
  return next;
}

export const BADGES: { id: string; label: string; hint: string; earned: (p: Progress) => boolean }[] =
  [
    { id: "first-step", label: "First Step", hint: "Finish 1 topic", earned: (p) => p.completedTopics.length >= 1 },
    { id: "curious", label: "Curious Mind", hint: "Finish 5 topics", earned: (p) => p.completedTopics.length >= 5 },
    { id: "xp-500", label: "500 XP", hint: "Earn 500 XP", earned: (p) => p.xp >= 500 },
    { id: "xp-2000", label: "2000 XP", hint: "Earn 2000 XP", earned: (p) => p.xp >= 2000 },
    { id: "streak-3", label: "3-Day Streak", hint: "Learn 3 days in a row", earned: (p) => p.streak >= 3 },
    { id: "streak-7", label: "7-Day Streak", hint: "Learn 7 days in a row", earned: (p) => p.streak >= 7 },
  ];

export function earnedBadges(p: Progress): string[] {
  return BADGES.filter((b) => b.earned(p)).map((b) => b.id);
}

export function levelFromXp(xp: number) {
  const level = Math.floor(xp / 250) + 1;
  const into = xp % 250;
  return { level, into, pct: (into / 250) * 100 };
}

/** Right to erasure: wipes every trace of the visitor from this device. */
export function clearAllData() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(CONSENT_KEY);
}
