import { bot } from "../bot";
import { startCommand } from "./commands/start";
import { helpCommand } from "./commands/help";
import { noteCallback } from "./callbacks/noteCallback";
import { shopCallback } from "./callbacks/shopCallback";

export function registerHandlers() {
  // Команды
  bot.command("start", startCommand);
  bot.command("help", helpCommand);
  
  // Callback'и
  bot.callbackQuery("answer_note", noteCallback);
  bot.callbackQuery("answer_shop", shopCallback);
}