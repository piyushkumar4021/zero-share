import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  X,
  QrCode,
  Keyboard,
  Wifi,
  ScanLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import DragDropZone from "@/components/file/DragDropZone";
import FileCard from "@/components/file/FileCard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { NearbyDevice } from "@/services/api";
import DeviceCard from "@/components/device/DeviceCard";
import fileServices, { SharedFile } from "@/services/fileServices";
import { useSocket, useSocketEvent } from "@/hooks/useSocket";

type Step = "select" | "connect" | "done";
type Tab = "code" | "qr" | "nearby";

const SendPage = () => {
  const { device } = useAuth();
  const { socket } = useSocket();

  const navigate = useNavigate();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [sentFiles, setSentFiles] = useState<SharedFile[]>([]);
  const [qrCode, setQrCode] = useState<string>("");

  const [step, setStep] = useState<Step>("select");
  const [tab, setTab] = useState<Tab>("code");
  const [code, setCode] = useState("");
  const [devices, setDevices] = useState<NearbyDevice[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const { toast } = useToast();

  const [uploading, setUploading] = useState(false);

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "code", label: "Enter Code", icon: Keyboard },
    { key: "qr", label: "Scan QR", icon: QrCode },
    { key: "nearby", label: "Nearby", icon: Wifi },
  ];

  const handleAddFiles = (files: File[]) => {
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const uploadFilesToS3 = async (files: File[]): Promise<string[]> => {
    // PHASE 1: Get all signed URLs in parallel — all or nothing
    let signedUrls: { signedUrl: string; key: string }[];

    try {
      signedUrls = await Promise.all(
        files.map((file) =>
          fileServices
            .getUploadSignedUrl(file.name, file.type)
            .then((r) => r.data),
        ),
      );
    } catch (error) {
      // Even one failure = abort everything, nothing was uploaded yet
      throw new Error("SIGNED_URL_FAILED");
    }

    // PHASE 2 — track each individually
    const results = await Promise.allSettled(
      files.map(async (file, i) => {
        const res = await fetch(signedUrls[i].signedUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        return res.ok ? signedUrls[i].key : null;
      }),
    );

    // Now check results
    const succeeded = results
      .filter(
        (r): r is PromiseFulfilledResult<string> =>
          r.status === "fulfilled" && r.value !== null,
      )
      .map((r) => r.value);

    if (succeeded.length !== selectedFiles.length) {
      throw new Error("UPLOAD_PARTIAL_FAILED");
    }

    return succeeded;
  };

  const canSend = () => {
    if (tab === "code") return code.length > 0;
    if (tab === "qr") return qrCode.length > 0;
    if (tab === "nearby") return selectedDevices.length > 0;
    return false;
  };

  // Get the receiver device IDs based on active tab
  const getReceiverIds = (): string[] => {
    if (tab === "code") return [code];
    if (tab === "qr") return [qrCode];
    if (tab === "nearby") return selectedDevices;
    return [];
  };

  const handleSend = async () => {
    setUploading(true);

    let s3Keys: string[] = [];

    try {
      // Upload all files to S3 first
      s3Keys = await uploadFilesToS3(selectedFiles);
    } catch (error) {
      toast({ title: "Upload failed", description: "Could not upload files." });
      setUploading(false);
      return;
    }

    // Build shared file metadata with s3 keys
    const files: SharedFile[] = selectedFiles.map((f, i) => ({
      fileSize: f.size,
      fileName: f.name,
      type: f.type,
      s3Key: s3Keys[i],
    }));

    try {
      // Save file metadata to backend via HTTP
      await fileServices.saveFile(device.deviceId, files);
    } catch (error) {
      toast({ title: "Save failed", description: "Could not save file info." });
      setUploading(false);
      return;
    }

    // Trigger file share via socket event
    const receiverIds = getReceiverIds();
    socket?.emit("shareFile", { recieverDeviceIds: receiverIds });

    setSentFiles(files);
    setStep("done");
    setUploading(false);
  };

  // Listen for file accepted/rejected notifications from receiver
  useSocketEvent("fileAccepted", (data) => {
    toast({ title: "File Accepted", description: data.message });
  });

  useSocketEvent("fileRejected", (data) => {
    toast({
      title: "File Rejected",
      description: data.message,
      variant: "destructive",
    });
  });

  // Listen for nearbyDevices response from server
  useSocketEvent("nearbyDevices", (data) => {
    setLoadingDevices(false);
    const activeDevices = data.activeDevices || data.nearbyDevices || [];
    // activeDevices is string[] of device IDs
    const deviceList: NearbyDevice[] = activeDevices.map((id: string) => ({
      deviceId: id,
      name: id, // device ID as name placeholder
    }));
    setDevices(deviceList);
  });

  useSocketEvent("fileDownloaded", (data) => {
    setSentFiles((prev) =>
      prev.map((f) =>
        f.s3Key === data.s3Key ? { ...f, status: "downloaded" } : f
      )
    );
  });

  const handleTabChange = (key: Tab) => {
    if (key == tab) return;

    setTab(key);
    setCode("");
    setQrCode("");
    setSelectedDevices([]);

    if (key == "nearby") {
      if (!navigator.geolocation) {
        toast({
          title: "Geolocation not supported",
          description:
            "Your browser does not support geolocation, which is required for nearby sharing.",
        });
        return;
      }
    }

    if (key === "nearby" && devices.length === 0) {
      setLoadingDevices(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Save location via socket
          socket?.emit("setLocation", { latitude: lat, longitude: lng });

          // Request nearby devices via socket
          socket?.emit("nearbyDevices", {});
        },
        (error) => {
          setLoadingDevices(false);
          toast({
            title: "Location access denied",
            description:
              "Please allow location access to use nearby sharing features.",
          });
        },
      );
    }
  };

  const toggleDeviceSelection = (deviceId: string) => {
    setSelectedDevices((prev) =>
      prev.includes(deviceId)
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId],
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (step === "connect") setStep("select");
            else if (step === "done") {
              setStep("select");
              setSelectedFiles([]);
              setCode("");
            } else navigate("/app");
          }}
          className="gap-1.5 text-muted-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>
        <h1 className="text-base font-semibold">
          {step === "select"
            ? "Select Files"
            : step === "connect"
              ? "Connect"
              : "Sent"}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <AnimatePresence mode="wait">
          {step === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              className="space-y-4"
            >
              <DragDropZone onFiles={handleAddFiles} />
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {selectedFiles.length} file
                    {selectedFiles.length > 1 ? "s" : ""} selected
                  </p>
                  {selectedFiles.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-border bg-surface-elevated px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{f.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(f.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(i)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {step === "connect" && (
            <motion.div
              key="connect"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              className="space-y-5"
            >
              <div className="flex rounded-lg border border-border bg-secondary p-1">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => handleTabChange(t.key)}
                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 rounded-md px-2 sm:px-3 py-2 text-xs font-medium transition-colors ${
                      tab === t.key
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <t.icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t.label}</span>
                  </button>
                ))}
              </div>

              {tab === "code" && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Enter the receiver's code
                  </p>
                  <Input
                    placeholder="e.g. ABC123"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="text-center text-lg font-mono tracking-widest h-12"
                    maxLength={6}
                  />
                </div>
              )}

              {tab === "qr" && (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-40 h-40 sm:w-56 sm:h-56 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-secondary/50">
                    <ScanLine className="h-8 w-8 text-muted-foreground animate-pulse" />
                    <div className="absolute inset-4 border-2 border-primary/20 rounded-lg" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Point camera at QR code
                  </p>
                </div>
              )}

              {tab === "nearby" && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {loadingDevices
                      ? "Searching nearby devices..."
                      : `${devices.length} devices found`}
                  </p>
                  {loadingDevices ? (
                    <div className="flex items-center justify-center py-8">
                      <Wifi className="h-6 w-6 text-muted-foreground animate-pulse" />
                    </div>
                  ) : (
                    devices.map((d) => (
                      <DeviceCard
                        key={d.deviceId}
                        device={d}
                        selected={selectedDevices.includes(d.deviceId)}
                        onSelect={() => toggleDeviceSelection(d.deviceId)}
                      />
                    ))
                  )}
                </div>
              )}
            </motion.div>
          )}

          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-2"
            >
              <p className="text-sm text-muted-foreground mb-3">
                {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""}{" "}
                sent
              </p>
              {sentFiles.map((f) => (
                <FileCard key={f.s3Key} file={f} variant="sent" />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {step !== "done" && (
        <div className="shrink-0 border-t border-border p-3 sm:p-4">
          <Button
            className="w-full h-11"
            disabled={
              step === "select" ? selectedFiles.length === 0 : !canSend()
            }
            onClick={() => {
              if (step === "select") setStep("connect");
              else handleSend();
            }}
          >
            {step === "select" ? (
              <>
                Next <ArrowRight className="h-4 w-4 ml-1.5" />
              </>
            ) : (
              "Send Files"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SendPage;
