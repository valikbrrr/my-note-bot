import { Bot, session } from "grammy";
import { config } from "./config/env.js";
import { Context } from "./types/context.js";
import { SessionData } from "./types/session.js";

// Создаем бота с полным типом контекста
export const bot = new Bot<Context>(config.BOT_TOKEN);

// Настраиваем сессию
bot.use(session({
  initial: (): SessionData => ({
    step: "idle",
  }),
}));