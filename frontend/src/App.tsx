import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import AppLayout from "@/components/layout/AppLayout";
import Landing from "./pages/Landing";
import Entry from "./pages/Entry";
import SendPage from "./pages/Send";
import Receive from "./pages/Receive";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import { Socket } from "socket.io-client";
import { SocketProvider } from "./context/SocketContext";
import { ConsentDialogProvider } from "./context/ConsentDialogContext";
import { LoaderProvider } from "./context/LoaderContext";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <Toaster />
          <Sonner />
          <LoaderProvider>
            <AuthProvider>
              <SocketProvider>
                <ConsentDialogProvider>
                  <BrowserRouter>
                    <AppLayout>
                      <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/app" element={<Entry />} />
                        <Route path="/send" element={<SendPage />} />
                        <Route path="/receive" element={<Receive />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </AppLayout>
                  </BrowserRouter>
                </ConsentDialogProvider>
              </SocketProvider>
            </AuthProvider>
          </LoaderProvider>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};
export default App;
