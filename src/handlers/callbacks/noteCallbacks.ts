import { Context } from "../../types/context";
import { NoteService } from "../../services/noteService";
import { FolderService } from "../../services/folderService";
import { noteListKeyboard, noteActionKeyboard } from "../../keyboards/noteKeyboards";

const noteService = new NoteService();
const folderService = new FolderService();

// Просмотр заметок в папке
export async function viewNotesInFolderCallback(ctx: Context) {
  if (!ctx.from || !ctx.callbackQuery || !ctx.callbackQuery.data) return;
  
  const folderId = ctx.callbackQuery.data.replace("view_notes_in_folder_", "");
  const notes = await noteService.getNotesByFolder(folderId, ctx.from.id);
  
  await ctx.editMessageText(
    notes.length === 0 
      ? "📭 В этой папке пока нет заметок"
      : `📝 Заметки в папке (${notes.length}):`,
    {
      reply_markup: noteListKeyboard(notes, folderId)
    }
  );
}

// Просмотр конкретной заметки
export async function viewNoteCallback(ctx: Context) {
  if (!ctx.from || !ctx.callbackQuery || !ctx.callbackQuery.data) return;
  
  const noteId = ctx.callbackQuery.data.replace("view_note_", "");
  const note = await noteService.getNoteById(noteId, ctx.from.id);
  
  if (!note) {
    await ctx.answerCallbackQuery("❌ Заметка не найдена");
    return;
  }
  
  await ctx.editMessageText(
    `📝 *${note.title}*\n\n` +
    `${note.content}\n\n` +
    `📅 Создана: ${note.createdAt.toLocaleDateString()}\n` +
    `🔄 Обновлена: ${note.updatedAt.toLocaleDateString()}`,
    {
      parse_mode: "Markdown",
      reply_markup: noteActionKeyboard(noteId)
    }
  );
}

// Редактирование заметки
export async function editNoteCallback(ctx: Context) {
  if (!ctx.from || !ctx.callbackQuery || !ctx.callbackQuery.data) return;
  
  const noteId = ctx.callbackQuery.data.replace("edit_note_", "");
  const note = await noteService.getNoteById(noteId, ctx.from.id);
  
  if (!note) {
    await ctx.answerCallbackQuery("❌ Заметка не найдена");
    return;
  }
  
  ctx.session.step = "editing_note";
  ctx.session.tempNoteId = noteId;
  ctx.session.tempNoteTitle = note.title;
  ctx.session.tempNoteContent = note.content;
  
  await ctx.editMessageText(
    `✏️ Редактирование заметки\n\n` +
    `Текущий заголовок: *${note.title}*\n` +
    `Текущий текст: ${note.content}\n\n` +
    `Введите новый заголовок заметки (или отправьте "пропустить" чтобы оставить текущий):`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "❌ Отмена", callback_data: `view_note_${noteId}` }]
        ]
      }
    }
  );
}

// Удаление заметки
export async function deleteNoteCallback(ctx: Context) {
  if (!ctx.from || !ctx.callbackQuery || !ctx.callbackQuery.data) return;
  
  const noteId = ctx.callbackQuery.data.replace("delete_note_", "");
  const note = await noteService.getNoteById(noteId, ctx.from.id);
  
  if (!note) {
    await ctx.answerCallbackQuery("❌ Заметка не найдена");
    return;
  }
  
  await ctx.editMessageText(
    `⚠️ Вы уверены, что хотите удалить заметку *${note.title}*?`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Да, удалить", callback_data: `confirm_delete_note_${noteId}` },
            { text: "❌ Нет", callback_data: `view_note_${noteId}` }
          ]
        ]
      }
    }
  );
}

// Подтверждение удаления заметки
export async function confirmDeleteNoteCallback(ctx: Context) {
  if (!ctx.from || !ctx.callbackQuery || !ctx.callbackQuery.data) return;
  
  const noteId = ctx.callbackQuery.data.replace("confirm_delete_note_", "");
  
  try {
    const note = await noteService.getNoteById(noteId, ctx.from.id);
    if (!note) {
      await ctx.answerCallbackQuery("❌ Заметка не найдена");
      return;
    }
    
    const folderId = note.folderId?.toString();
    await noteService.deleteNote(noteId, ctx.from.id);
    
    await ctx.editMessageText("✅ Заметка успешно удалена!");
    
    // Возвращаемся к списку заметок в папке
    if (folderId) {
      const notes = await noteService.getNotesByFolder(folderId, ctx.from.id);
      await ctx.reply(
        notes.length === 0 
          ? "📭 В этой папке больше нет заметок"
          : `📝 Обновленный список заметок:`,
        {
          reply_markup: noteListKeyboard(notes, folderId)
        }
      );
    } else {
      await ctx.reply("🔙 Возврат в главное меню");
    }
  } catch (error) {
    await ctx.editMessageText("❌ Ошибка при удалении заметки");
  }
}

// Перемещение заметки в другую папку
export async function moveNoteCallback(ctx: Context) {
  if (!ctx.from || !ctx.callbackQuery || !ctx.callbackQuery.data) return;
  
  const noteId = ctx.callbackQuery.data.replace("move_note_", "");
  const folders = await folderService.getUserFolders(ctx.from.id);
  
  if (folders.length === 0) {
    await ctx.answerCallbackQuery("❌ У вас нет папок для перемещения");
    return;
  }
  
  ctx.session.tempNoteId = noteId;
  ctx.session.step = "moving_note";
  
  await ctx.editMessageText(
    "📂 Выберите папку для перемещения заметки:",
    {
      reply_markup: {
        inline_keyboard: [
          ...folders.map(folder => ([
            { text: `📁 ${folder.name}`, callback_data: `confirm_move_note_${noteId}_${folder._id}` }
          ])),
          [{ text: "❌ Отмена", callback_data: `view_note_${noteId}` }]
        ]
      }
    }
  );
}

// Подтверждение перемещения заметки
export async function confirmMoveNoteCallback(ctx: Context) {
  if (!ctx.from || !ctx.callbackQuery || !ctx.callbackQuery.data) return;
  
  const parts = ctx.callbackQuery.data.replace("confirm_move_note_", "").split("_");
  const noteId = parts[0];
  const folderId = parts[1];
  
  try {
    await noteService.moveNoteToFolder(noteId, ctx.from.id, folderId);
    await ctx.answerCallbackQuery("✅ Заметка перемещена!");
    
    const note = await noteService.getNoteById(noteId, ctx.from.id);
    if (note) {
      await ctx.editMessageText(
        `📝 *${note.title}*\n\n${note.content}`,
        {
          parse_mode: "Markdown",
          reply_markup: noteActionKeyboard(noteId)
        }
      );
    }
  } catch (error) {
    await ctx.editMessageText("❌ Ошибка при перемещении заметки");
  }
}