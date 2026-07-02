import { Folder } from "../database/models/Folder";
import { Note } from "../database/models/Note";

export class FolderService {
  async createFolder(name: string, userId: number) {
    const existingFolder = await Folder.findOne({ name, userId });
    if (existingFolder) {
      throw new Error("Папка с таким именем уже существует");
    }
    
    const folder = new Folder({ name, userId });
    return await folder.save();
  }

  async getUserFolders(userId: number) {
    return await Folder.find({ userId }).sort({ createdAt: -1 });
  }

  async getFolderById(folderId: string, userId: number) {
    return await Folder.findOne({ _id: folderId, userId });
  }

  async getNoteCountInFolder(folderId: string, userId: number) {
    return await Note.countDocuments({ folderId, userId });
  }

  async renameFolder(folderId: string, userId: number, newName: string) {
    const folder = await this.getFolderById(folderId, userId);
    if (!folder) throw new Error("Папка не найдена");
    
    const existingFolder = await Folder.findOne({ name: newName, userId });
    if (existingFolder && existingFolder._id.toString() !== folderId) {
      throw new Error("Папка с таким именем уже существует");
    }
    
    folder.name = newName;
    return await folder.save();
  }

  async updateFolder(folderId: string, userId: number, data: { name: string }) {
    const folder = await this.getFolderById(folderId, userId);
    if (!folder) throw new Error("Папка не найдена");
    
    const existingFolder = await Folder.findOne({ name: data.name, userId });
    if (existingFolder && existingFolder._id.toString() !== folderId) {
      throw new Error("Папка с таким именем уже существует");
    }
    
    folder.name = data.name;
    return await folder.save();
  }

  async deleteFolder(folderId: string, userId: number) {
    const folder = await this.getFolderById(folderId, userId);
    if (!folder) throw new Error("Папка не найдена");
    
    await Note.updateMany(
      { folderId, userId },
      { folderId: null }
    );
    
    return await Folder.findOneAndDelete({ _id: folderId, userId });
  }

  async addNoteToFolder(noteId: string, folderId: string, userId: number) {
    const folder = await this.getFolderById(folderId, userId);
    if (!folder) throw new Error("Папка не найдена");
    
    return await Note.findOneAndUpdate(
      { _id: noteId, userId },
      { folderId: folder._id },
      { new: true }
    );
  }
}