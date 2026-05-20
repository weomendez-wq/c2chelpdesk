import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5491),
  DATABASE_URL: z.string().url(),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  GMAIL_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  GMAIL_CLIENT_ID: z.string().trim().min(1).optional(),
  GMAIL_CLIENT_SECRET: z.string().trim().min(1).optional(),
  GMAIL_LABEL_PROCESSED: z.string().trim().min(1).default("C2C_HELPDESK_PROCESSED"),
  GMAIL_LABEL_REVIEW: z.string().trim().min(1).default("C2C_HELPDESK_REVIEW"),
  GMAIL_POLL_INTERVAL_SECONDS: z.coerce.number().int().min(30).max(3600).default(60),
  GMAIL_REFRESH_TOKEN: z.string().trim().min(1).optional(),
  GMAIL_SUPPORT_MAILBOX: z.string().trim().email().optional()
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Configuracion de entorno invalida", parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsedEnv.data;
