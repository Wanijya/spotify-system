import app from "./src/app.js";
import { connect } from "./src/broker/rabbit.js";
import startListener from "./src/broker/listner.js";
import http from "http";
import { Server } from "socket.io"; // <-- Naya import yahan add karna hai
import { initializeSockets } from "./src/sockets/socket.server.js";

const httpServer = http.createServer(app);

// RabbitMQ Connection setup
connect().then(startListener);

// Socket.io ka setup (Vite frontend ke liye CORS zaroori hai)
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

initializeSockets(io);

httpServer.listen(3002, () => {
  console.log("Notification server listening on port 3002");
});