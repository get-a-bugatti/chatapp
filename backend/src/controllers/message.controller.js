import { asyncHandler } from "../utils/asyncHandler.js";

const sendMessagePrivate = asyncHandler(async (req, res, next) => {
  const { targetUserId, content } = req.body;
});

const sendMessageGlobal = asyncHandler(async (req, res, next) => {});
