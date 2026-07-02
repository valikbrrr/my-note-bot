import { Context } from "../../types/context";
import { shopDoneCallback } from "../callbacks/shopCallbacks";

export async function doneCommand(ctx: Context) {
  if (ctx.session.step === "waiting_for_shop_items") {
    const items = ctx.session.shopItems || [];
    if (items.length === 0) {
      await ctx.reply("⚠️ Список пуст! Добавьте продукты или отмените.");
      return;
    }
    await shopDoneCallback(ctx);
  } else {
    await ctx.reply("Вы не в процессе создания списка продуктов.");
  }
}