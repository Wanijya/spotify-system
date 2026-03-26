import express from "express";
import musicModel from "./models/music.model.js";
import musicRoutes from "./routes/music.routes.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api/music", musicRoutes);

export default app;
