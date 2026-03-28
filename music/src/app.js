import express from "express";
import musicModel from "./models/music.model.js";
import musicRoutes from "./routes/music.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use("/api/music", musicRoutes);

export default app;
