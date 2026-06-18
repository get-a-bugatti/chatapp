import { Message } from "../models/message.model.js";

export const registerMessageHistoryEvents = (socket) => {
  const limit = 15;

  socket.on("get_global_messages", async ({ cursor }, callback) => {
    try {
      let query = {
        mode: "global",
      };

      // fetch older messages
      if (cursor) {
        query.createdAt = {
          $lt: cursor,
        };
      }

      const messages = await Message.find(query)
        .sort({ createdAt: -1 })
        .limit(limit);

      if (callback) {
        callback({
          success: true,
          messages: messages.reverse(),
        });
      }
    } catch (error) {
      if (callback) {
        callback({
          success: false,
          error: error.message,
        });
      }
    }
  });

  socket.on("get_private_messages", async ({ cursor }, callback) => {
    try {
      let query = {
        mode: "private",
        $or: [
          { from: socket.user._id },
          { to: socket.user._id }
        ]
      };

      // fetch older messages
      if (cursor) {
        query.createdAt = {
          $lt: cursor,
        };
      }

      const messages = await Message.find(query)
        .sort({ createdAt: -1 })
        .limit(limit);

      if (callback) {
        callback({
          success: true,
          messages: messages.reverse(),
        });
      }
    } catch (error) {
      if (callback) {
        callback({
          success: false,
          error: error.message,
        });
      }
    }
  });
};
