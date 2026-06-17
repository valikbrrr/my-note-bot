import mongoose, { Schema, Document } from "mongoose";

export interface IFolder extends Document {
  name: string;
  userId: number;
  createdAt: Date;
}

const FolderSchema = new Schema({
  name: { type: String, required: true },
  userId: { type: Number, required: true, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

FolderSchema.index({ name: 1, userId: 1 }, { unique: true });

export const Folder = mongoose.model<IFolder>("Folder", FolderSchema);