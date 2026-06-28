import { Server } from "socket.io";
import { requireSocketAuth } from "../middlewares/socketAuth.middleware.js";
import {
  registerGlobalChatEvents,
  registerPrivateChatEvents,
} from "./handleChatEvents.js";
import { registerMessageHistoryEvents } from "./handleMessageHistory.js";

const allowedOrigins = [
  "http://localhost:5173",
  "https://chatapp-nine-sepia.vercel.app",
  "https://chatapp-git-feature-responsive-39b7da-redoxs-projects-b1ca2819.vercel.app",
  "http://192.168.18.58:5173",
];

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
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
