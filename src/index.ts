import "dotenv/config";
import mongoose from "mongoose";
import { Bot, GrammyError, HttpError } from "grammy";

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("Error: BOT_TOKEN is not defined in .env file");
  process.exit(1);
}

const bot = new Bot(BOT_TOKEN);

async function setBotCommands() {
  await bot.api.setMyCommands([
    { command: "start", description: "Начать работу с ботом" },
    { command: "help", description: "Получить справку" },
  ]);
}

bot.command("start", (ctx) =>
  ctx.reply("Привет! Что ты хочешь создать?", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📝 Создать заметку", callback_data: "answer_note" }],
        [
          {
            text: "🛒 Создать список продуктов",
            callback_data: "answer_shop",
          },
        ],
      ],
    },
  }),
);

bot.command("help", (ctx) =>
  ctx.reply(
    "Доступные команды:\n/start - Начать работу\n/help - Получить справку",
  ),
);

bot.callbackQuery("answer_note", async (ctx) => {
  await ctx.editMessageText("Введите вашу заметку...");
});

bot.callbackQuery("answer_shop", async (ctx) => {
  await ctx.editMessageText("Вы выбрали: 🛒 Создать список продуктов");
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;

  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

async function startBot() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }

  try {
    await mongoose.connect(MONGODB_URI);

    await setBotCommands();

    bot.start();
    console.log("MongoDB connected & bot started");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

startBot();
