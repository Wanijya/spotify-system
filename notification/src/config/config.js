import { config as dotenvConfig } from "dotenv";

dotenvConfig();

const _config = {
  MONGO_URI: process.env.MONGO_URI,
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
  REFRESH_TOKEN: process.env.REFRESH_TOKEN,
  ACCESS_TOKEN: process.env.ACCESS_TOKEN,
  EMAIL_USER: process.env.EMAIL_USER,
  RABBITMQ_URI: process.env.RABBITMQ_URI,
};

export default Object.freeze(_config);
