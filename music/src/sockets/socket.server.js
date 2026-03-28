import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import cookie from "cookie";

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const token = cookies.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error("Authentication error"));
    }
  });

  io.on("connect", (socket) => {
    console.log("User connected", socket.user);

    socket.join(socket.user.id);

    socket.on("play", (data) => {
      const musicId = data.musicId;
      socket.broadcast.to(socket.user.id).emit("play", { musicId });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.user);
      socket.leave(socket.user.id);
    });
  });
}

export default initSocketServer;
