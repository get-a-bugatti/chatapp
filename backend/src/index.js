import "../config/env.js";
import { app } from "./app.js";
import { connectDb } from "./db/index.js";
import { initializeSocket } from "./socket/index.js";
import http from "http";

connectDb()
  .then((connectionInstance) => {
    console.log(
      `MongoDb connection succeded. Host: ${connectionInstance.connection.host}`
    );

    const httpServer = http.createServer(app);

    httpServer.listen(process.env.PORT || 8000, () => {
      console.log(`Server started on port ${process.env.PORT || 8000}`);
    });

    initializeSocket(httpServer);

    httpServer.on("error", (err) => {
      console.error("Server Error :", err);
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error("Startup Error:", error);
    process.exit(1);
  });
