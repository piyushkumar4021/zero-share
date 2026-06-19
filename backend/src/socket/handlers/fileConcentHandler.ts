import { SocketEvents } from "../socketStore";
import { getIO } from "../socket";
import { getRedisClient } from "../../redis/redisClient";

export const senderReceiverMap = new Map<string, string[]>();

export const fileConcentHandler = (socket: any) => {
  // Share File Event
  socket.on(SocketEvents.SHARE_FILE, (payload: any) => {
    console.log("Share File", payload);

    try {
      const recieverDeviceIds = payload.recieverDeviceIds;
      const sender = socket.user;
      console.log(recieverDeviceIds);

      if (!recieverDeviceIds || !Array.isArray(recieverDeviceIds)) {
        return socket.emit(SocketEvents.ERROR, {
          message: "Send reciever device ids",
        });
      }

      senderReceiverMap.set(sender.deviceId, recieverDeviceIds);

      recieverDeviceIds.forEach((receiverId) => {
        getIO().to(`device:${receiverId}`).emit(SocketEvents.FILE_CONSENT, {
          senderDeviceId: sender.deviceId,
          senderName: sender.name,
        });
      });
    } catch (error) {
      console.log(error);
      socket.emit(SocketEvents.ERROR, {
        message: "Error processing file share request",
        error: "Invalid input data",
      });
    }
  });

  // File Accept Events
  // This event is sent by the receiver so receiver ID wil is fetched from the socket
  socket.on(SocketEvents.FILE_ACCEPT, async (payload: any) => {
    console.log("File Accept", payload);

    const redis = getRedisClient();
    const receiver = socket.user;
    const senderDeviceId = payload.senderDeviceId;

    if (!senderDeviceId) {
      return socket.emit(SocketEvents.ERROR, "Send senderDevice id");
    }

    const isReceiverMappedWithSender = areSenderReceiverMapped(
      senderDeviceId,
      receiver.deviceId,
    );

    if (!isReceiverMappedWithSender) {
      return socket.emit(SocketEvents.ERROR, {
        message: `This sender has not send you files. DO not try to manipulate things.`,
      });
    }

    let sender = await redis.get(`device_${senderDeviceId}`);
    sender = sender && JSON.parse(sender);

    if (!sender) {
      return socket.emit(SocketEvents.ERROR, {
        message: `Sender of ID ${senderDeviceId} does not exist.`,
      });
    }

    const sharedFiles = (sender as any).sharedFiles;

    // file receive notification sent to the sender
    getIO()
      .to(`device:${senderDeviceId}`)
      .emit(SocketEvents.FILE_ACCEPTED, {
        message: `Files are accepted by ${receiver.name}`,
      });

    // files sent to the receiver
    socket.emit(SocketEvents.FILES, {
      files: sharedFiles,
    });
  });

  // File Reject Event
  socket.on(SocketEvents.FILE_REJECT, (payload: any) => {
    console.log("File Accept", payload);

    const senderDeviceId = payload.senderDeviceId;
    const receiver = socket.user;

    if (!senderDeviceId) {
      return socket.emit(SocketEvents.ERROR, "Send senderDevice id");
    }

    getIO()
      .to(`device:${senderDeviceId}`)
      .emit(SocketEvents.FILE_REJECTED, {
        message: `File share request rejected by ${receiver.name}`,
      });
  });

  // FIle Downloaded Event
  socket.on(SocketEvents.FILE_DOWNLOADED, (payload: any) => {
    const senderDeviceId = payload.senderDeviceId;
    const s3Key = payload.s3Key;

    if (!senderDeviceId) {
      return socket.emit(SocketEvents.ERROR, "Send senderDevice id");
    }
    if (!s3Key) {
      return socket.emit(SocketEvents.ERROR, "Send File Key");
    }

    getIO().to(`device:${senderDeviceId}`).emit(SocketEvents.FILE_DOWNLOADED, {
      message: "File Downloaded by the user",
      s3Key,
    });
  });
};

function areSenderReceiverMapped(senderId: string, receiverId: string) {
  return senderReceiverMap.get(senderId)?.includes(receiverId);
}
