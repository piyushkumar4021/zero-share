import { CustomError } from "./customError";
import { ValidationError } from "./validationError";

export class RequestValidationError extends CustomError {
  statusCode: number = 400;

  constructor(public error: ValidationError[]) {
    super("Invalid request parameters.");

    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeError(): { message: string; field?: string }[] {
    return this.error.map((i) => ({
      message: i.message,
      field: i.param,
    }));
  }
}
