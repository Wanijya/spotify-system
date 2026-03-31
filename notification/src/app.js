import express from "express";
import sendEmail from "./utils/email.js";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();

// Security middleware
app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later" }
}));

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

// sendEmail(
//   "wanijyabisen02@gmail.com",
//   "Test Email",
//   "This is a test email from Spotify System",
//   "<h1>This is a test email from Spotify System</h1>",
// );

export default app;
