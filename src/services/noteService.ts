import { Note } from "../database/models/Note";
import mongoose from "mongoose";

export class NoteService {
  async createNote(content: string, userId: number, folderId?: string) {
    const note = new Note({
      content,
      userId,
      folderId: folderId ? new mongoose.Types.ObjectId(folderId) : undefined
    });
    return await note.save();
  }

  async getUserNotes(userId: number, folderId?: string) {
    const filter: any = { userId };
    if (folderId) {
      filter.folderId = new mongoose.Types.ObjectId(folderId);
    } else {
      filter.folderId = null;
    }
    return await Note.find(filter).sort({ createdAt: -1 });
  }

  async getNoteById(noteId: string, userId: number) {
    return await Note.findOne({ _id: noteId, userId });
  }

  async updateNote(noteId: string, userId: number, content: string) {
    return await Note.findOneAndUpdate(
      { _id: noteId, userId },
      { content, updatedAt: new Date() },
      { new: true }
    );
  }

  async deleteNote(noteId: string, userId: number) {
    return await Note.findOneAndDelete({ _id: noteId, userId });
  }
}