import express from "express";
import sendEmail from "./utils/email.js";

const app = express();

sendEmail(
  "wanijyabisen02@gmail.com",
  "Test Email",
  "This is a test email from Spotify System",
  "<h1>This is a test email from Spotify System</h1>",
);

export default app;
