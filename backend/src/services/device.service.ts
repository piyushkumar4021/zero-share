// import { IDevice } from "../devices/device.model";
import { NotFoundError } from "../errors/notFoundError";
import { getRedisClient } from "../redis/redisClient";
import { ICreateDeviceRequest } from "../schema/request.schema";
import { generateRandomId } from "../utils/utils";

const CACHE_DEVICE_EXPIRY_OFFSET_S = 2 * 60;
const DB_DEVICE_EXPIRY_S = 15 * 60;

const registerDevice = async (newDevice: ICreateDeviceRequest) => {
  const redisClient = getRedisClient();

  const nowInMs = Date.now();
  const deviceId = generateRandomId(5);
  const cacheKey = `device_${deviceId}`;

  let device = {
    name: newDevice.name,
    deviceId: deviceId,
    expireAt: new Date(nowInMs + DB_DEVICE_EXPIRY_S * 1000), // 24 hours from now
  };

  await redisClient.set(
    cacheKey,
    JSON.stringify(device),
    "PX",
    (DB_DEVICE_EXPIRY_S + CACHE_DEVICE_EXPIRY_OFFSET_S) * 1000,
    "NX",
  );

  return device;
};

const getDeviceByIdWith = async (deviceId: string) => {
  const redisClient = getRedisClient();
  const cacheKey = `device_${deviceId}`;

  const cachedDevice = await redisClient.get(cacheKey).catch(() => null);

  if (cachedDevice === null) throw new NotFoundError("Device does not exist");

  return JSON.parse(cachedDevice);
};

// const saveDeviceLocation = async (
//   location: IUpdateLocationRequest,
//   deviceId: string,
// ) => {
//   const redisClient = getRedisClient();
//   const [longitude, latitude] = location.coordinates;

//   await redisClient.geoadd(
//     "device_locations",
//     Number(longitude),
//     Number(latitude),
//     deviceId,
//   );
// };

// const searchNearBy = async (
//   location: IUpdateLocationRequest,
//   deviceId: string,
// ) => {
//   const redisClient = getRedisClient();
//   const [longitude, latitude] = location.coordinates;

//   const pipeline = redisClient.pipeline();
//   pipeline.geoadd("device_locations", longitude, latitude, deviceId);
//   pipeline.geosearch(
//     "device_locations",
//     "FROMMEMBER",
//     deviceId,
//     "BYRADIUS",
//     500,
//     "m",
//     "WITHDIST",
//   );

//   const intermediate = await pipeline.exec();
//   if (!intermediate) return [];

//   console.log(intermediate[1][1]);

//   // const nearbyUserIds = ((intermediate[1][1] as string[][]) || []).filter(
//   //   ([id]) => id !== deviceId,
//   // ) as string[][];

//   // console.log("near", nearbyUserIds);

//   // if (!nearbyUserIds.length) return [];

//   // const distanceMap = Object.fromEntries(
//   //   nearbyUserIds.map(([id, dist]) => [id, parseFloat(dist)]),
//   // );
//   //

//   const idsWithDist = Object.fromEntries(
//     (intermediate[1][1] as string[][]).map(([id, dist]) => [
//       id,
//       parseFloat(dist),
//     ]),
//   );

//   console.log(idsWithDist);

//   const detailsPipeline = redisClient.pipeline();
//   Object.keys(idsWithDist).forEach(([id]) =>
//     detailsPipeline.get(`device_${id}`),
//   );

//   const detailsResult = await detailsPipeline.exec();
//   const distUnit = "m";
//   console.log("from", detailsResult);

//   const parsedData = detailsResult
//     ?.filter((item) => item[0] == null && item[1] != null)
//     .map((item: any) => {
//       try {
//         const device = JSON.parse(item[1]);
//         return {
//           ...device,
//           distance: `${idsWithDist[device.deviceId]}${distUnit}`,
//         };
//       } catch {
//         return null;
//       }
//     })
//     .filter(Boolean) as any[];

//   console.log(parsedData);

//   return parsedData;
// };

export default {
  registerDevice,
  getDeviceByIdWithCache: getDeviceByIdWith,
  // saveDeviceLocation,
  // searchNearBy,
};
