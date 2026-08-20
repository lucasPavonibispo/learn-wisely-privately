/**
 * Server-only helper that calls the Lovable AI Gateway to build a
 * micro-learning module. No user data is persisted anywhere — the request is
 * stateless (topic + level in, lesson out), which keeps the app LGPD/GDPR safe.
 */

export interface LessonModule {
  topic: string;
  level: string;
  intro: string;
  flashcards: { front: string; back: string }[];
  quiz: { question: string; options: string[]; answerIndex: number; explanation: string }[];
  cheatSheet: { heading: string; points: string[] }[];
}

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["intro", "flashcards", "quiz", "cheatSheet"],
  properties: {
    intro: { type: "string" },
    flashcards: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["front", "back"],
        properties: { front: { type: "string" }, back: { type: "string" } },
      },
    },
    quiz: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["question", "options", "answerIndex", "explanation"],
        properties: {
          question: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          answerIndex: { type: "number" },
          explanation: { type: "string" },
        },
      },
    },
    cheatSheet: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["heading", "points"],
        properties: {
          heading: { type: "string" },
          points: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
} as const;

export async function generateLesson(topic: string, level: string): Promise<LessonModule> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured.");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content:
            "You are an expert instructional designer creating bite-sized micro-learning. Reply in the same language as the topic. Be concrete, accurate and concise.",
        },
        {
          role: "user",
          content: `Create a micro-learning module about "${topic}" for a ${level} learner.
Include: a 1-2 sentence intro, exactly 6 flashcards (front = short prompt, back = <=40 word answer), exactly 5 multiple-choice questions with 4 options each (answerIndex is 0-based) and a short explanation, and a cheat sheet of 3-4 sections with 3-5 bullet points each.`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "lesson", strict: true, schema: SCHEMA },
      },
    }),
  });

  if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
  if (res.status === 402) throw new Error("AI credits exhausted. Please top up your workspace.");
  if (!res.ok) throw new Error(`AI request failed (${res.status})`);

  const json = (await res.json()) as { choices: { message: { content: string } }[] };
  const parsed = JSON.parse(json.choices?.[0]?.message?.content ?? "{}") as Omit<
    LessonModule,
    "topic" | "level"
  >;
  return { topic, level, ...parsed };
}
