import { ConsentDialogOptions, useConsentDialogContext } from "@/context/ConsentDialogContext";
import { useCallback } from "react";


export function useConsentDialog() {
  const { open, close } = useConsentDialogContext();

  const prompt = useCallback(
    (options: ConsentDialogOptions) => {
      open({
        ...options,
        onAccept: () => {
          close();
          options.onAccept();
        },
        onReject: () => {
          close();
          options.onReject();
        },
      });
    },
    [open, close]
  );

  return { prompt };
}
