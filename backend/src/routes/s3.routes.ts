import {
  httpGetSignedUrl,
  httpGetDownloadUrl,
} from "../controllers/s3.controller";

import express from "express";
import authMiddleware from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/signed-url", authMiddleware, httpGetSignedUrl);
router.get("/download-url/:s3Key", authMiddleware, httpGetDownloadUrl);

export default router;
