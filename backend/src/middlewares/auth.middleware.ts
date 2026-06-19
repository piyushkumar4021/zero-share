import { NextFunction, Request, Response } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { env } from "../configs/env";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthenticated",
    });
  }

  jwt.verify(token, env.JWT_TOKEN_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message:
          err instanceof TokenExpiredError
            ? "Token expired"
            : "Unauthenticated",
      });
    }

    (req as any).user = user;
    next();
  });
};

export default authMiddleware;
