import { subscribeToQueue } from "./rabbit.js";
import sendEmail from "../utils/email.js";
import config from "../config/config.js";

function startListener() {
  subscribeToQueue("user_created", async (msg) => {
    try {
      const {
        email,
        role,
        fullName: { firstName, lastName },
      } = msg;

      // PREMIUM SPOTIFY THEME HTML TEMPLATE
      const htmlTemplate = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #121212; color: #ffffff; padding: 40px 20px; text-align: center;">
          
          <table style="max-width: 600px; margin: 0 auto; background-color: #181818; border-radius: 10px; overflow: hidden; border: 1px solid #282828;" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 40px 30px; text-align: center;">
                
                <h1 style="color: #1DB954; font-size: 28px; margin-bottom: 10px; font-weight: 800; letter-spacing: -1px;">
                  Spotify System
                </h1>
                
                <h2 style="color: #ffffff; font-size: 22px; margin-bottom: 20px;">
                  Welcome to the Club, ${firstName}! 🎵
                </h2>
                
                <p style="color: #b3b3b3; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                  We are thrilled to have you on board. Discover new music, create your ultimate playlists, and enjoy a seamless listening experience across all your devices.
                </p>

                <div style="background-color: #282828; display: inline-block; padding: 8px 15px; border-radius: 20px; font-size: 12px; color: #b3b3b3; margin-bottom: 30px;">
                  Registered as: <strong style="color: #ffffff; text-transform: uppercase;">${role}</strong>
                </div>

                <br>

                <a href="${config.FRONTEND_URL || 'http://localhost:5173'}" style="background-color: #1DB954; color: #000000; text-decoration: none; padding: 14px 32px; font-size: 16px; font-weight: bold; border-radius: 30px; display: inline-block; transition: transform 0.2s;">
                  Start Listening Now
                </a>
                
              </td>
            </tr>
            
            <tr>
              <td style="background-color: #000000; padding: 20px; text-align: center; border-top: 1px solid #282828;">
                <p style="color: #535353; font-size: 12px; margin: 0;">
                  If you didn't create an account, you can safely ignore this email.
                </p>
                <p style="color: #535353; font-size: 12px; margin: 5px 0 0 0;">
                  © 2024 Spotify System. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
          
        </div>
      `;

      // Plain text template (unke liye jinke phone me HTML email disable hota hai)
      const plainText = `Hi ${firstName}, Welcome to Spotify System! We are excited to have you on board. Registered as: ${role}. Start listening now!`;

      await sendEmail(
        email,
        "Welcome to Spotify System! 🎧", // Subject with an emoji looks cool
        plainText,
        htmlTemplate
      );

      console.log(`Welcome email successfully triggered for ${email}`);
      
    } catch (error) {
      console.error("Error processing user_created message:", error);
    }
  });
}

export default startListener;
