import mongoose, { Schema, Document } from "mongoose";

export interface INote extends Document {
  content: string;
  userId: number;
  folderId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema({
  content: { type: String, required: true },
  userId: { type: Number, required: true, ref: "User" },
  folderId: { type: Schema.Types.ObjectId, ref: "Folder", default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export const Note = mongoose.model<INote>("Note", NoteSchema);