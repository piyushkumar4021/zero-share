import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

const IncomingRequestModal = () => {
  const { incomingRequest, setIncomingRequest, setReceivedFiles } = useApp();

  const handleAccept = () => {
    if (!incomingRequest) return;
    const files = incomingRequest.files.map((f, i) => ({
      id: `recv-${i}`,
      name: f.name,
      size: f.size,
      type: f.type,
      status: 'received' as const,
    }));
    setReceivedFiles(files);
    setIncomingRequest(null);
    // Notify sender
    // mockWs.simulateFileDelivery(incomingRequest.files);
  };

  const handleReject = () => {
    setIncomingRequest(null);
  };

  return (
    <AnimatePresence>
      {incomingRequest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-lg mx-4"
          >
            <h3 className="text-base font-semibold mb-1">Incoming Transfer</h3>
            <p className="text-sm text-muted-foreground mb-4">
              <span className="font-medium text-foreground">{incomingRequest.senderName}</span> wants to send you {incomingRequest.files.length} file{incomingRequest.files.length > 1 ? 's' : ''}
            </p>
            <div className="space-y-1.5 mb-5 max-h-32 overflow-y-auto">
              {incomingRequest.files.map((f, i) => (
                <p key={i} className="text-xs text-muted-foreground truncate">• {f.name}</p>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleReject}>
                Reject
              </Button>
              <Button className="flex-1" onClick={handleAccept}>
                Accept
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IncomingRequestModal;
