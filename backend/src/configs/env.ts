import z from "zod";
import dotenv from "dotenv";
import { removeAllListeners } from "cluster";

dotenv.config();

const EnvSchema = z.object({
  PORT: z.coerce.number().optional(),
  NODE_ENV: z.enum(["development", "production"]).default("production"),
  JWT_TOKEN_SECRET: z.string().default("JWT_SECRET_123"),
  ALLOWED_ORIGINS: z.string("ALLOWED_ORIGINS is not defined"),

  AWS_ACCESS_KEY_ID: z.string("AWS_ACCESS_KEY_ID is not defined"),
  AWS_SECRET_ACCESS_KEY: z.string("AWS_SECRET_ACCESS_KEY is not defined"),
  AWS_REGION: z.string("AWS_REGION is not defined"),
  S3_BUCKET_NAME: z.string("S3_BUCKET_NAME is not defined"),
});

const result = EnvSchema.parse(process.env);

export const env = {
  ...result,
  ALLOWED_ORIGINS: result.ALLOWED_ORIGINS.split(","),
};
