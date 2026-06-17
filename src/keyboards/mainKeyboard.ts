import { InlineKeyboard } from "grammy";

export const mainKeyboard = new InlineKeyboard()
  .text("📝 Создать заметку", "answer_note")
  .row()
  .text("📂 Список папок", "list_folders")
  .row()
  .text("🛒 Создать список продуктов", "answer_shop");
