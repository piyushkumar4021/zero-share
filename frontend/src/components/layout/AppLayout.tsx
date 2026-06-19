import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import React from "react";
import { FileConsentDialog } from "../consentDialogue/FileConsentDialog";
import { User, Wifi, WifiOff } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const { device, isRegistered } = useAuth();
    const {socket, isConnected, connectionError} = useSocket()

    
  return (
    <>
    <FileConsentDialog />
    <div className="flex flex-col h-full overflow-hidden">
      <main className="flex-1 overflow-hidden">{children}</main>
      <footer className="shrink-0 border-t border-border bg-surface px-4 py-2.5">
        <div className="flex items-center justify-between">
          {device?.name ? (
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                <User className="h-3 w-3 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground truncate max-w-[140px] sm:max-w-none">
                {device.name}
              </span>
              {isConnected ? (
                <Wifi className="h-3 w-3 text-green-500" />
              ) : (
                <WifiOff className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">connecting...</span>
          )}
          <span className="text-xs text-muted-foreground tracking-wide hidden sm:inline">
            Ads space (coming soon)
          </span>
        </div>
      </footer>
    </div>
    </>
  );
};

export default AppLayout;

