import { Context } from "../../types/context";

export async function noteCallback(ctx: Context) {
  if (!ctx.from || !ctx.callbackQuery) return;
  
  ctx.session.step = "waiting_for_note";
  
  await ctx.editMessageText(
    "📝 Введите текст вашей заметки:",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "❌ Отмена", callback_data: "cancel" }]
        ]
      }
    }
  );
}