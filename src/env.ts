import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .url("DATABASE_URL must be a valid PostgreSQL URL")
    .default("postgresql://user:password@localhost:5432/ai_invoice_manager"),

  // NextAuth
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL").optional(),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET must be at least 32 characters")
    .default("default-secret-at-least-32-characters-long"),

  // Stripe
  STRIPE_SECRET_KEY: z
    .string()
    .startsWith("sk_", "STRIPE_SECRET_KEY must start with sk_")
    .default("sk_test_placeholder"),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .startsWith("whsec_", "STRIPE_WEBHOOK_SECRET must start with whsec_")
    .optional(),
  STRIPE_PRO_PRICE_ID: z
    .string()
    .startsWith("price_", "STRIPE_PRO_PRICE_ID must start with price_")
    .optional(),

  // Email
  EMAIL_FROM: z
    .string()
    .email("EMAIL_FROM must be a valid email address")
    .default("noreply@example.com"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),

  // AI (OpenAI example)
  OPENAI_API_KEY: z.string().optional(),

  // Application
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL")
    .default("http://localhost:3000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

type Environment = z.infer<typeof envSchema>;

let env: Environment;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const missing = error.errors
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join("\n");
    console.warn("Warning: Environment validation issues:\n", missing);

    // Fallback to safe defaults if in build/CI phase
    env = envSchema.parse({
      ...process.env,
      DATABASE_URL:
        process.env["DATABASE_URL"] ||
        "postgresql://user:password@localhost:5432/ai_invoice_manager",
      NEXTAUTH_SECRET:
        process.env["NEXTAUTH_SECRET"] ||
        "default-secret-at-least-32-characters-long",
      STRIPE_SECRET_KEY:
        process.env["STRIPE_SECRET_KEY"] || "sk_test_placeholder",
      EMAIL_FROM: process.env["EMAIL_FROM"] || "noreply@example.com",
      NEXT_PUBLIC_APP_URL:
        process.env["NEXT_PUBLIC_APP_URL"] || "http://localhost:3000",
    });
  } else {
    throw error;
  }
}

export default env;
