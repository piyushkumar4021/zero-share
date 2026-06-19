import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl as s3GetSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { BUCKET_NAME, s3Client } from "../configs/s3";

// Generate signed URL for UPLOAD (PUT)
export const getSignedUrl = async (fileName: string, fileType: string) => {
  const folder = "uploads";
  const key = `${folder}/${uuidv4()}-${fileName}`; // unique key

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  const signedUrl = await s3GetSignedUrl(s3Client, command, {
    expiresIn: 300, // 5 minutes to complete upload
  });

  return { signedUrl, key }; // return key so you can save it in DB
};

// Generate signed URL for DOWNLOAD (GET)
export const getDownloadUrl = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const signedUrl = await s3GetSignedUrl(s3Client, command, {
    expiresIn: 3600, // 1 hour to download
  });

  return signedUrl;
};

// Delete a file from S3
// export const deleteFile = async (key: string) => {
//   const command = new DeleteObjectCommand({
//     Bucket: BUCKET_NAME,
//     Key: key,
//   });

//   await s3Client.send(command);
// };

export default {
  getSignedUrl,
  getDownloadUrl,
};
