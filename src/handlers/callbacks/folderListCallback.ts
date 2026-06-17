import { Context } from "../../types/context.js"; // 👈 Используй правильный тип
import { FolderService } from "../../services/folderService.js";
import { folderListKeyboard } from "../../keyboards/folderKeyboard.js";

const folderService = new FolderService();

export async function listFoldersCallback(ctx: Context) {
  if (!ctx.from || !ctx.callbackQuery) return;
  
  const folders = await folderService.getUserFolders(ctx.from.id);
  
  await ctx.editMessageText(
    folders.length === 0 
      ? "📭 У вас пока нет папок. Создайте первую!"
      : "📂 Ваши папки:",
    {
      reply_markup: folderListKeyboard(folders)
    }
  );
}

export async function viewFolderCallback(ctx: Context) {
  if (!ctx.from || !ctx.callbackQuery || !ctx.callbackQuery.data) return;
  
  const folderId = ctx.callbackQuery.data.replace("view_folder_", "");
  const folder = await folderService.getFolderById(folderId, ctx.from.id);
  
  if (!folder) {
    await ctx.answerCallbackQuery("❌ Папка не найдена");
    return;
  }
  
  const noteCount = await folderService.getNoteCountInFolder(folderId, ctx.from.id);
  
  await ctx.editMessageText(
    `📁 Папка: *${folder.name}*\n\n` +
    `📝 Заметок в папке: ${noteCount}\n` +
    `📅 Создана: ${folder.createdAt.toLocaleDateString()}`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "📝 Посмотреть заметки", callback_data: `view_notes_in_folder_${folderId}` }],
          [{ text: "✏️ Переименовать", callback_data: `rename_folder_${folderId}` }],
          [{ text: "🗑️ Удалить папку", callback_data: `delete_folder_${folderId}` }],
          [{ text: "🔙 Назад к списку", callback_data: "back_to_folders" }]
        ]
      }
    }
  );
}