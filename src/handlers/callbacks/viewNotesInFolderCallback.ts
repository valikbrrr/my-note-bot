import { Context } from "grammy";
import { NoteService } from "../../services/noteService.js";

const noteService = new NoteService();

export async function viewNotesInFolderCallback(ctx: Context) {
  if (!ctx.from || !ctx.callbackQuery) return;
  
  const folderId = ctx.callbackQuery.data.replace("view_notes_in_folder_", "");
  const notes = await noteService.getUserNotes(ctx.from.id, folderId);
  
  if (notes.length === 0) {
    await ctx.editMessageText(
      "📭 В этой папке пока нет заметок",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "📝 Создать заметку", callback_data: "answer_note" }],
            [{ text: "🔙 Назад к папке", callback_data: `view_folder_${folderId}` }]
          ]
        }
      }
    );
    return;
  }
  
  // Показываем первые 5 заметок с пагинацией
  const displayNotes = notes.slice(0, 5);
  const notesText = displayNotes.map((note, index) => 
    `${index + 1}. ${note.content.substring(0, 50)}${note.content.length > 50 ? "..." : ""}`
  ).join("\n");
  
  await ctx.editMessageText(
    `📝 Заметки в папке:\n\n${notesText}\n\n` +
    `Всего: ${notes.length} заметок`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📝 Создать заметку", callback_data: "answer_note" }],
          [{ text: "🔙 Назад к папке", callback_data: `view_folder_${folderId}` }]
        ]
      }
    }
  );
}