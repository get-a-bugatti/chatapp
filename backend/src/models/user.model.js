import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    avatar: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    otp: {
      // password reset OTP
      pinHash: {
        type: String,
        default: null,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
    },

    passwordReset: {
      // password resetToken
      tokenHash: {
        type: String,
        default: null,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.pre("save", async function () {
  if (!this.isModified("otp.pinHash")) return;

  if (!this.otp.pinHash) return;

  this.otp.pinHash = await bcrypt.hash(this.otp.pinHash, 10);
});

userSchema.pre("save", async function () {
  if (!this.isModified("passwordReset.tokenHash")) return;

  if (!this.passwordReset.tokenHash) return;

  this.passwordReset.tokenHash = await bcrypt.hash(
    this.passwordReset.tokenHash,
    10
  );
});

userSchema.methods.setOtp = async function (pin) {
  this.otp.pinHash = pin;
  this.otp.expiresAt = new Date(Date.now() + 60000 * 10);

  await this.save({ validateBeforeSave: false });
};

userSchema.methods.resetOtp = async function () {
  this.otp.pinHash = null;
  this.otp.expiresAt = null;

  await this.save({ validateBeforeSave: false });
};

userSchema.methods.isOtpValid = async function (pin) {
  if (!this.otp || !this.otp.pinHash) return false;

  const isValid =
    (await bcrypt.compare(pin, this.otp.pinHash)) &&
    this.otp.expiresAt > Date.now();

  return isValid;
};

userSchema.methods.setPasswordResetToken = async function (token) {
  this.passwordReset.tokenHash = token;
  this.passwordReset.expiresAt = new Date(Date.now() + 60000 * 10);

  await this.save({ validateBeforeSave: false });
};

userSchema.methods.resetPasswordResetToken = async function () {
  this.passwordReset.tokenHash = null;
  this.passwordReset.expiresAt = null;

  await this.save({ validateBeforeSave: false });
};

userSchema.methods.isResetTokenValid = async function (token) {
  if (!this.passwordReset.tokenHash || !this.passwordReset.expiresAt)
    return false;

  return (
    (await bcrypt.compare(token, this.passwordReset.tokenHash)) &&
    this.passwordReset.expiresAt > Date.now()
  );
};

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
