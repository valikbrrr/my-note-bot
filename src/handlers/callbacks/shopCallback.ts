import { Context } from "grammy";

export async function shopCallback(ctx: Context) {
  await ctx.editMessageText("Вы выбрали: 🛒 Создать список продуктов");
}