import { Context } from "grammy";
import { mainKeyboard } from "../../keyboards/mainKeyboard";

export async function startCommand(ctx: Context) {
  await ctx.reply("Привет! Что ты хочешь создать?", {
    reply_markup: mainKeyboard,
  });
}