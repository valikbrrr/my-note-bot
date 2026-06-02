import { Context } from "grammy";

export async function helpCommand(ctx: Context) {
  await ctx.reply(
    "Доступные команды:\n/start - Начать работу\n/help - Получить справку"
  );
}