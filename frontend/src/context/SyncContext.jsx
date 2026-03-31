import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { socket } from "../services/socket.service";
import axios from "axios";

const SyncContext = createContext();

export const SyncProvider = ({ children }) => {
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_AUTH_URL || 'http://localhost:3000'}/api/auth/me`, {
        withCredentials: true,
      })
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  const toggleSync = useCallback(() => {
    // Login nahi hai to sync nahi milega
    if (!user) return { needsLogin: true };

    const newState = !syncEnabled;
    setSyncEnabled(newState);

    if (newState) {
      // Sync ON karo
      socket.connect();
      socket.emit("toggle_sync", { enabled: true });
    } else {
      // Sync OFF karo
      socket.emit("toggle_sync", { enabled: false });
      socket.disconnect();
    }

    return { needsLogin: false };
  }, [syncEnabled, user]);

  // Logout hone pe sync automatically off ho jaye
  const logout = useCallback(async () => {
    if (syncEnabled) {
      socket.emit("toggle_sync", { enabled: false });
      socket.disconnect();
      setSyncEnabled(false);
    }
    await axios.post(
      `${import.meta.env.VITE_AUTH_URL || 'http://localhost:3000'}/api/auth/logout`,
      {},
      { withCredentials: true }
    );
    setUser(null);
  }, [syncEnabled]);

  return (
    <SyncContext.Provider value={{ syncEnabled, toggleSync, user, setUser, logout }}>
      {children}
    </SyncContext.Provider>
  );
};

// Custom hook — easy use ke liye
export const useSync = () => {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error("useSync must be used inside SyncProvider");
  return ctx;
};