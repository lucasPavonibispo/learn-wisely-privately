import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateLesson } from "./generate.server";

const input = z.object({
  topic: z.string().min(2).max(120),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
});

export const createLesson = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => input.parse(data))
  .handler(async ({ data }) => generateLesson(data.topic, data.level));
