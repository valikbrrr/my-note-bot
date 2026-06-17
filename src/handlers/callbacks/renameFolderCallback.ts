import { Context } from "../../types/context.js";

export async function renameFolderCallback(ctx: Context) {
  if (!ctx.from || !ctx.callbackQuery || !ctx.callbackQuery.data) return;

  const folderId = ctx.callbackQuery.data.replace("rename_folder_", "");

  ctx.session.step = "waiting_for_folder_rename";
  ctx.session.tempFolderId = folderId;

  await ctx.editMessageText("✏️ Введите новое название папки:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "❌ Отмена", callback_data: `view_folder_${folderId}` }],
      ],
    },
  });
}
