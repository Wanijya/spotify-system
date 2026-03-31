import jwt from "jsonwebtoken";
import config from "../config/config.js";
import redisClient from "../services/redis.service.js";

export const initializeSockets = (io) => {

  // ✅ Step 1 — Har connection pe JWT verify karo
  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie || "";
      const tokenCookie = cookieHeader
        .split("; ")
        .find((c) => c.startsWith("token="));

      if (!tokenCookie) return next(new Error("Authentication failed"));

      const token = tokenCookie.split("=")[1];
      const decoded = jwt.verify(token, config.JWT_SECRET);
      socket.userId = decoded.id; // server side se userId attach ho raha hai
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User ${socket.userId} connected — socket ${socket.id}`);

    // ✅ Step 2 — Auto room join (client se userId nahi lena)
    const roomName = `room_user_${socket.userId}`;
    socket.join(roomName);

    // ✅ Step 3 — YE NAYA HAI — Music service wala "play" event
    // Jab ek device pe song click ho, doosre device pe bhi navigate karo
    socket.on("play", (data) => {
      socket.broadcast
        .to(roomName)
        .emit("play", { musicId: data.musicId });
    });

    // ✅ Step 4 — Sync toggle — Redis me store karo
    socket.on("toggle_sync", async ({ enabled }) => {
      try {
        if (enabled) {
          await redisClient.set(
            `sync:${socket.userId}`,
            "true",
            "EX",
            86400 // 24 ghante
          );
        } else {
          await redisClient.del(`sync:${socket.userId}`);
        }
        socket.emit("sync_status", { enabled });
        console.log(`Sync ${enabled ? "ON" : "OFF"} for user ${socket.userId}`);
      } catch (err) {
        console.error("Redis error in toggle_sync:", err);
      }
    });

    // ✅ Step 5 — Sync action — Redis check karo pehle
    socket.on("send_sync_action", async (data) => {
      try {
        const isSyncOn = await redisClient.get(`sync:${socket.userId}`);
        if (!isSyncOn) return; // sync off hai toh kuch mat karo

        socket.to(roomName).emit("sync_playback", {
          songId: data.songId,
          action: data.action,
          currentTime: data.currentTime,
          // userId client se nahi aa raha — server se nikal rahe hain
        });
      } catch (err) {
        console.error("Redis error in send_sync_action:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });
};