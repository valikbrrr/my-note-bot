import { Context } from "../../types/context.js";
import { FolderService } from "../../services/folderService.js";
import { NoteService } from "../../services/noteService";

const folderService = new FolderService();
const noteService = new NoteService(); // 👈 Создай экземпляр

export async function handleTextMessage(ctx: Context) {
  if (!ctx.from || !ctx.message || !ctx.message.text) return;
  
  const text = ctx.message.text;
  
  if (ctx.session.step === "waiting_for_note") {
    ctx.session.tempNote = text;
    // ... остальная логика
  }
  
  if (ctx.session.step === "waiting_for_folder_name") {
    try {
      const folder = await folderService.createFolder(text, ctx.from.id);
      // ... остальная логика
    } catch (error: any) {
      await ctx.reply(`❌ ${error.message}`);
    }
  }
}