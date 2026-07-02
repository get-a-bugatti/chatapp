import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { objectId } from "../utils/objectId.js";
import { sendEmail } from "../utils/nodemailer.js";
import crypto from "crypto";

const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res, next) => {
  const { fullName, username, email, password } = req.body;

  if (
    [fullName, username, email, password].some((el) => !el || el.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required.");
  }

  const usernameCheck = await User.exists({
    username: username,
  });

  if (usernameCheck) {
    throw new ApiError(400, "Username unavailable.");
  }

  const emailCheck = await User.exists({
    email: email,
  });

  if (emailCheck) {
    throw new ApiError(400, "Email unavailable.");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required.");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  let coverImage;

  if (coverImageLocalPath) {
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
  }

  const userData = {
    fullName,
    username,
    email,
    password,
    avatar: avatar.url,
  };

  if (coverImage?.url) {
    userData.coverImage = coverImage.url;
  }

  const response = await User.create(userData);

  const userObj = response.toObject();
  delete userObj.password;
  delete userObj.__v;

  return res
    .status(201)
    .json(new ApiResponse(200, "User created successfully.", userObj));
});

const loginUser = asyncHandler(async (req, res, next) => {
  const { login, password } = req.body;

  const user = await User.findOne({
    $or: [{ email: login.trim() }, { username: login.trim() }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist.");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password.trim());

  if (!isPasswordCorrect) {
    throw new ApiError(403, "Invalid Password.");
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, "Logged in successfully.", {
        ...userObj,
        accessToken,
        refreshToken,
      })
    );
});

const logoutUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, "User logged out successfully."));
});

const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(400, "Missing refresh token.");
  }

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodedToken?._id);

  if (!user) {
    throw new ApiError(401, "Invalid Refresh Token.");
  }

  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(400, "Refresh Token is expired or used.");
  }

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  const { refreshToken: newRefreshToken, accessToken: newAccessToken } =
    await generateTokens(user._id);

  return res
    .status(200)
    .cookie("accessToken", newAccessToken, cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(
      new ApiResponse(200, "Tokens renewed successfully.", {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      })
    );
});

const changeUserPassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword, confPassword } = req.body;

  const trimmedOldPass = oldPassword.trim();
  const trimmedNewPass = newPassword.trim();
  const trimmedConfPass = confPassword.trim();

  if (
    [trimmedOldPass, trimmedNewPass, trimmedConfPass].some(
      (el) => el.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required.");
  }

  if (trimmedNewPass !== trimmedConfPass) {
    throw new ApiError(400, "New password fields do not match.");
  }

  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "User not logged in.");
  }

  const targetUser = await User.findById(userId);

  if (!targetUser) {
    throw new ApiError(404, "User not found.");
  }

  const isOldPasswordValid = await targetUser.isPasswordCorrect(trimmedOldPass);

  if (!isOldPasswordValid) {
    throw new ApiError(401, "Invalid User password.");
  }

  targetUser.password = trimmedNewPass;
  await targetUser.save({
    validateBeforeSave: false,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Password changed successfully."));
});

const getCurrentUser = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized Access.");
  }

  const user = await User.findById(userId).select(
    "-password -refreshToken -otp -passwordReset"
  );

  if (!user) {
    throw new ApiError(404, "Couldn't find user.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "User fetched successfully.", user));
});

const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select(
    "-password -refreshToken -otp -passwordReset"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Users fetched successfully.", users));
});

const getAllOtherUsers = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized Access.");
  }

  const users = await User.find({
    _id: { $ne: objectId(userId) },
  }).select("-password -refreshToken -otp -passwordReset");

  return res
    .status(200)
    .json(new ApiResponse(200, "Users fetched successfully.", users));
});

const getUserById = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(401, "Unauthorized Access.");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }

  const user = await User.findById(userId).select(
    "-password -refreshToken -otp -passwordReset"
  );

  if (!user) {
    throw new ApiError(404, "Couldn't find user.");
  }

  return res.status(200).json(new ApiResponse(200, "User found.", user));
});

const getUserByUsername = asyncHandler(async (req, res, next) => {
  const { username } = req.body;

  if (!username.trim() || typeof username !== "string") {
    throw new ApiError(400, "Invalid Username.");
  }

  const users = await User.find({
    username,
  }).select("-password -refreshToken -otp -passwordReset");

  if (!users) {
    throw new ApiError(404, "Couldn't find user.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Users fetched successfully.", users));
});

const forgotPassword = asyncHandler(async (req, res, next) => {
  const { login } = req.body;

  if (!login) {
    throw new ApiError(400, "Missing Login.");
  }

  const trimmedLogin = login.trim();

  if (!trimmedLogin) {
    throw new ApiError(400, "Missing Login.");
  }

  const user = await User.findOne({
    $or: [{ email: trimmedLogin }, { username: trimmedLogin }],
  });

  if (!user) {
    throw new ApiError(404, "Couldn't find user.");
  }

  const resetToken = crypto.randomBytes(32).toString("hex").substring(0, 6);

  await user.setOtp(resetToken);

  await sendEmail(user.email, resetToken);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Password Reset instructions sent successfully. Check Your Email.",
        {}
      )
    );
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { login, otp } = req.body;

  if (!login) {
    throw new ApiError(400, "Missing Login.");
  }

  if (!otp) {
    throw new ApiError(400, "Missing OTP.");
  }

  const trimmedLogin = login.trim();
  const trimmedOtp = otp.trim();

  if (!trimmedLogin) {
    throw new ApiError(400, "Missing Login.");
  }

  if (!trimmedOtp) {
    throw new ApiError(400, "Missing OTP.");
  }

  const user = await User.findOne({
    $or: [{ email: trimmedLogin }, { username: trimmedLogin }],
  });

  if (!user) {
    throw new ApiError(404, "Couldn't find user.");
  }

  if (!(await user.isOtpValid(trimmedOtp))) {
    throw new ApiError(400, "Invalid or expired OTP.");
  }

  // OTP is no longer needed
  await user.resetOtp();

  // Generate a cryptographically secure reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Store only the hash
  await user.setPasswordResetToken(resetToken);

  return res.status(200).json(
    new ApiResponse(200, "OTP verified successfully.", {
      resetToken,
    })
  );
});

const setNewPassword = asyncHandler(async (req, res, next) => {
  const { login, resetToken, password, confirmPassword } = req.body;

  if (!resetToken || typeof resetToken !== "string") {
    throw new ApiError(400, "Missing or invalid reset token.");
  }

  if (!login) {
    throw new ApiError(400, "Missing Login.");
  }

  const trimmedLogin = login.trim();

  if (!trimmedLogin) {
    throw new ApiError(400, "Missing Login.");
  }

  const trimmedPassword = password.trim();
  const trimmedConfirmPassword = confirmPassword.trim();

  if (trimmedPassword !== trimmedConfirmPassword) {
    throw new ApiError(400, "Passwords do not match.");
  }

  const user = await User.findOne({
    $or: [{ email: trimmedLogin }, { username: trimmedLogin }],
  });

  if (!user) {
    throw new ApiError(404, "Couldn't find user.");
  }

  if (!(await user.isResetTokenValid(resetToken))) {
    throw new ApiError(400, "Invalid or expired reset token.");
  }

  user.password = trimmedPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "Password changed successfully.", {}));
});

export {
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
};
