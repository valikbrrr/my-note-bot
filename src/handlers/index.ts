import { bot } from "../bot";
import { startCommand } from "./commands/start";
import { helpCommand } from "./commands/help";
import { noteCallback } from "./callbacks/noteCallback";
import { shopCallback } from "./callbacks/shopCallback";
import {
  listFoldersCallback,
  viewFolderCallback,
} from "./callbacks/folderListCallback";
import {
  viewNotesInFolderCallback,
  viewNoteCallback,
  editNoteCallback,
  deleteNoteCallback,
  confirmDeleteNoteCallback,
  moveNoteCallback,
  confirmMoveNoteCallback,
} from "./callbacks/noteCallbacks";
import { createFolderFromListCallback } from "./callbacks/createFolderCallback";
import {
  deleteFolderCallback,
  confirmDeleteFolderCallback,
} from "./callbacks/deleteFolderCallback";
import { handleTextMessage } from "./messages/messageHandler";
import {
  backToFoldersCallback,
  backToMainCallback,
} from "./callbacks/navigationCallback";
import {
  handleSaveToFolder,
  handleNoFolder,
  handleCreateFolder,
} from "./callbacks/folderSaveCallback";
import { renameFolderCallback } from "./callbacks/renameFolderCallback";

export function registerHandlers() {
  // Команды
  bot.command("start", startCommand);
  bot.command("help", helpCommand);

  // Навигация
  bot.callbackQuery("back_to_folders", backToFoldersCallback);
  bot.callbackQuery("back_to_main", backToMainCallback);
  bot.callbackQuery("back_to_notes", listFoldersCallback);

  // Callback'и для заметок
  bot.callbackQuery("answer_note", noteCallback);
  bot.callbackQuery("answer_shop", shopCallback);
  bot.callbackQuery(/^view_notes_in_folder_.+/, viewNotesInFolderCallback);
  bot.callbackQuery(/^view_note_.+/, viewNoteCallback);
  bot.callbackQuery(/^edit_note_.+/, editNoteCallback);
  bot.callbackQuery(/^delete_note_.+/, deleteNoteCallback);
  bot.callbackQuery(/^confirm_delete_note_.+/, confirmDeleteNoteCallback);
  bot.callbackQuery(/^move_note_.+/, moveNoteCallback);
  bot.callbackQuery(/^confirm_move_note_.+/, confirmMoveNoteCallback);

  // Callback'и для папок
  bot.callbackQuery("list_folders", listFoldersCallback);
  bot.callbackQuery(/^view_folder_.+/, viewFolderCallback);
  bot.callbackQuery("create_folder_from_list", createFolderFromListCallback);
  bot.callbackQuery(/^rename_folder_.+/, renameFolderCallback);
  bot.callbackQuery(/^delete_folder_.+/, deleteFolderCallback);
  bot.callbackQuery(/^confirm_delete_folder_.+/, confirmDeleteFolderCallback);

  // Callback'и для сохранения
  bot.callbackQuery(/^save_to_folder_.+/, handleSaveToFolder);
  bot.callbackQuery("no_folder", handleNoFolder);
  bot.callbackQuery("create_folder", handleCreateFolder);

  // Обработка текстовых сообщений
  bot.on(":text", handleTextMessage);
}