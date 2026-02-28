import amqp from "amqplib";
import config from "../config/config.js";

let channel, connection;

export async function connect() {
  connection = await amqp.connect(config.RABBITMQ_URI);
  channel = await connection.createChannel();

  console.log("Connected to RabbitMQ");
}

export async function publishToQueue(queueName, data) {
  await channel.assertQueue(queueName, { durable: true }); // assertQueue creates a queue if it doesn't exist
  await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
  console.log("Message sent (Published) to queue: ", queueName);
}
