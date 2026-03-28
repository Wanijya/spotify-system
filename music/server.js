import app from "./src/app.js";
import connectDB from "./src/db/db.js";
import initSocketServer from "./src/sockets/socket.server.js";
import http from "http";

const httpServer = http.createServer(app);

connectDB();

initSocketServer(httpServer);

httpServer.listen(3001, () => {
  console.log("Music server listening on port 3001");
});
