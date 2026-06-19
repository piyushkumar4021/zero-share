import express from "express";
import { httpSaveFile } from "../controllers/file.controller";
import authMiddleware from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validator.middleware";
import { SaveFileRequestZodSchema } from "../schema/request.schema";

const router = express.Router();

router.put(
  "/:deviceId",
  authMiddleware,
  validate(SaveFileRequestZodSchema),
  httpSaveFile,
);

export default router;
