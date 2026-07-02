import { bot } from "./bot";
import { connectDatabase } from "./database/connection";
import { registerHandlers } from "./handlers";
import { setupErrorHandler } from "./middleware/errorHandler";

function setBotCommands() {
  return bot.api.setMyCommands([
    { command: "start", description: "Начать работу с ботом" },
    { command: "help", description: "Получить справку" },
  ]);
}

async function startBot() {
  try {
    await connectDatabase();
    await setBotCommands();

    registerHandlers();
    setupErrorHandler();

    bot.start();
    console.log("🤖 Bot started successfully");
  } catch (error) {
    console.error("Failed to start bot:", error);
    process.exit(1);
  }
}

startBot();
