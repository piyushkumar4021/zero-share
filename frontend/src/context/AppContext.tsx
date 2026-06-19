import React, { createContext, useContext, useState, useCallback } from 'react';

export type FileStatus = 'pending' | 'sent' | 'received' | 'viewed';

export interface SharedFiles {
  id: string;
  name: string;
  size: number;
  type: string;
  status: FileStatus;
}

export interface IncomingRequest {
  senderName: string;
  files: { name: string; size: number; type: string }[];
}

interface AppState {
  mode: 'idle' | 'send' | 'receive';
  setMode: (mode: 'idle' | 'send' | 'receive') => void;
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  sentFiles: SharedFiles[];
  setSentFiles: React.Dispatch<React.SetStateAction<SharedFiles[]>>;
  receivedFiles: SharedFiles[];
  setReceivedFiles: React.Dispatch<React.SetStateAction<SharedFiles[]>>;
  shareCode: string;
  setShareCode: (code: string) => void;
  incomingRequest: IncomingRequest | null;
  setIncomingRequest: (req: IncomingRequest | null) => void;
  updateFileStatus: (fileName: string, status: FileStatus, list: 'sent' | 'received') => void;
}

const AppContext = createContext<AppState | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'idle' | 'send' | 'receive'>('idle');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [sentFiles, setSentFiles] = useState<SharedFiles[]>([]);
  const [receivedFiles, setReceivedFiles] = useState<SharedFiles[]>([]);
  const [shareCode, setShareCode] = useState('');
  const [incomingRequest, setIncomingRequest] = useState<IncomingRequest | null>(null);

  const updateFileStatus = useCallback((fileName: string, status: FileStatus, list: 'sent' | 'received') => {
    const setter = list === 'sent' ? setSentFiles : setReceivedFiles;
    setter(prev => prev.map(f => f.name === fileName ? { ...f, status } : f));
  }, []);

  return (
    <AppContext.Provider value={{
      mode, setMode,
      selectedFiles, setSelectedFiles,
      sentFiles, setSentFiles,
      receivedFiles, setReceivedFiles,
      shareCode, setShareCode,
      incomingRequest, setIncomingRequest,
      updateFileStatus,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
