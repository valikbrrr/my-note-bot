import { Context } from "../../types/context.js"; // 👈 Используй правильный тип
import { FolderService } from "../../services/folderService.js";
import { folderListKeyboard } from "../../keyboards/folderKeyboard.js";

const folderService = new FolderService();

export async function deleteFolderCallback(ctx: Context) {
  if (!ctx.from || !ctx.callbackQuery || !ctx.callbackQuery.data) return;
  
  const folderId = ctx.callbackQuery.data.replace("delete_folder_", "");
  const folder = await folderService.getFolderById(folderId, ctx.from.id);
  
  if (!folder) {
    await ctx.answerCallbackQuery("❌ Папка не найдена");
    return;
  }
  
  await ctx.editMessageText(
    `⚠️ Вы уверены, что хотите удалить папку *${folder.name}*?\n\n` +
    `Заметки из папки будут перемещены в "Без папки".`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Да, удалить", callback_data: `confirm_delete_folder_${folderId}` },
            { text: "❌ Нет", callback_data: `view_folder_${folderId}` }
          ]
        ]
      }
    }
  );
}

export async function confirmDeleteFolderCallback(ctx: Context) {
  if (!ctx.from || !ctx.callbackQuery || !ctx.callbackQuery.data) return;
  
  const folderId = ctx.callbackQuery.data.replace("confirm_delete_folder_", "");
  
  try {
    await folderService.deleteFolder(folderId, ctx.from.id);
    await ctx.editMessageText("✅ Папка успешно удалена! Заметки перемещены в 'Без папки'.");
    
    // Показываем обновленный список папок
    const folders = await folderService.getUserFolders(ctx.from.id);
    await ctx.reply(
      folders.length === 0 
        ? "📭 У вас пока нет папок."
        : "📂 Обновленный список папок:",
      {
        reply_markup: folderListKeyboard(folders)
      }
    );
  } catch (error) {
    await ctx.editMessageText("❌ Ошибка при удалении папки");
  }
}