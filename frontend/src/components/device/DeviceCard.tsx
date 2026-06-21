import { Laptop, Smartphone, Tablet } from 'lucide-react';
import type { NearbyDevice } from '@/services/api';

interface DeviceCardProps {
  device: NearbyDevice;
  selected: boolean;
  onSelect: () => void;
}

const icons = {
  laptop: Laptop,
  phone: Smartphone,
  tablet: Tablet,
};

const DeviceCard: React.FC<DeviceCardProps> = ({ device, selected, onSelect }) => {
  const Icon = icons[device.type || 'phone'];
  
  return (
    <button
      onClick={onSelect}
      className={`flex items-center gap-3 w-full rounded-lg border px-4 py-3 text-left transition-colors ${
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-muted-foreground/30 bg-surface-elevated'
      }`}
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
        selected ? 'bg-primary/10' : 'bg-secondary'
      }`}>
        <Icon className={`h-4 w-4 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{device.name}</p>
        {device.name !== device.deviceId && (
          <p className="text-xs text-muted-foreground truncate">{device.deviceId}</p>
        )}
        {device.distance && (
          <p className="text-xs text-muted-foreground">{device.distance} away</p>
        )}
      </div>
    </button>
  );
};

export default DeviceCard;
