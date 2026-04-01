import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import passport from "passport";
import {Strategy as GoogleStrategy} from "passport-google-oauth20";
import _config from "./config/config.js";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { rateLimitConfig, createLimiter } from "./config/rateLimit.config.js";
import { rateLimitMonitor } from "./middleware/rateLimitMonitor.js";

const app = express();

// Security middleware
app.use(helmet());

// Global fallback rate limit (applied first, then overridden by specific routes)
app.use(rateLimit(createLimiter(rateLimitConfig.global)));

// Monitor rate limit hits
app.use(rateLimitMonitor);

app.use(cors({
  origin: _config.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
passport.use(new GoogleStrategy({
  clientID: _config.CLIENT_ID,
  clientSecret: _config.CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {
  // Here, you would typically find or create a user in your database
  // For this example, we'll just return the profile
  return done(null, profile);
}));

app.use("/api/auth", authRoutes);


export default app;
