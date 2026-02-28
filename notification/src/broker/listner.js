import { subscribeToQueue } from "./rabbit.js";
import sendEmail from "../utils/email.js";

function startListener() {
  subscribeToQueue("user_created", async (msg) => {
    const {
      email,
      role,
      fullName: { firstName, lastName },
    } = msg;

    const template = `
        <h1>Welcome to our platform!</h2>
        <p>Hi ${firstName},</p>
        <p>Thank you for joining our platform. We are excited to have you on board.</p>
        <p>Your role on our platform is ${role}.</p>
        <br/>
        <p>Best regards,</p>
        <p>Spotify System</p>
    `;
    await sendEmail(
      email,
      "Welcome to our platform",
      "Thank you for joining our platform",
      template,
    );
  });
}

export default startListener;
