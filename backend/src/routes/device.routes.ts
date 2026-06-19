import express from "express";
import { validate } from "../middlewares/validator.middleware";

import {
  httpRegisterDevice,
  httpGetMe,
} from "../controllers/device.controller";

import authMiddleware from "../middlewares/auth.middleware";
import { CreateDeviceRequestZodSchema } from "../schema/request.schema";

// routers
const router = express.Router();

router.get("/me", authMiddleware, httpGetMe);

router.post(
  "/register",
  validate(CreateDeviceRequestZodSchema),
  httpRegisterDevice,
);

export default router;
