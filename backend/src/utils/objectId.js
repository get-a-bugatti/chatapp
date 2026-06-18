import mongoose from "mongoose";

export const objectId = (id) => {
  if (!id) return null;

  // already ObjectId → return as is
  if (id instanceof mongoose.Types.ObjectId) {
    return id;
  }

  // valid string → convert
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }

  // invalid → throw error
  throw new Error("Invalid ObjectId");
};
