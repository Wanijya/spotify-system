import app from "./src/app.js";
import { connect } from "./src/broker/rabbit.js";
import startListener from "./src/broker/listner.js";
import http from "http";
import { Server } from "socket.io";
import { initializeSockets } from "./src/sockets/socket.server.js";

const httpServer = http.createServer(app);

connect().then(startListener);

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