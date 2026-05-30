import "dotenv/config";
import mongoose from "mongoose";
import { Bot, GrammyError, HttpError } from "grammy";

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("Error: BOT_TOKEN is not defined in .env file");
  process.exit(1);
}

const bot = new Bot(BOT_TOKEN);

bot.command("start", (ctx) =>
  ctx.reply("Привет! Отправь мне любой текст, и я его повторю."),
);

bot.on("message:text", (ctx) => {
  const text = ctx.message.text;
  ctx.reply(`Ты отправил: ${text || "не текст"}`);
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
    bot.start();
    console.log("MongoDB connected & bot started");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

startBot();
