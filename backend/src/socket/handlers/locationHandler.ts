import { getRedisClient } from "../../redis/redisClient";
import { getIO } from "../socket";
import { SocketEvents } from "../socketStore";

export const locationHandler = (socket: any) => {
  socket.on(SocketEvents.SET_LOCATION, async (payload: any) => {
    const redisClient = getRedisClient();
    console.log(payload);
    const { latitude, longitude } = payload;
    const deviceId = socket.user.deviceId;

    const pipeline = redisClient.multi();

    // Store the location in Redis using GEOADD
    pipeline.geoadd(
      "device_locations",
      Number(longitude),
      Number(latitude),
      deviceId,
    );

    pipeline.set(`active_device:${deviceId}`, "1", "EX", 600);

    pipeline.exec((err, result) => {
      if (err || !result) {
        getIO().to(`device:${deviceId}`).emit(SocketEvents.ERROR, {
          message: "Currently near-by feature not available.",
        });
      }
    });
  });

  socket.on(SocketEvents.NEARBY_DEVICES, async (data: any) => {
    const redisClient = getRedisClient();
    const deviceId = socket.user.deviceId;

    let nearbyDevices = await redisClient.geosearch(
      "device_locations",
      "FROMMEMBER",
      deviceId,
      "BYRADIUS",
      500,
      "m",
    );

    nearbyDevices = nearbyDevices.filter((id) => id !== deviceId);

    if (!nearbyDevices.length) {
      return socket.emit(SocketEvents.NEARBY_DEVICES, {
        nearbyDevices,
      });
    }

    const shadowKeys = nearbyDevices.map((id: any) => `active_device:${id}`);
    const statuses = (await redisClient.mget(shadowKeys)) as any;
    const activeDevices = nearbyDevices.filter((i, index) => statuses[index]);

    socket.emit(SocketEvents.NEARBY_DEVICES, {
      activeDevices,
    });
  });
};
