import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";

export const useAuth = () => {
    
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("AuthContext not found.");
  }

  return context; // { device, isRegistered, loading, error }

};