import { useConsentDialogContext } from "@/context/ConsentDialogContext";
import { motion, AnimatePresence } from "framer-motion";
import { Download } from "lucide-react"; // or swap with your icon lib

export function FileConsentDialog() {
  const { state } = useConsentDialogContext();

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* ── Dialog card ── */}
          <motion.div
            key="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="consent-title"
            aria-describedby="consent-desc"
            className="
              fixed z-50
              w-[min(90vw,420px)]
              bg-white rounded-2xl
              shadow-[0_24px_64px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.06)]
              flex flex-col items-center
              px-8 pt-9 pb-7 gap-4
            "
            style={{ top: "50%", left: "50%", x: "-50%", y: "-50%" }}
            initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-48%" }}
            animate={{ opacity: 1, scale: 1,   x: "-50%", y: "-50%" }}
            exit={{   opacity: 0, scale: 0.95,  x: "-50%", y: "-48%" }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            {/* Icon bubble */}
            <motion.div
              className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-1"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 22, delay: 0.05 }}
            >
              <Download className="w-7 h-7 text-blue-600" strokeWidth={2} />
            </motion.div>

            {/* Title */}
            <motion.h2
              id="consent-title"
              className="text-[1.2rem] font-bold text-slate-900 tracking-tight text-center m-0"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
            >
              Incoming File
            </motion.h2>

            {/* Description */}
            <motion.p
              id="consent-desc"
              className="text-[0.9375rem] text-slate-500 text-center leading-relaxed m-0"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              <span className="font-semibold text-slate-700">{state.userName}</span>{" "}
              <span className="text-[0.8125rem] text-slate-400 font-medium">({state.userId})</span>{" "}
              has sent you a file. Do you want to accept and view it?
            </motion.p>

            {/* Divider */}
            <div className="w-full h-px bg-slate-100 my-1" />

            {/* Action buttons */}
            <motion.div
              className="flex gap-3 w-full"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
            >
              {/* Reject */}
              <motion.button
                onClick={state.onReject}
                className="
                  flex-1 py-[11px] rounded-xl
                  border border-slate-200
                  text-slate-500 font-semibold text-[0.9375rem]
                  bg-white cursor-pointer
                  transition-colors duration-150
                  hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300
                "
                whileTap={{ scale: 0.97 }}
              >
                Reject
              </motion.button>

              {/* Accept */}
              <motion.button
                onClick={state.onAccept}
                className="
                  flex-1 py-[11px] rounded-xl
                  bg-gradient-to-br from-blue-500 to-blue-600
                  text-white font-semibold text-[0.9375rem]
                  border-none cursor-pointer
                  shadow-[0_4px_14px_rgba(59,130,246,0.4)]
                  hover:shadow-[0_6px_20px_rgba(59,130,246,0.5)]
                  hover:from-blue-600 hover:to-blue-700
                  transition-all duration-150
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
                "
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                Accept
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
