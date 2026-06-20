import { Context } from "../../types/context";
import { NoteService } from "../../services/noteService";
import { FolderService } from "../../services/folderService";

const noteService = new NoteService();
const folderService = new FolderService();

export async function handleSaveToFolder(ctx: Context) {
  if (!ctx.from || !ctx.callbackQuery || !ctx.callbackQuery.data) return;
  
  const folderId = ctx.callbackQuery.data.replace("save_to_folder_", "");
  const title = ctx.session.tempNoteTitle;
  const content = ctx.session.tempNote;
  
  if (!title || !content) {
    await ctx.answerCallbackQuery("❌ Заметка не найдена");
    return;
  }
  
  await noteService.createNote(title, content, ctx.from.id, folderId);
  ctx.session.tempNote = undefined;
  ctx.session.tempNoteTitle = undefined;
  
  await ctx.editMessageText("✅ Заметка успешно сохранена в папку!");
}

export async function handleNoFolder(ctx: Context) {
  if (!ctx.from || !ctx.callbackQuery) return;
  
  const title = ctx.session.tempNoteTitle;
  const content = ctx.session.tempNote;
  
  if (title && content) {
    await noteService.createNote(title, content, ctx.from.id);
    ctx.session.tempNote = undefined;
    ctx.session.tempNoteTitle = undefined;
    await ctx.editMessageText("✅ Заметка сохранена без папки!");
  }
}

export async function handleCreateFolder(ctx: Context) {
  if (!ctx.from || !ctx.callbackQuery) return;
  
  ctx.session.step = "waiting_for_folder_name";
  ctx.session.returnTo = "main_menu";
  
  await ctx.editMessageText(
    "📁 Введите название новой папки:",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "❌ Отмена", callback_data: "cancel" }]
        ]
      }
    }
  );
}