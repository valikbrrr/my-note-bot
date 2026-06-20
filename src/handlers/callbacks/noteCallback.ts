import { Context } from "../../types/context";
import { UserService } from "../../services/userService"; // 👈 Добавь этот импорт

const userService = new UserService();

export async function noteCallback(ctx: Context) {
  if (!ctx.from || !ctx.callbackQuery) return;
  
  // Сохраняем пользователя
  await userService.findOrCreate(ctx.from.id, {
    username: ctx.from.username,
    firstName: ctx.from.first_name,
    lastName: ctx.from.last_name
  });
  
  // Устанавливаем состояние ожидания заголовка заметки
  ctx.session.step = "waiting_for_note_title";
  
  await ctx.editMessageText(
    "📝 Введите заголовок заметки:",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "❌ Отмена", callback_data: "cancel" }]
        ]
      }
    }
  );
}