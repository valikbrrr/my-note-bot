import { Context } from "../../types/context";
import { FolderService } from "../../services/folderService";
import { NoteService } from "../../services/noteService";
import { noteActionKeyboard, noteListKeyboard } from "../../keyboards/noteKeyboards";

const folderService = new FolderService();
const noteService = new NoteService();

export async function handleTextMessage(ctx: Context) {
  if (!ctx.from || !ctx.message || !ctx.message.text) return;
  
  const text = ctx.message.text;
  
  // Создание новой заметки (заголовок)
  if (ctx.session.step === "waiting_for_note_title") {
    ctx.session.tempNoteTitle = text;
    ctx.session.step = "waiting_for_note_content";
    
    await ctx.reply(
      "✏️ Введите текст заметки:",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "❌ Отмена", callback_data: "cancel" }]
          ]
        }
      }
    );
    return;
  }
  
  // Создание новой заметки (содержание)
  if (ctx.session.step === "waiting_for_note_content") {
    const title = ctx.session.tempNoteTitle || "Без названия";
    const content = text;
    
    // Сохраняем заметку временно в сессию
    ctx.session.tempNote = content;
    ctx.session.tempNoteTitle = title;
    
    // Получаем папки пользователя
    const folders = await folderService.getUserFolders(ctx.from.id);
    
    if (folders.length === 0) {
      // Нет папок - предлагаем создать или сохранить без папки
      await ctx.reply(
        `✅ Заметка *"${title}"* создана!\n\n` +
        "У вас пока нет папок. Хотите создать папку для заметок?",
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "✅ Да, создать папку", callback_data: "create_folder" }],
              [{ text: "❌ Нет, оставить без папки", callback_data: "no_folder" }]
            ]
          }
        }
      );
    } else {
      // Показываем выбор папок
      await ctx.reply(
        `✅ Заметка *"${title}"* создана!\n\n` +
        "Выберите папку для сохранения:",
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              ...folders.map(folder => ([
                { text: `📁 ${folder.name}`, callback_data: `save_to_folder_${folder._id}` }
              ])),
              [{ text: "➕ Новая папка", callback_data: "create_folder" }],
              [{ text: "❌ Без папки", callback_data: "no_folder" }]
            ]
          }
        }
      );
    }
    
    ctx.session.step = "idle";
    return;
  }
  
  // Редактирование заметки (заголовок)
  if (ctx.session.step === "editing_note") {
    const noteId = ctx.session.tempNoteId;
    if (!noteId) return;
    
    if (text.toLowerCase() === "пропустить") {
      // Пропускаем изменение заголовка
      ctx.session.step = "editing_note_content";
      await ctx.reply(
        "✏️ Введите новый текст заметки (или отправьте 'пропустить' чтобы оставить текущий):",
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "❌ Отмена", callback_data: `view_note_${noteId}` }]
            ]
          }
        }
      );
    } else {
      // Сохраняем новый заголовок
      ctx.session.tempNoteTitle = text;
      ctx.session.step = "editing_note_content";
      await ctx.reply(
        "✏️ Введите новый текст заметки (или отправьте 'пропустить' чтобы оставить текущий):",
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "❌ Отмена", callback_data: `view_note_${noteId}` }]
            ]
          }
        }
      );
    }
    return;
  }
  
  // Редактирование заметки (содержание)
  if (ctx.session.step === "editing_note_content") {
    const noteId = ctx.session.tempNoteId;
    const newTitle = ctx.session.tempNoteTitle;
    
    if (!noteId) return;
    
    try {
      const updateData: any = {};
      
      if (newTitle && text.toLowerCase() !== "пропустить") {
        updateData.title = newTitle;
      }
      
      if (text.toLowerCase() !== "пропустить") {
        updateData.content = text;
      }
      
      if (Object.keys(updateData).length === 0) {
        await ctx.reply("❌ Ничего не изменено");
        return;
      }
      
      await noteService.updateNote(noteId, ctx.from.id, updateData);
      
      const note = await noteService.getNoteById(noteId, ctx.from.id);
      if (note) {
        await ctx.reply("✅ Заметка обновлена!");
        await ctx.reply(
          `📝 *${note.title}*\n\n${note.content}`,
          {
            parse_mode: "Markdown",
            reply_markup: noteActionKeyboard(noteId)
          }
        );
      }
      
      ctx.session.step = "idle";
      ctx.session.tempNoteId = undefined;
      ctx.session.tempNoteTitle = undefined;
      ctx.session.tempNoteContent = undefined;
      
    } catch (error) {
      await ctx.reply("❌ Ошибка при обновлении заметки");
    }
    return;
  }
  
  // Создание папки
  if (ctx.session.step === "waiting_for_folder_name") {
    try {
      const folder = await folderService.createFolder(text, ctx.from.id);
      
      // Если есть временная заметка, сохраняем её в папку
      if (ctx.session.tempNote && ctx.session.tempNoteTitle) {
        await noteService.createNote(
          ctx.session.tempNoteTitle,
          ctx.session.tempNote,
          ctx.from.id,
          folder._id.toString()
        );
        ctx.session.tempNote = undefined;
        ctx.session.tempNoteTitle = undefined;
        await ctx.reply(`✅ Папка "${folder.name}" создана! Заметка сохранена в неё.`);
      } else {
        await ctx.reply(`✅ Папка "${folder.name}" успешно создана!`);
      }
      
      ctx.session.step = "idle";
      ctx.session.returnTo = undefined;
      
    } catch (error: any) {
      await ctx.reply(`❌ ${error.message}`);
    }
    return;
  }
}