import { Bot } from "grammy";
import { config } from "./config/env";

export const bot = new Bot(config.BOT_TOKEN!);