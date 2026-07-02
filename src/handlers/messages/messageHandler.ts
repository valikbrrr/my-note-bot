import { Context } from "../../types/context";
import { FolderService } from "../../services/folderService";
import { NoteService } from "../../services/noteService";
import {
  noteActionKeyboard,
  noteListKeyboard,
} from "../../keyboards/noteKeyboards";

const folderService = new FolderService();
const noteService = new NoteService();

function parseShopItems(text: string): string[] {
  const items = text
    .split(/[,\n]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return items;
}

async function showCurrentShopList(ctx: Context) {
  const items = ctx.session.shopItems || [];

  if (items.length === 0) {
    await ctx.reply(
      "📝 Список продуктов пуст.\n\n" +
        "Введите продукты или используйте кнопки:",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "✅ Готово", callback_data: "shop_done" }],
            [{ text: "❌ Отмена", callback_data: "shop_cancel" }],
          ],
        },
      },
    );
    return;
  }

  const keyboard = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const displayText = item.checked ? `🟢 ${item.name}` : `✅ ${item.name}`;
    keyboard.push([
      {
        text: displayText,
        callback_data: `shop_toggle_${i}`,
      },
    ]);
  }

  keyboard.push([
    { text: "➕ Добавить еще", callback_data: "shop_add_more" },
    { text: "🗑️ Очистить всё", callback_data: "shop_clear" },
  ]);
  keyboard.push([
    { text: "✅ Готово", callback_data: "shop_done" },
    { text: "❌ Отмена", callback_data: "shop_cancel" },
  ]);

  const checkedCount = items.filter((item) => item.checked).length;
  const totalCount = items.length;

  await ctx.reply(
    `🛒 Ваш список продуктов (${checkedCount}/${totalCount} куплено):\n\n` +
      items
        .map(
          (item, i) => `${i + 1}. ${item.checked ? "🟢" : "⬜"} ${item.name}`,
        )
        .join("\n") +
      `\n\n✅ Нажмите на продукт, чтобы отметить его как купленный`,
    {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    },
  );
}

export async function handleTextMessage(ctx: Context) {
  if (!ctx.from || !ctx.message || !ctx.message.text) return;

  const text = ctx.message.text;

  // ==========================================
  // 🛒 ОБРАБОТКА СПИСКА ПРОДУКТОВ
  // ==========================================
  if (ctx.session.step === "waiting_for_shop_items") {
    if (text.startsWith("/")) {
      await ctx.reply("Используйте кнопки для завершения или отмены");
      return;
    }

    const newItems = parseShopItems(text);

    if (newItems.length === 0) {
      await ctx.reply("⚠️ Не найдено продуктов. Попробуйте еще раз.");
      return;
    }

    if (!ctx.session.shopItems) {
      ctx.session.shopItems = [];
    }

    // ✅ Добавляем объекты с полями name и checked
    const itemsToAdd = newItems.map((name) => ({ name, checked: false }));
    ctx.session.shopItems.push(...itemsToAdd);

    await showCurrentShopList(ctx);
    return;
  }

  // ==========================================
  // 📝 СОЗДАНИЕ НОВОЙ ЗАМЕТКИ (ЗАГОЛОВОК)
  // ==========================================
  if (ctx.session.step === "waiting_for_note_title") {
    ctx.session.tempNoteTitle = text;
    ctx.session.step = "waiting_for_note_content";

    await ctx.reply("✏️ Введите текст заметки:", {
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Отмена", callback_data: "cancel" }]],
      },
    });
    return;
  }

  // ==========================================
  // 📝 СОЗДАНИЕ НОВОЙ ЗАМЕТКИ (СОДЕРЖАНИЕ)
  // ==========================================
  if (ctx.session.step === "waiting_for_note_content") {
    const title = ctx.session.tempNoteTitle || "Без названия";
    const content = text;

    ctx.session.tempNote = content;
    ctx.session.tempNoteTitle = title;

    const folders = await folderService.getUserFolders(ctx.from.id);

    if (folders.length === 0) {
      await ctx.reply(
        `✅ Заметка *"${title}"* создана!\n\n` +
          "У вас пока нет папок. Хотите создать папку для заметок?",
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "✅ Да, создать папку",
                  callback_data: "create_folder",
                },
              ],
              [
                {
                  text: "❌ Нет, оставить без папки",
                  callback_data: "no_folder",
                },
              ],
            ],
          },
        },
      );
    } else {
      await ctx.reply(
        `✅ Заметка *"${title}"* создана!\n\n` +
          "Выберите папку для сохранения:",
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              ...folders.map((folder) => [
                {
                  text: `📁 ${folder.name}`,
                  callback_data: `save_to_folder_${folder._id}`,
                },
              ]),
              [{ text: "➕ Новая папка", callback_data: "create_folder" }],
              [{ text: "❌ Без папки", callback_data: "no_folder" }],
            ],
          },
        },
      );
    }

    ctx.session.step = "idle";
    return;
  }

  // ==========================================
  // ✏️ РЕДАКТИРОВАНИЕ ЗАМЕТКИ (ЗАГОЛОВОК)
  // ==========================================
  if (ctx.session.step === "editing_note") {
    const noteId = ctx.session.tempNoteId;
    if (!noteId) return;

    if (text.toLowerCase() === "пропустить") {
      ctx.session.step = "editing_note_content";
      await ctx.reply(
        "✏️ Введите новый текст заметки (или отправьте 'пропустить' чтобы оставить текущий):",
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "❌ Отмена", callback_data: `view_note_${noteId}` }],
            ],
          },
        },
      );
    } else {
      ctx.session.tempNoteTitle = text;
      ctx.session.step = "editing_note_content";
      await ctx.reply(
        "✏️ Введите новый текст заметки (или отправьте 'пропустить' чтобы оставить текущий):",
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "❌ Отмена", callback_data: `view_note_${noteId}` }],
            ],
          },
        },
      );
    }
    return;
  }

  // ==========================================
  // ✏️ РЕДАКТИРОВАНИЕ ЗАМЕТКИ (СОДЕРЖАНИЕ)
  // ==========================================
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
        await ctx.reply(`📝 *${note.title}*\n\n${note.content}`, {
          parse_mode: "Markdown",
          reply_markup: noteActionKeyboard(noteId),
        });
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

  // ==========================================
  // 📁 СОЗДАНИЕ ПАПКИ
  // ==========================================
  if (ctx.session.step === "waiting_for_folder_name") {
    try {
      const folder = await folderService.createFolder(text, ctx.from.id);

      if (ctx.session.tempNote && ctx.session.tempNoteTitle) {
        await noteService.createNote(
          ctx.session.tempNoteTitle,
          ctx.session.tempNote,
          ctx.from.id,
          folder._id.toString(),
        );
        ctx.session.tempNote = undefined;
        ctx.session.tempNoteTitle = undefined;
        await ctx.reply(
          `✅ Папка "${folder.name}" создана! Заметка сохранена в неё.`,
        );
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

  // ==========================================
  // 🔄 ПЕРЕИМЕНОВАНИЕ ПАПКИ
  // ==========================================
  if (ctx.session.step === "waiting_for_folder_rename") {
    const folderId = ctx.session.tempFolderId;
    if (!folderId) {
      ctx.session.step = "idle";
      await ctx.reply("❌ Ошибка: папка не найдена");
      return;
    }

    try {
      await folderService.updateFolder(folderId, ctx.from.id, { name: text });
      ctx.session.tempFolderId = undefined;
      ctx.session.step = "idle";

      await ctx.reply(`✅ Папка успешно переименована в "${text}"!`);

      const folders = await folderService.getUserFolders(ctx.from.id);
      if (folders.length > 0) {
        const keyboard = folders.map((f) => [
          {
            text: `📁 ${f.name}`,
            callback_data: `view_folder_${f._id}`,
          },
        ]);
        keyboard.push([
          {
            text: "➕ Создать папку",
            callback_data: "create_folder_from_list",
          },
        ]);
        keyboard.push([{ text: "🔙 Назад", callback_data: "back_to_main" }]);

        await ctx.reply("📂 Ваши папки:", {
          reply_markup: { inline_keyboard: keyboard },
        });
      }
    } catch (error: any) {
      await ctx.reply(`❌ ${error.message}`);
    }
    return;
  }

  // ==========================================
  // 🔄 ПЕРЕМЕЩЕНИЕ ЗАМЕТКИ
  // ==========================================
  if (ctx.session.step === "moving_note") {
    try {
      const folders = await folderService.getUserFolders(ctx.from.id);
      const folder = folders.find(
        (f) => f.name.toLowerCase() === text.toLowerCase(),
      );

      if (!folder) {
        await ctx.reply(
          `❌ Папка "${text}" не найдена.\n\n` +
            "Проверьте название или создайте новую папку.",
        );
        return;
      }

      const noteId = ctx.session.tempNoteId;
      if (!noteId) {
        ctx.session.step = "idle";
        await ctx.reply("❌ Ошибка: заметка не найдена");
        return;
      }

      await noteService.moveNote(noteId, ctx.from.id, folder._id.toString());

      ctx.session.step = "idle";
      ctx.session.tempNoteId = undefined;

      await ctx.reply(`✅ Заметка перемещена в папку "${folder.name}"!`);
    } catch (error: any) {
      await ctx.reply(`❌ ${error.message}`);
    }
    return;
  }
}
