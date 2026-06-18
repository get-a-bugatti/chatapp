import { Server } from "socket.io";
import { requireSocketAuth } from "../middlewares/socketAuth.middleware.js";
import {
  registerGlobalChatEvents,
  registerPrivateChatEvents,
} from "./handleChatEvents.js";
import { registerMessageHistoryEvents } from "./handleMessageHistory.js";

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://chatapp-nine-sepia.vercel.app",
      ],
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

    socket.join(socket.user._id);

    registerGlobalChatEvents(io, socket);
    registerPrivateChatEvents(io, socket);
    registerMessageHistoryEvents(socket);
  });
};
