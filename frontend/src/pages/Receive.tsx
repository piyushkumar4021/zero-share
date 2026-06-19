import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import FileCard from "@/components/file/FileCard";
import IncomingRequestModal from "@/components/common/IncomingRequestModal";
import { useConsentDialog } from "@/hooks/useConsentDialog";
import { useSocket, useSocketEvent } from "@/hooks/useSocket";
import { ConsentDialogOptions } from "@/context/ConsentDialogContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLoader } from "@/hooks/useLoader";

const Receive = () => {
  const navigate = useNavigate();
  const [receivedFiles, setReceivedFiles] = useState([]);
  const [senderId, setSenderId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { device } = useAuth();
  const shareCode = device ? device.deviceId : "";

  const { prompt } = useConsentDialog();
  const { socket } = useSocket();
  const { toast } = useToast();
  const { showLoader, hideLoader } = useLoader();

  useSocketEvent("fileConsent", (data) => {
    console.log("Received file consent request:", data);
    const { senderDeviceId, senderName } = data;
    const consentDialogue: ConsentDialogOptions = {
      userName: senderName,
      userId: senderDeviceId,
      onAccept: () => {
        console.log("User accepted the file transfer.");
        setSenderId(senderDeviceId);
        socket.emit("fileAccept", { senderDeviceId });
      },
      onReject: () => {
        console.log("User rejected the file transfer.");
        socket.emit("fileReject", { senderDeviceId });
      },
    };
    prompt(consentDialogue);
  });

  useSocketEvent("files", (data) => {
    console.log("Received files:", data);
    const { files } = data;
    setReceivedFiles(files);
  });

  const saveLocation = () => {
    showLoader();
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Save location via socket event
        socket?.emit("setLocation", { latitude: lat, longitude: lng });

        hideLoader();
        toast({
          title: "Location accessed",
          description: "Location is saved successfully",
        });
      },
      (error) => {
        hideLoader();
        toast({
          title: "Location access denied",
          description:
            "Please allow location access to use nearby sharing features.",
        });
      },
    );
  };

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="shrink-0 flex items-center gap-3 px-6 py-4 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/app")}
            className="gap-1.5 text-muted-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>
          <h1 className="text-base font-semibold">Receive Files</h1>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => saveLocation()}
            className="gap-1.5 text-muted-foreground"
          >
            <LocateFixed className="h-3.5 w-3.5" />
            Enable Location
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {receivedFiles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full px-6"
            >
              <div className="p-4 rounded-2xl border border-border bg-surface-elevated mb-4">
                <QRCodeSVG
                  value={shareCode || "LOADING"}
                  size={160}
                  level="M"
                />
              </div>

              <p className="text-sm text-muted-foreground mb-2">
                Share this code
              </p>

              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl font-mono font-bold tracking-[0.2em]">
                  {shareCode}
                </span>
              </div>

              <p className="text-xs text-muted-foreground text-center max-w-xs">
                Waiting for someone to connect. Share the code or QR above.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 space-y-2"
            >
              <p className="text-sm text-muted-foreground mb-3">
                {receivedFiles.length} file
                {receivedFiles.length > 1 ? "s" : ""} received
              </p>
              {receivedFiles.map((f) => (
                <FileCard key={f.s3Key} file={f} variant="received" senderDeviceId={senderId} />
              ))}
            </motion.div>
          )}
        </div>

        <IncomingRequestModal />
      </div>
    </>
  );
};

export default Receive;
