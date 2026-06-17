import { Context } from "../../types/context.js";
import { FolderService } from "../../services/folderService.js";
import { folderListKeyboard } from "../../keyboards/folderKeyboard";
import { mainKeyboard } from "../../keyboards/mainKeyboard";

const folderService = new FolderService();

export async function backToFoldersCallback(ctx: Context) {
  if (!ctx.from || !ctx.callbackQuery) return;
  
  const folders = await folderService.getUserFolders(ctx.from.id);
  
  await ctx.editMessageText(
    folders.length === 0 
      ? "📭 У вас пока нет папок."
      : "📂 Ваши папки:",
    {
      reply_markup: folderListKeyboard(folders)
    }
  );
}

export async function backToMainCallback(ctx: Context) {
  if (!ctx.from || !ctx.callbackQuery) return;
  
  ctx.session.step = "idle";
  ctx.session.tempNote = undefined;
  ctx.session.tempFolderId = undefined;
  ctx.session.returnTo = undefined;
  
  await ctx.editMessageText(
    "Главное меню:",
    { reply_markup: mainKeyboard }
  );
}