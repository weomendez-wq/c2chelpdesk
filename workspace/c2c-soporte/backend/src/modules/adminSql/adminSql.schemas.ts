import { z } from "zod";

export const explainRequestSchema = z.object({
  sql: z.string().trim().min(1).max(20_000)
});

export type ExplainRequest = z.infer<typeof explainRequestSchema>;
