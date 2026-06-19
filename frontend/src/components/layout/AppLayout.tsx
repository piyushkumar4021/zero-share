import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import React from "react";
import { FileConsentDialog } from "../consentDialogue/FileConsentDialog";

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
      <footer className="shrink-0 border-t border-border bg-surface px-4 py-2.5 text-center">
        <span className="text-xs text-muted-foreground tracking-wide">
          Ads space (coming soon)
        </span>
      </footer>
    </div>
    </>
  );
};

export default AppLayout;
