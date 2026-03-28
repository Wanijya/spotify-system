import React, { useEffect, useState, useRef } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ArtistDashboard from "./pages/ArtistDashboard";
import UploadMusic from "./pages/UploadMusic";
import MusicPlayer from "./pages/MusicPlayer";
import Navbar from "./components/Navbar";
import { io } from "socket.io-client";

const App = () => {
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);

  // Keep navigateRef always up to date
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    const newSocket = io("http://localhost:3001", {
      withCredentials: true,
    });
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
      <Navbar />
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
      </Routes>
    </>
  );
};

export default App;
