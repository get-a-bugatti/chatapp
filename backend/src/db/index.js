import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export const connectDb = async () => {
  try {
    return await mongoose.connect(
      `mongodb+srv://k3nny_db_user:%40Manis20620926@cluster0.k702xdq.mongodb.net/${DB_NAME}?appName=Cluster0`
    );
  } catch (error) {
    console.error("MongoDB Error :", error);
    throw new Error(error.message);
  }
};
