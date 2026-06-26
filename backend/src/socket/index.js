import { Server } from "socket.io";
import { requireSocketAuth } from "../middlewares/socketAuth.middleware.js";
import {
  registerGlobalChatEvents,
  registerPrivateChatEvents,
} from "./handleChatEvents.js";
import { registerMessageHistoryEvents } from "./handleMessageHistory.js";

export const initializeSocket = (httpServer) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://chatapp-nine-sepia.vercel.app",
  ];

  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
          return callback(null, true);
        }

        callback(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(requireSocketAuth);

  io.on("connection", (socket) => {
    console.log("Server: New client connected.", {
      socketId: socket.id,
      username: socket.user.username,
    });

    const userId = socket.user._id.toString();

    socket.join(userId);

    registerGlobalChatEvents(io, socket);
    registerPrivateChatEvents(io, socket);
    registerMessageHistoryEvents(socket);
  });
};
