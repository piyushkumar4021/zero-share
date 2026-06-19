import { Server } from "socket.io";
import socketStore, { SocketEvents, SocketRooms } from "./socketStore";
import { fileConcentHandler } from "./handlers/fileConcentHandler";
import { locationHandler } from "./handlers/locationHandler";
import jwt from "jsonwebtoken";
import { env } from "../configs/env";
import {
  IRateLimiterRedisOptions,
  RateLimiterRedis,
} from "rate-limiter-flexible";
import { getRedisClient } from "../redis/redisClient";

let io!: any;
// Maps active device ids to their socket ids
const activeUser: Map<string, string> = new Map();

export const initSocket = (server: any) => {
  const redisClient = getRedisClient();
  const rateLimiterOptions: IRateLimiterRedisOptions = {
    storeClient: redisClient,
    keyPrefix: "ws_limit",
    points: 5,
    duration: 60, // in secs
    blockDuration: 60,
  };

  const rateLimiter = new RateLimiterRedis(rateLimiterOptions);

  const corsOpt = {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
  };

  io = new Server(server, {
    cors: corsOpt,
    pingInterval: 25000, // Defaults
    pingTimeout: 20000, // Defaults
  });

  io.use((socket: any, next: any) => {
    const token = socket.handshake?.auth?.token;
    // const token = socket.handshake.headers.token;

    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }

    jwt.verify(token, env.JWT_TOKEN_SECRET, (err: any, decoded: any) => {
      if (err) {
        return next(
          new Error("Authentication error: Invalid or expired token"),
        );
      }

      const now = Date.now();
      const exp = decoded.exp * 1000;
      const timeLeft = exp - now;

      // Disconnect the client after token expires
      const disconnectTimeout = setTimeout(() => {
        socket.emit(
          SocketEvents.SESSION_EXPIRED,
          "Your session has expired. Please reconnect.",
        );
        socket.disconnect(true);
      }, timeLeft);

      // If Client got disconnected early, clear the timeout
      socket.on("disconnect", () => {
        clearTimeout(disconnectTimeout);
      });

      socket.user = decoded;
      next();
    });
  });

  io.on("connection", (socket: any) => {
    socket.onAny((eventName: any, ...args: any) => {
      console.log(`[Event Received] Name: ${eventName}`, 'Data:', args);
    });

    const user = socket.user;
    const deviceId = user.deviceId;

    // Middleware for every socket request
    socket.use(async ([event, ...args]: [string, any], next: any) => {
      if (event === "disconnect") return next();

      try {
        await rateLimiter.consume(deviceId);
        next();
      } catch (rejRes: any) {
        const leftTimeInSec = Math.round(rejRes.msBeforeNext / 1000) || 1;
        const errorPayload = {
          message: "Too many request. Please slow down",
          retryAfter: `${leftTimeInSec} seconds`,
        };

        socket.emit(SocketEvents.ERROR, errorPayload);
      }
    });

    // Checks if user is accessing from other tab
    if (activeUser.has(deviceId)) {
      const existingSocketId = activeUser.get(deviceId);
      const existingSocket = io.sockets.sockets.get(existingSocketId);
      existingSocket.emit(
        SocketEvents.SESSION_EXPIRED,
        "Logged in from another tab.",
      );
      existingSocket.disconnect(true);
    }

    activeUser.set(deviceId, socket.id);

    fileConcentHandler(socket);
    locationHandler(socket);

    socketStore.joinRoom(socket, SocketRooms.ALL);
    socketStore.joinRoom(socket, `${SocketRooms.DEVICE}:${deviceId}`);

    socket.emit(SocketEvents.MESSAGE, {
      message: "Welcome to Yelo Bhai Socket Server",
    });

    socket.on("disconnect", () => {
      redisClient.zrem("device_locations", deviceId);

      activeUser.delete(deviceId);
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
