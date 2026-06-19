import { Check } from 'lucide-react';
import type { FileStatus } from '@/context/AppContext';

interface StatusTickProps {
  status: FileStatus;
}

const StatusTick: React.FC<StatusTickProps> = ({ status }) => {
  if (status === 'pending') {
    return <span className="text-muted-foreground text-xs">Pending</span>;
  }
  if (status === 'sent' || !status) {
    return <Check className="h-4 w-4 text-muted-foreground" />;
  }
  if (status === 'downloaded') {
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
        <Check className="h-3 w-3 text-white" strokeWidth={3} />
      </div>
    );
  }
  if (status === 'received') {
    return (
      <span className="flex -space-x-2">
        <Check className="h-4 w-4 text-muted-foreground" />
        <Check className="h-4 w-4 text-muted-foreground" />
      </span>
    );
  }
  // viewed
  return (
    <span className="flex -space-x-2">
      <Check className="h-4 w-4 text-primary" />
      <Check className="h-4 w-4 text-primary" />
    </span>
  );
};

export default StatusTick;
