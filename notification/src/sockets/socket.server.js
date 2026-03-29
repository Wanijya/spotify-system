export const initializeSockets = (io) => {
  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // User jab connect ho, usko uske personal room me join karwao
    socket.on("join_room", (userId) => {
      if (userId) {
        const roomName = `room_user_${userId}`;
        socket.join(roomName);
        console.log(`Socket ${socket.id} joined ${roomName}`);
      }
    });

    // Frontend se direct sync action receive karo aur doosre tabs ko bhejo (Bina Redis ke)
    socket.on("send_sync_action", (syncData) => {
      const roomName = `room_user_${syncData.userId}`;
      // socket.to() doosre devices (except sender) ko emit karta hai
      socket.to(roomName).emit("sync_playback", syncData);
    });

    // User jab connect ho, usko uske personal room me join karwao
    socket.on("join_room", (userId) => {
      if (userId) {
        const roomName = `room_user_${userId}`;
        socket.join(roomName);
        console.log(`Socket ${socket.id} joined ${roomName}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};