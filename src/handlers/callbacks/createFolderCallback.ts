import { Context } from "grammy";

export async function createFolderFromListCallback(ctx: Context) {
  if (!ctx.from || !ctx.callbackQuery) return;
  
  // Устанавливаем состояние ожидания названия папки
  ctx.session.step = "waiting_for_folder_name";
  ctx.session.returnTo = "folders_list"; // Запоминаем, откуда пришли
  
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