import { Context } from "grammy";
import { FolderService } from "../../services/folderService.js";

const folderService = new FolderService();

export async function deleteFolderCallback(ctx: Context) {
  if (!ctx.from || !ctx.callbackQuery) return;
  
  const folderId = ctx.callbackQuery.data.replace("delete_folder_", "");
  const folder = await folderService.getFolderById(folderId, ctx.from.id);
  
  if (!folder) {
    await ctx.answerCallbackQuery("❌ Папка не найдена");
    return;
  }
  
  // Запрашиваем подтверждение
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
  if (!ctx.from || !ctx.callbackQuery) return;
  
  const folderId = ctx.callbackQuery.data.replace("confirm_delete_folder_", "");
  
  try {
    await folderService.deleteFolder(folderId, ctx.from.id);
    await ctx.editMessageText("✅ Папка успешно удалена! Заметки перемещены в 'Без папки'.");
    
    // Показываем обновленный список папок через пару секунд
    setTimeout(async () => {
      await listFoldersCallback(ctx);
    }, 1500);
  } catch (error) {
    await ctx.editMessageText("❌ Ошибка при удалении папки");
  }
}