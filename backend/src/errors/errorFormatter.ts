import { ZodError } from "zod";

export function formatZodError(zodError: ZodError) {
  return zodError.issues.map((err) => ({
    param: err.path.join("."), // e.g. "user.address.city"
    message: err.message,
  }));
}
