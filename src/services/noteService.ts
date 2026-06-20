import { Note } from "../database/models/Note";
import mongoose from "mongoose";

export class NoteService {
  async createNote(
    title: string,
    content: string,
    userId: number,
    folderId?: string,
  ) {
    const note = new Note({
      title,
      content,
      userId,
      folderId: folderId ? new mongoose.Types.ObjectId(folderId) : undefined,
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

  async updateNote(
    noteId: string,
    userId: number,
    data: { title?: string; content?: string },
  ) {
    const updateData: any = { updatedAt: new Date() };
    if (data.title) updateData.title = data.title;
    if (data.content) updateData.content = data.content;

    return await Note.findOneAndUpdate({ _id: noteId, userId }, updateData, {
      new: true,
    });
  }

  async deleteNote(noteId: string, userId: number) {
    return await Note.findOneAndDelete({ _id: noteId, userId });
  }

  async moveNoteToFolder(noteId: string, userId: number, folderId: string) {
    return await Note.findOneAndUpdate(
      { _id: noteId, userId },
      { folderId: new mongoose.Types.ObjectId(folderId) },
      { new: true },
    );
  }

  async getNotesByFolder(folderId: string, userId: number) {
    return await Note.find({
      userId,
      folderId: new mongoose.Types.ObjectId(folderId),
    }).sort({ createdAt: -1 });
  }
}
