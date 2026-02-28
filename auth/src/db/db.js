import mongoose from "mongoose";
import _config from "../config/config.js";

async function connectDB() {
  try {
    await mongoose.connect(_config.MONGO_URI);
    console.log("Database connected");
  } catch (err) {
    console.log(err, "Database connection failed");
  }
}

export default connectDB;
