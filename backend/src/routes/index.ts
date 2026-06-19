import express from "express";
import deviceRouter from "./device.routes";
import s3Router from "./s3.routes";
import fileRouter from "./file.routes";

const router = express.Router();

router.use("/s3", s3Router);
router.use("/files", fileRouter);
router.use("/devices", deviceRouter);

export default router;
