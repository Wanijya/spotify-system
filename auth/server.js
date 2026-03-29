import app from "./src/app.js";
import connectDB from "./src/db/db.js";
import { connect } from "./src/broker/rabbit.js";

// Start the server first, then connect to DB and RabbitMQ
// This way even if DB or RabbitMQ fails, the server still runs
app.listen(3000, async () => {
  console.log("Auth server listening on port 3000");

  try {
    await connectDB();
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }

  try {
    await connect();
  } catch (err) {
    console.error("RabbitMQ connection failed:", err.message);
    console.log("Auth server will continue without RabbitMQ (emails won't send)");
  }
});
