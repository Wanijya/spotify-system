import app from "./src/app.js";
import connectDB from "./src/db/db.js";

connectDB();

app.listen(3001, () => {
  console.log("Music server listening on port 3001");
});
