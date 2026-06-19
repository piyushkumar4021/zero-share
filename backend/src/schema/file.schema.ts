import z from "zod";

export const FileZodSchema = z.object({
  fileName: z.string().min(1),
  fileSize: z.number().positive().gt(0),
  s3Key: z.string(),
  type: z.string(),
});

export const FilesZodSchema = z.object({
  sharedFiles: z.array(FileZodSchema).max(3).min(1),
});

export interface IFile extends z.infer<typeof FileZodSchema> {}

export interface IFiles extends z.infer<typeof FilesZodSchema> {}
