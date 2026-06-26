import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { healthcheck } from "./controllers/healthcheck.controller.js";
import userRouter from "./routes/user.routes.js";
// import messageRouter from "./routes/message.routes.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://chatapp-nine-sepia.vercel.app",
      "https://chatapp-git-feature-responsive-39b7da-redoxs-projects-b1ca2819.vercel.app",
      "https://chatapp-1pd7hkdaz-redoxs-projects-b1ca2819.vercel.app/",
      "https://chatapp-git-feature-responsive-39b7da-redoxs-projects-b1ca2819.vercel.app",
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/health", healthcheck);
app.use("/api/v1/health", healthcheck);
app.use("/api/v1/users", userRouter);
// app.use("/api/v1/messages", messageRouter);

app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error.",
    stack: process.env.NODE_ENV === "development" ? err.stack : {}, // remove it later in production
    // or better yet, implement a logging software.
  });
});

export { app };
