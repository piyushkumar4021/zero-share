import httpService from "./httpService";

export interface SharedFile {
  fileName: string;
  fileSize: number;
  s3Key: string;
  type: string;
  status?: 'sent' | 'downloaded';
}

const fileService = {
  saveFile: async (deviceId: string, files: SharedFile[]) =>
    httpService.put(`/files/${deviceId}`, { sharedFiles: files }),

  getUploadSignedUrl: async (fileName: string, fileType: string) =>
    httpService.post(`/s3/signed-url`, { fileName, fileType }),

  getSignedUrlToDownload: async (s3Key: string) =>
    httpService.get(`/s3/download-url/${encodeURIComponent(s3Key)}`),
};

export default fileService;
