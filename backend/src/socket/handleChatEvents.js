import { Message } from "../models/message.model.js";

export const registerGlobalChatEvents = async (io, socket) => {
  const userId = socket.user._id.toString();

  socket.on("global_message", async (message, callback) => {
    try {
      const savedMessage = await Message.create({
        mode: "global",
        content: message.content,
        from: userId,
      });

      io.emit("global_message", {
        id: savedMessage._id,
        mode: savedMessage.mode,
        content: savedMessage.content,
        from: userId, // Send ID so frontend can check isMe
        createdAt: savedMessage.createdAt,
      });

      if (callback) {
        callback({
          status: "ok",
          id: savedMessage._id,
        });
      }
    } catch (err) {
      if (callback) {
        callback({
          status: "error",
          message:
            process.env.NODE_ENV === "development" ? err.stack : err.message,
        });
      }
    }
  });
};

export const registerPrivateChatEvents = async (io, socket) => {
  const userId = socket.user._id.toString();

  socket.on("private_message", async (message, callback) => {
    try {
      const savedMessage = await Message.create({
        mode: "private",
        content: message.content,
        from: userId,
        to: message.to,
      });

      if (savedMessage) {
        const messagePayload = {
          id: savedMessage._id,
          mode: savedMessage.mode,
          content: savedMessage.content,
          from: userId,
          createdAt: savedMessage.createdAt,
        };

        io.to([userId, message.to]).emit("private_message", messagePayload);
      }

      if (callback) {
        callback({
          status: "ok",
          id: savedMessage._id,
        });
      }
    } catch (err) {
      if (callback) {
        callback({
          status: "error",
          message:
            process.env.NODE_ENV === "development" ? err.stack : err.message,
        });
      }
    }
  });
};
