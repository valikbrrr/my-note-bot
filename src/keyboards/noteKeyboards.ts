import { InlineKeyboard } from "grammy";
import { INote } from "../database/models/Note";

export const noteActionKeyboard = (noteId: string) => {
  return new InlineKeyboard()
    .text("✏️ Редактировать", `edit_note_${noteId}`)
    .text("🗑️ Удалить", `delete_note_${noteId}`)
    .row()
    .text("📂 Переместить в папку", `move_note_${noteId}`)
    .row()
    .text("🔙 Назад", `back_to_notes`);
};

export const noteListKeyboard = (notes: INote[], folderId?: string) => {
  const keyboard = new InlineKeyboard();

  if (notes.length === 0) {
    keyboard.text("📭 Нет заметок", "no_notes");
  } else {
    notes.forEach((note) => {
      keyboard.text(`📝 ${note.title}`, `view_note_${note._id}`).row();
    });
  }

  keyboard.text("➕ Создать заметку", "answer_note").row();
  keyboard.text("🔙 Назад к папке", `view_folder_${folderId || "main"}`);

  return keyboard;
};

export const cancelKeyboard = new InlineKeyboard().text("❌ Отмена", "cancel");
