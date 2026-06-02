import mongoose from "mongoose";
import { config } from "../config/env";

export async function connectDatabase() {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    throw error;
  }
}