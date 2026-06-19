import z from "zod";
import { FileZodSchema } from "./file.schema";

export const DeviceZodSchema = z.object({
  name: z.string().min(1),
  deviceId: z.string().length(5).optional(),
  sharedFiles: z.array(FileZodSchema).max(3).default([]).optional(),
  coordinates: z.array(z.number()).length(2).optional(),
});

export interface IDevice extends z.infer<typeof DeviceZodSchema> {}
