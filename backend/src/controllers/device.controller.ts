import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import deviceService from "../services/device.service";

import { env } from "../configs/env";
import { getRedisClient } from "../redis/redisClient";
import { ICreateDeviceRequest } from "../schema/request.schema";

export const httpGetMe = async (req: Request, res: Response) => {
  const deviceId = (req as any).user.deviceId;
  const deviceKey = `device_${deviceId}`;
  const redis = getRedisClient();

  const cachedDevice = await redis.get(deviceKey).catch();

  if (!cachedDevice) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  res.status(200).json({
    success: true,
    data: {
      deviceId: deviceId,
      name: JSON.parse(cachedDevice).name,
    },
  });
};

export const httpRegisterDevice = async (req: Request, res: Response) => {
  const body = req.body as ICreateDeviceRequest;
  const createdDevice = await deviceService.registerDevice(body);

  const accessToken = jwt.sign(
    {
      name: body.name,
      deviceId: createdDevice.deviceId,
    },
    env.JWT_TOKEN_SECRET,
    {
      expiresIn: `15m`,
    },
  );

  const registeredDevice = {
    token: accessToken,
    name: body.name,
    deviceId: createdDevice.deviceId,
  };

  res
    .cookie("token", accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      sameSite: "strict",
    })
    .status(201)
    .json({
      success: true,
      message: "Device registered successfully",
      data: registeredDevice,
    });
};

// export const httpSaveDeviceLocation = async (req: Request, res: Response) => {
//   const deviceId = (req as any).user.deviceId;
//   const location = req.body as IUpdateLocationRequest;

//   await deviceService.saveDeviceLocation(location, deviceId);

//   return res.status(200).json({
//     success: true,
//     message: "Device location updated successfully",
//     data: null,
//   });
// };

// export const httpSearchNearBy = async (req: Request, res: Response) => {
//   const deviceId = (req as any).user.deviceId;
//   const location = req.body as IUpdateLocationRequest;

//   const deviceList = await deviceService.searchNearBy(location, deviceId);

//   const deviceResponse = deviceList.map((i) => {
//     const temp = {
//       deviceId: i.deviceId,
//       name: i.name,
//       distance: i.distanceI,
//     };

//     return temp;
//   });

//   res.status(200).json({
//     success: true,
//     message: "Nearby devices fetched successfully",
//     data: deviceResponse,
//   });
// };
