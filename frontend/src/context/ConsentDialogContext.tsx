import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface ConsentDialogOptions {
  userName: string;
  userId: string;
  onAccept: () => void;
  onReject: () => void;
}

interface ConsentDialogContextValue {
  open: (options: ConsentDialogOptions) => void;
  close: () => void;
  state: (ConsentDialogOptions & { isOpen: true }) | { isOpen: false };
}

const ConsentDialogContext = createContext<ConsentDialogContextValue | null>(null);

export function ConsentDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConsentDialogContextValue["state"]>({
    isOpen: false,
  });

  const open = useCallback((options: ConsentDialogOptions) => {
    setState({ isOpen: true, ...options });
  }, []);

  const close = useCallback(() => {
    setState({ isOpen: false });
  }, []);

  return (
    <ConsentDialogContext.Provider value={{ open, close, state }}>
      {children}
    </ConsentDialogContext.Provider>
  );
}

export function useConsentDialogContext() {
  const ctx = useContext(ConsentDialogContext);
  if (!ctx) {
    throw new Error("useConsentDialogContext must be used within <ConsentDialogProvider>");
  }
  return ctx;
}
