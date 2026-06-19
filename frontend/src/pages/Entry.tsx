import { motion } from 'framer-motion';
import { Send, Download, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Entry = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="text-2xl font-semibold mb-2">What would you like to do?</h1>
        <p className="text-sm text-muted-foreground">Choose an option to get started</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex-1"
        >
          <button
            onClick={() => navigate('/send')}
            className="w-full flex flex-col items-center gap-3 rounded-xl border border-border bg-surface-elevated p-8 hover:border-primary/40 hover:bg-primary/[0.02] transition-all"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Send className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-base font-semibold">Send Files</p>
              <p className="text-xs text-muted-foreground mt-1">Share files with others</p>
            </div>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex-1"
        >
          <button
            onClick={() => navigate('/receive')}
            className="w-full flex flex-col items-center gap-3 rounded-xl border border-border bg-surface-elevated p-8 hover:border-primary/40 hover:bg-primary/[0.02] transition-all"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-base font-semibold">Receive Files</p>
              <p className="text-xs text-muted-foreground mt-1">Get files from others</p>
            </div>
          </button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-muted-foreground gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>
      </motion.div>
    </div>
  );
};

export default Entry;
