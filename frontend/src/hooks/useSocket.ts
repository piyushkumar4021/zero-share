import { useContext, useEffect, useRef } from "react";
import { SocketContext } from "../context/SocketContext";

export const useSocket = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket must be used inside <SocketProvider>");
  }

  return context; // { socket, isConnected, connectionError }
};

// Bonus: hook to listen to an event cleanly
export const useSocketEvent = (event, handler) => {
  const { socket } = useSocket();
  const handlerRef = useRef(handler);

  // Update handler ref if it changes
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!socket) return;

    console.log("Setting up socket event listener for:", event);

      const listener = (...args) => handlerRef.current(...args); // stable wrapper


    socket.on(event, listener);

    console.log("Listening to socket event:", event);

    return () => {
      console.log("Cleaning up socket event listener for:", event);
      socket.off(event, listener); // always cleanup
    };
  }, [socket, event]);
};