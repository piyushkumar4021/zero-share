import { Request, Response } from "express";
import s3Service from "../services/s3.service";

export const httpGetSignedUrl = async (req: Request, res: Response) => {
  try {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({
        success: false,
        error: "fileName and fileType are required",
      });
    }

    const { signedUrl, key } = await s3Service.getSignedUrl(fileName, fileType);

    res.json({
      success: true,
      data: {
        signedUrl, // frontend will PUT to this URL
        key, // save this in your DB linked to the user/resource
      },
    });
  } catch (err) {
    console.error("Upload signed URL error:", err);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
};

export const httpGetDownloadUrl = async (req: Request, res: Response) => {
  try {
    const { s3Key } = req.params;

    if (!s3Key) {
      return res.status(400).json({ error: "key is required" });
    }

    const signedUrl = await s3Service.getDownloadUrl(s3Key as string);

    res.json({
      success: true,
      data: { signedUrl },
    });
  } catch (err) {
    console.error("Download signed URL error:", err);
    res.status(500).json({ error: "Failed to generate download URL" });
  }
};
