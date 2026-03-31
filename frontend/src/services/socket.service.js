import { io } from "socket.io-client";

export const socket = io("http://localhost:3002", {
  autoConnect: false,
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

// Connection error globally handle karo
socket.on("connect_error", (err) => {
  console.error("Socket connection error:", err.message);
  // Agar auth fail hua to silently disconnect
  if (err.message === "Authentication failed") {
    socket.disconnect();
  }
});