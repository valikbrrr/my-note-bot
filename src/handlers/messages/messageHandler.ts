import { Context } from "grammy";
import { FolderService } from "../../services/folderService.js";
import { folderListKeyboard } from "../../keyboards/folderKeyboard.js";

const folderService = new FolderService();

export async function handleTextMessage(ctx: Context) {
  if (!ctx.from || !ctx.message || !ctx.message.text) return;
  
  const text = ctx.message.text;
  
  // Обработка создания папки
  if (ctx.session.step === "waiting_for_folder_name") {
    try {
      const folder = await folderService.createFolder(text, ctx.from.id);
      
      await ctx.reply(`✅ Папка "${folder.name}" успешно создана!`);
      
      // Если пришли из списка папок, показываем обновленный список
      if (ctx.session.returnTo === "folders_list") {
        const folders = await folderService.getUserFolders(ctx.from.id);
        await ctx.reply(
          "📂 Обновленный список папок:",
          { reply_markup: folderListKeyboard(folders) }
        );
      }
      
      ctx.session.step = "idle";
      ctx.session.returnTo = undefined;
      
      return;
    } catch (error: any) {
      await ctx.reply(`❌ ${error.message}`);
      return;
    }
  }
  
  // Обработка переименования папки
  if (ctx.session.step === "waiting_for_folder_rename") {
    try {
      const folderId = ctx.session.tempFolderId;
      if (!folderId) {
        await ctx.reply("❌ Ошибка: папка не найдена");
        ctx.session.step = "idle";
        return;
      }
      
      const folder = await folderService.renameFolder(folderId, ctx.from.id, text);
      await ctx.reply(`✅ Папка переименована в "${folder.name}"`);
      
      // Показываем обновленную информацию о папке
      const updatedFolder = await folderService.getFolderById(folderId, ctx.from.id);
      if (updatedFolder) {
        await ctx.reply(
          `📁 Папка: *${updatedFolder.name}*`,
          {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [{ text: "📝 Посмотреть заметки", callback_data: `view_notes_in_folder_${folderId}` }],
                [{ text: "🔙 Назад к списку", callback_data: "back_to_folders" }]
              ]
            }
          }
        );
      }
      
      ctx.session.step = "idle";
      ctx.session.tempFolderId = undefined;
      
      return;
    } catch (error: any) {
      await ctx.reply(`❌ ${error.message}`);
      return;
    }
  }
}