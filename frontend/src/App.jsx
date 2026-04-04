import React, { useEffect, useState, useRef } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Home from "./pages/user/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ArtistDashboard from "./pages/artist/ArtistDashboard";
import UploadMusic from "./pages/artist/UploadMusic";
import MusicPlayer from "./pages/user/MusicPlayer";
import BottomNav from "./components/layout/BottomNav";
import Playlists from "./pages/user/Playlists";
import Settings from "./pages/user/Settings";
import { io } from "socket.io-client";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import AuthOverlay from "./components/layout/AuthOverlay";

const App = () => {
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);

  // Keep navigateRef always up to date
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    const newSocket = io(
      import.meta.env.VITE_NOTIFICATION_URL || "http://localhost:3002",
      {
        withCredentials: true,
      },
    );
    setSocket(newSocket);

    newSocket.on("play", (data) => {
      const musicId = data.musicId;
      navigateRef.current(`/music/${musicId}`);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <>
      <AuthOverlay />
      <BottomNav />
      <Routes>
        <Route path="/" element={<Home socket={socket} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/artist/dashboard" element={<ArtistDashboard />} />
        <Route
          path="/artist/dashboard/upload-music"
          element={<UploadMusic />}
        />
        <Route path="/music/:id" element={<MusicPlayer />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </>
  );
};

export default App;
