import { Request, Response, NextFunction } from "express";
import { env } from "../configs/env";
import { CustomError } from "../errors/customError";

export default function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let error = err;
  console.log(err);

  const isDevelopment = env.NODE_ENV === "development";

  let response: any = {
    sucess: false,
  };

  if (isDevelopment) {
    response.stack = error.stack;
  }

  // if (error.code === 11000) {
  // }

  if (err instanceof CustomError) {
    response.errors = error.serializeError();
    return res.status(error.statusCode).json(response);
  }

  if (
    err instanceof SyntaxError &&
    (err as any).status === 400 &&
    "body" in err
  ) {
    return res.status(400).json({
      message: "Invalid JSON",
    });
  }

  // unhandled error
  response.errors = [{ message: "Something went wrong" }];
  res.status(500).json(response);
}
