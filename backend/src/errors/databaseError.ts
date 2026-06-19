import { CustomError } from "./customError";

export class DatabaseError extends CustomError {
  statusCode: number = 500;

  constructor() {
    super("Database error occurred.");
  }

  serializeError(): { message: string; field?: string }[] {
    return [
      {
        message: "Database error occurred.",
      },
    ];
  }
}
