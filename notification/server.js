import app from "./src/app.js";
import { connect } from "./src/broker/rabbit.js";
import startListener from "./src/broker/listner.js";

connect().then(startListener);

app.listen(3000, () => {
  console.log("Notification server listening on port 3000");
});
