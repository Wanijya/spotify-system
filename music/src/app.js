import express from "express";
import musicModel from "./models/music.model.js";
import musicRoutes from "./routes/music.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import config from "./config/config.js";

const app = express();

// Security middleware
app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later" }
}));

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: config.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));
app.use("/api/music", musicRoutes);

export default app;
