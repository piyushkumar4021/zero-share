import { getRedisClient } from "../redis/redisClient";
import deviceService from "./device.service";
import { ISaveFileRequest } from "../schema/request.schema";

const CACHE_DEVICE_EXPIRY_OFFSET_S = 2 * 60;
const DB_DEVICE_EXPIRY_S = 15 * 60;

export const saveFile = async (data: ISaveFileRequest, deviceId: string) => {
  const redisClient = getRedisClient();
  const cachedDevice = await deviceService.getDeviceByIdWithCache(deviceId);
  cachedDevice.sharedFiles = data.sharedFiles;

  const redisExpiry =
    Date.now() + (DB_DEVICE_EXPIRY_S + CACHE_DEVICE_EXPIRY_OFFSET_S) * 1000;

  await redisClient.set(
    `device_${deviceId}`,
    JSON.stringify(cachedDevice),
    "PXAT",
    redisExpiry,
  );

  return cachedDevice;
};

export default {
  saveFile,
};
