import amqp from "amqplib";
import config from "../config/config.js";

let channel = null;

export async function connect() {
  try {
    const connection = await amqp.connect(config.RABBITMQ_URI);
    connection.on("error", (err) => {
      console.error("RabbitMQ connection error:", err.message);
      channel = null;
    });
    channel = await connection.createChannel();
    console.log("Connected to RabbitMQ");
  } catch (err) {
    console.error("RabbitMQ connection failed:", err.message);
    console.log("Server will continue without RabbitMQ");
  }
}

export async function publishToQueue(queueName, data) {
  if (!channel) {
    console.warn("RabbitMQ channel not available, skipping publish to:", queueName);
    return;
  }
  await channel.assertQueue(queueName, { durable: true });
  await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
  console.log("Message sent (Published) to queue: ", queueName);
}
