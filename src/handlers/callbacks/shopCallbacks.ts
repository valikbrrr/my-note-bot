import { Context } from "../../types/context";

async function showCurrentShopList(ctx: Context) {
  const items = ctx.session.shopItems || [];

  if (items.length === 0) {
    await ctx.reply(
      "📝 Список продуктов пуст.\n\n" +
        "Введите продукты или используйте кнопки:",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "✅ Готово", callback_data: "shop_done" }],
            [{ text: "❌ Отмена", callback_data: "shop_cancel" }],
          ],
        },
      },
    );
    return;
  }

  const keyboard = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const displayText = item.checked ? `🟢 ${item.name}` : `✅ ${item.name}`;
    keyboard.push([
      {
        text: displayText,
        callback_data: `shop_toggle_${i}`,
      },
    ]);
  }

  keyboard.push([
    { text: "➕ Добавить еще", callback_data: "shop_add_more" },
    { text: "🗑️ Очистить всё", callback_data: "shop_clear" },
  ]);
  keyboard.push([
    { text: "✅ Готово", callback_data: "shop_done" },
    { text: "❌ Отмена", callback_data: "shop_cancel" },
  ]);

  const checkedCount = items.filter((item) => item.checked).length;
  const totalCount = items.length;

  await ctx.reply(
    `🛒 Ваш список продуктов (${checkedCount}/${totalCount} куплено):\n\n` +
      items
        .map(
          (item, i) => `${i + 1}. ${item.checked ? "🟢" : "⬜"} ${item.name}`,
        )
        .join("\n") +
      `\n\n✅ Нажмите на продукт, чтобы отметить его как купленный`,
    {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    },
  );
}

export async function shopCallback(ctx: Context) {
  ctx.session.step = "waiting_for_shop_items";
  ctx.session.shopItems = [];

  await ctx.reply(
    "🛒 Введите продукты для списка.\n\n" +
      "Вы можете ввести их в любом формате:\n" +
      "• Каждый продукт с новой строки\n" +
      "• Через запятую: яйца, молоко, хлеб\n" +
      "• Или смешанно\n\n" +
      "Например:\n" +
      "яйца\n" +
      "молоко, хлеб\n" +
      "картофель\n\n" +
      "✅ После ввода нажмите 'Готово'",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "✅ Готово", callback_data: "shop_done" }],
          [{ text: "❌ Отмена", callback_data: "shop_cancel" }],
        ],
      },
    },
  );
}

export async function shopToggleCallback(ctx: Context) {
  const callbackData = ctx.callbackQuery?.data;
  if (!callbackData) {
    await ctx.answerCallbackQuery("❌ Ошибка: данные не найдены");
    return;
  }

  const parts = callbackData.split("_");
  const index = parseInt(parts[2]);

  if (
    isNaN(index) ||
    !ctx.session.shopItems ||
    index >= ctx.session.shopItems.length
  ) {
    await ctx.answerCallbackQuery("❌ Продукт не найден");
    return;
  }

  const item = ctx.session.shopItems[index];
  item.checked = !item.checked;

  await ctx.answerCallbackQuery(
    item.checked
      ? `✅ ${item.name} отмечен как купленный!`
      : `↩️ ${item.name} возвращен в список`,
  );

  await showCurrentShopList(ctx);

  try {
    await ctx.deleteMessage();
  } catch {
    // Если не удалось удалить, игнорируем
  }
}

export async function shopAddMoreCallback(ctx: Context) {
  ctx.session.step = "waiting_for_shop_items";
  await ctx.answerCallbackQuery("📝 Введите новые продукты");

  await ctx.reply(
    "📝 Введите продукты для добавления в список.\n\n" +
      "Форматы:\n" +
      "• Каждый с новой строки\n" +
      "• Через запятую: яйца, молоко\n\n" +
      "Нажмите 'Готово' когда закончите",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "✅ Готово", callback_data: "shop_done" }],
          [{ text: "❌ Отмена", callback_data: "shop_cancel" }],
        ],
      },
    },
  );
}

export async function shopClearCallback(ctx: Context) {
  ctx.session.shopItems = [];
  await ctx.answerCallbackQuery("🗑️ Список очищен");
  await showCurrentShopList(ctx);
}

export async function shopDoneCallback(ctx: Context) {
  const items = ctx.session.shopItems || [];

  if (items.length === 0) {
    await ctx.answerCallbackQuery("⚠️ Список пуст!");
    await ctx.reply("📝 Вы не добавили ни одного продукта. Попробуйте снова.");
    return;
  }

  const shopList = items
    .map((item, i) => `${i + 1}. ${item.checked ? "🟢" : "⬜"} ${item.name}`)
    .join("\n");

  await ctx.answerCallbackQuery("✅ Список продуктов создан!");

  await ctx.reply(
    `✅ Список продуктов сохранен!\n\n` +
      `🛒 Ваш список:\n${shopList}\n\n` +
      `Всего продуктов: ${items.length}\n` +
      `Куплено: ${items.filter((item) => item.checked).length}`,
  );

  ctx.session.step = "idle";
  ctx.session.shopItems = undefined;
}

export async function shopCancelCallback(ctx: Context) {
  ctx.session.step = "idle";
  ctx.session.shopItems = undefined;

  await ctx.answerCallbackQuery("❌ Создание списка отменено");
  await ctx.reply("❌ Создание списка продуктов отменено.");
}