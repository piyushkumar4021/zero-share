const emitToDevice = (io: any, deviceId: string, event: string, data: any) => {
  io.to(`device:${deviceId}`).emit(event, data);
};

const emitToAll = (io: any, deviceIds: string[], event: string, data: any) => {
  deviceIds.forEach((deviceId) => {
    io.to(`device:${deviceId}`).emit(event, data);
  });
};

const emitToRoom = (io: any, room: string, event: string, data: any) => {
  io.to(room).emit(event, data);
};

const emitToRole = (io: any, role: string, event: string, data: any) => {
  io.to(`role:${role}`).emit(event, data);
};

const joinRoom = (io: any, roomName: string) => {
  io.join(roomName);
  console.log(`User joined room: ${roomName}`);
};

const leaveRoom = (io: any, roomName: string) => {
  io.leave(roomName);
  console.log(`User left room: ${roomName}`);
};

const getSocketRooms = (io: any) => {
  return Array.from(io.rooms);
};

const getRoomSockets = async (io: any, roomName: string) => {
  const sockets = await io.in(roomName).fetchSockets();
  return sockets.map((s: any) => ({
    id: s.id,
    userId: s.userId,
    userData: s.userData,
  }));
};

export default {
  emitToDevice,
  emitToAll,
  emitToRoom,
  emitToRole,
  joinRoom,
  leaveRoom,
  getSocketRooms,
  getRoomSockets,
};

export enum SocketRooms {
  ALL = "all",
  ADMIN = "admin",
  DEVICE = "device",
}

export enum SocketEvents {
  FILES = "files",
  SHARE_FILE = "shareFile",
  FILE_CONSENT = "fileConsent",
  FILE_REJECT = "fileReject",
  FILE_ACCEPT = "fileAccept",
  FILE_RECEIVE = "fileReceive",
  MESSAGE = "message",
  FILE_ACCEPTED = "fileAccepted",
  FILE_REJECTED = "fileRejected",
  ERROR = "error",
  FILE_DOWNLOADED = "fileDownloaded",
  SET_LOCATION = "setLocation",
  NEARBY_DEVICES = "nearbyDevices",
  SESSION_EXPIRED = "sessionExpired",
}

// Client SocketEvents
// FILE_CONSENT
