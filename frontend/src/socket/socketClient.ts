import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

export const createSocketClient = (token) => {
  return io(SOCKET_URL, {
    auth : { token },
    timeout: 10000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    transports: ["websocket"],
  });
};
