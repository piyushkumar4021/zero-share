import z from "zod";
import { FilesZodSchema, FileZodSchema } from "./file.schema";

export const CreateDeviceRequestZodSchema = z.object({
  name: z.string().min(3),
});

export type ICreateDeviceRequest = z.infer<typeof CreateDeviceRequestZodSchema>;

export const SaveFileRequestZodSchema = FilesZodSchema;

export type ISaveFileRequest = z.infer<typeof SaveFileRequestZodSchema>;
