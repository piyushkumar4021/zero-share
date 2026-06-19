import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createSocketClient } from "../socket/socketClient";
import { AuthContext } from "./AuthContext";
import { RefreshCw, MonitorSmartphone } from "lucide-react";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [sessionExpiredReason, setSessionExpiredReason] = useState<string | null>(null);
  const { device } = useContext(AuthContext);
  const token = device?.token;

  const connectSocket = (authToken: string) => {
    // Clean up existing socket if any
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setSessionExpiredReason(null);
    const socket = createSocketClient(authToken);
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setConnectionError(null);
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      setIsConnected(false);
      console.warn("Socket disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      setConnectionError(err.message);
      console.error("Socket connection error:", err.message);
    });

    socket.on("sessionExpired", (message: string) => {
      console.warn("Session expired:", message);
      setSessionExpiredReason(message);
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    });

    return socket;
  };

  useEffect(() => {
    if (!token) return;

    connectSocket(token);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [token]);

  const reconnect = () => {
    if (token) {
      connectSocket(token);
    }
  };

  return (
    <SocketContext.Provider
      value={{ socket: socketRef.current, isConnected, connectionError, sessionExpiredReason }}
    >
      {sessionExpiredReason && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 flex max-w-sm flex-col items-center gap-5 rounded-2xl border border-border bg-background p-8 shadow-2xl text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/10">
              <MonitorSmartphone className="h-7 w-7 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-1">Connected Elsewhere</h2>
              <p className="text-sm text-muted-foreground">
                Your account was opened in another tab or window. Only one active session is allowed at a time.
              </p>
            </div>
            <button
              onClick={reconnect}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <RefreshCw className="h-4 w-4" />
              Reconnect Here
            </button>
          </div>
        </div>
      )}
      {children}
    </SocketContext.Provider>
  );
};

// Raw context export for the hook
export { SocketContext };