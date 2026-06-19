import { CustomError } from "./customError";

export class NotFoundError extends CustomError {
  statusCode: number = 404;

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
  serializeError(): { message: string; field?: string }[] {
    return [
      {
        message: this.message,
      },
    ];
  }
}
