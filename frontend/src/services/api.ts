export interface NearbyDevice {
  deviceId: string;
  name: string;
  distance?: string;
  type?: 'phone' | 'laptop' | 'tablet';
}
