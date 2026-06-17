import { Folder } from "../database/models/Folder";
import { Note } from "../database/models/Note";

export class FolderService {
  async createFolder(name: string, userId: number) {
    // Проверяем, существует ли папка с таким именем у пользователя
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
    
    // Проверяем, не существует ли уже папка с новым именем
    const existingFolder = await Folder.findOne({ name: newName, userId });
    if (existingFolder && existingFolder._id.toString() !== folderId) {
      throw new Error("Папка с таким именем уже существует");
    }
    
    folder.name = newName;
    return await folder.save();
  }

  async deleteFolder(folderId: string, userId: number) {
    const folder = await this.getFolderById(folderId, userId);
    if (!folder) throw new Error("Папка не найдена");
    
    // Переносим заметки из удаляемой папки в "Без папки"
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