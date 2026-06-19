import { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";
import { RequestValidationError } from "../errors/requestValidationError";
import { formatZodError } from "../errors/errorFormatter";

export const validate = (schema: ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { body } = req;
    const result = schema.safeParse(body);

    if (!result.success) {
      const formattedErrors = formatZodError(result.error);
      throw new RequestValidationError(formattedErrors);
    }

    req.body = result.data;
    next();
  };
};
