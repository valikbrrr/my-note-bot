import { InlineKeyboard } from "grammy";
import { IFolder } from "../database/models/Folder.js";

export const folderListKeyboard = (folders: IFolder[]) => {
  const keyboard = new InlineKeyboard();
  
  if (folders.length === 0) {
    keyboard.text("📭 Нет папок", "no_folders");
  } else {
    folders.forEach(folder => {
      keyboard.text(`📁 ${folder.name}`, `view_folder_${folder._id}`).row();
    });
  }
  
  keyboard.text("➕ Создать новую папку", "create_folder_from_list").row();
  keyboard.text("🔙 Назад", "back_to_main");
  
  return keyboard;
};

export const folderActionsKeyboard = (folderId: string) => {
  return new InlineKeyboard()
    .text("✏️ Переименовать", `rename_folder_${folderId}`)
    .text("🗑️ Удалить", `delete_folder_${folderId}`)
    .row()
    .text("📝 Показать заметки", `view_notes_in_folder_${folderId}`)
    .row()
    .text("🔙 Назад к списку", "back_to_folders");
};