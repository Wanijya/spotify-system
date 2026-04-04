import express from "express";
import musicModel from "./models/music.model.js";
import musicRoutes from "./routes/music.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { rateLimitConfig, createLimiter } from "./config/rateLimit.config.js";
import { rateLimitMonitor } from "./middleware/rateLimitMonitor.js";
import config from "./config/config.js";

const app = express();

// Security middleware
app.use(helmet());

// Global fallback rate limit (applied first, then overridden by specific routes)
app.use(rateLimit(createLimiter(rateLimitConfig.global)));

// Monitor rate limit hits
app.use(rateLimitMonitor);

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: config.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));
app.use("/api/music", musicRoutes);

export default app;
