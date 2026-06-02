import { Context } from "grammy";

export async function noteCallback(ctx: Context) {
  await ctx.editMessageText("Введите вашу заметку...");
}
