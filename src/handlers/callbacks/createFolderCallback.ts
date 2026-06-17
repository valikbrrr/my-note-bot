import { Context } from "../../types/context.js";

export async function createFolderFromListCallback(ctx: Context) {
  if (!ctx.from || !ctx.callbackQuery) return;
  
  ctx.session.step = "waiting_for_folder_name";
  ctx.session.returnTo = "folders_list";
  
  await ctx.editMessageText(
    "📁 Введите название новой папки:",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "❌ Отмена", callback_data: "back_to_folders" }]
        ]
      }
    }
  );
}