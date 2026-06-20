export interface SessionData {
  step:
    | "idle"
    | "waiting_for_note_title"
    | "waiting_for_note_content"
    | "waiting_for_folder_name"
    | "waiting_for_folder_rename"
    | "editing_note"
    | "editing_note_content"
    | "moving_note";
  tempNote?: string;
  tempNoteTitle?: string;
  tempNoteId?: string;
  tempNoteContent?: string;
  tempFolderId?: string;
  returnTo?: "folders_list" | "main_menu";
}
