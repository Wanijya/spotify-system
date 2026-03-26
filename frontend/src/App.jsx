import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ArtistDashboard from "./pages/ArtistDashboard";
import UploadMusic from "./pages/UploadMusic";
import MusicPlayer from "./pages/MusicPlayer";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/artist/dashboard" element={<ArtistDashboard />} />
        <Route path="/artist/dashboard/upload-music" element={<UploadMusic />} />
        <Route path="/music/:id" element={<MusicPlayer />} />
      </Routes>
    </>
  );
};

export default App;
