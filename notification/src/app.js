import express from "express";
import sendEmail from "./utils/email.js";
import cors from "cors";

const app = express();

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
