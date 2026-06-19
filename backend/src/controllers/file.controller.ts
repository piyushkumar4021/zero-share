import { Request, Response } from "express";
import fileService from "../services/file.service";
import { ISaveFileRequest } from "../schema/request.schema";

export const httpSaveFile = async (req: Request, res: Response) => {
  const deviceId = (req as any).user.deviceId;
  const data = req.body as ISaveFileRequest;

  try {
    await fileService.saveFile(data, deviceId);

    return res.json({ data: { deviceId }, ok: true });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: false,
      message: "Device not found",
    });
    // send errors accordingly
  }
};
