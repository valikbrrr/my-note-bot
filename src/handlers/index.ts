import { bot } from "../bot.js";
import { startCommand } from "./commands/start.js";
import { helpCommand } from "./commands/help.js";
import { noteCallback } from "./callbacks/noteCallback.js";
import { shopCallback } from "./callbacks/shopCallback.js";
import {
  listFoldersCallback,
  viewFolderCallback,
} from "./callbacks/folderListCallback.js";
import { viewNotesInFolderCallback } from "./callbacks/viewNotesInFolderCallback.js";
import { createFolderFromListCallback } from "./callbacks/createFolderCallback.js";
import {
  renameFolderCallback,
  deleteFolderCallback,
  confirmDeleteFolderCallback,
} from "./callbacks/deleteFolderCallback.js";
import { handleTextMessage } from "./messages/messageHandler.js";
import {
  backToFoldersCallback,
  backToMainCallback,
} from "./callbacks/navigationCallback.js";

export function registerHandlers() {
  // Команды
  bot.command("start", startCommand);
  bot.command("help", helpCommand);

  bot.callbackQuery("back_to_folders", backToFoldersCallback);
  bot.callbackQuery("back_to_main", backToMainCallback);

  // Callback'и
  bot.callbackQuery("answer_note", noteCallback);
  bot.callbackQuery("answer_shop", shopCallback);
  bot.callbackQuery("list_folders", listFoldersCallback);
  bot.callbackQuery(/^view_folder_.+/, viewFolderCallback);
  bot.callbackQuery(/^view_notes_in_folder_.+/, viewNotesInFolderCallback);
  bot.callbackQuery("create_folder_from_list", createFolderFromListCallback);
  bot.callbackQuery(/^rename_folder_.+/, renameFolderCallback);
  bot.callbackQuery(/^delete_folder_.+/, deleteFolderCallback);
  bot.callbackQuery(/^confirm_delete_folder_.+/, confirmDeleteFolderCallback);

  // Обработка текстовых сообщений
  bot.on(":text", handleTextMessage);
}
