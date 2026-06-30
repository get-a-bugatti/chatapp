import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeUserPassword,
  getCurrentUser,
  getAllUsers,
  getAllOtherUsers,
  getUserById,
  getUserByUsername,
  forgotPassword,
  verifyOtp,
  setNewPassword,
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/signup").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser);
router.route("/forgot-password").post(forgotPassword);
router.route("/verify-otp").post(verifyOtp);
router.route("/set-new-password").post(setNewPassword);
router.route("/logout").get(requireAuth, logoutUser);
router.route("/refresh-tokens").get(refreshAccessToken);
router.route("/me").get(requireAuth, getCurrentUser);
router.route("/password").patch(requireAuth, changeUserPassword);
router.route("/all").get(requireAuth, getAllUsers);
router.route("/search").post(requireAuth, getUserByUsername);
router.route("/others").get(requireAuth, getAllOtherUsers);
router.route("/:userId").get(requireAuth, getUserById);

export default router;
