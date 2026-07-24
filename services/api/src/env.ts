import { z } from "zod";

/** Runtime config, validated once at boot. Fail fast on a bad environment. */
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().default("postgres://localhost:5432/miltons"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
});

export const env = EnvSchema.parse(process.env);
export type Env = z.infer<typeof EnvSchema>;
