import { useLoader } from "@/hooks/useLoader";
import authService from "@/services/authService";
import userService from "@/services/userService";
import { createContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [device, setDevice] = useState(null);
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    const register = async () => {
      setLoading(true);
      setError(null);
      showLoader();

      try {
        const resp = await authService.getMe();
        const storedDevice = JSON.parse(localStorage.getItem("zeroShare") || "{}");
        setDevice({ ...resp.data, token: storedDevice.token });
        hideLoader();
      } catch (error) {
        // debugger
        if (error.response?.status === 401) {
          try {
            const name = await userService.generateName();
            const res = await authService.register({ name });

            if (!res.success) {
              throw new Error("Device registration failed.");
            }

            localStorage.setItem("zeroShare", JSON.stringify(res.data));
            setDevice(res.data);
            setIsRegistered(true);
          } catch (err) {
            setError(err.message);
          }
        } else {
          setError(error.message);
        }
      } finally {
        setLoading(false);
        hideLoader();
      }
    };
    register();
  }, []);

  return (
    <AuthContext.Provider value={{ device, isRegistered, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
