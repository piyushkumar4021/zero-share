import { File, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusTick from '@/components/common/StatusTick';
import type { SharedFiles } from '@/context/AppContext';
import fileService from '@/services/fileServices';
import { useSocket } from '@/hooks/useSocket';

interface FileCardProps {
  file: SharedFiles;
  variant: 'sent' | 'received';
  senderDeviceId?: string | null;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileCard: React.FC<FileCardProps> = ({ file, variant, senderDeviceId }) => {
  const { socket } = useSocket();

  const handleView = async () => {
    try {
      const resp = await fileService.getSignedUrlToDownload(file.s3Key);
      const url = resp.data?.signedUrl;
      if (url) {
        window.open(url, '_blank');
        if (senderDeviceId) {
          socket?.emit('fileDownloaded', { senderDeviceId, s3Key: file.s3Key });
        }
      }
    } catch (err) {
      console.error('View failed:', err);
    }
  };

  const handleDownloadBtn = async () => {
    try {
      const resp = await fileService.getSignedUrlToDownload(file.s3Key);
      const url = resp.data?.signedUrl;
      if (url) {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = file.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);

        if (senderDeviceId) {
          socket?.emit('fileDownloaded', { senderDeviceId, s3Key: file.s3Key });
        }
      }
    } catch (err) {
      console.error('Download failed:', err);
    }
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface-elevated px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
          <File className="h-4 w-4 text-secondary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{file.fileName}</p>
          <p className="text-xs text-muted-foreground">{formatSize(file.fileSize)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {variant === 'sent' ? (
          <StatusTick status={file.status || 'sent'} />
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={handleView}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownloadBtn} >
              <Download className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default FileCard;
