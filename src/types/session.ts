export interface SessionData {
  step: "idle" | "waiting_for_note" | "waiting_for_folder_name" | "waiting_for_folder_rename";
  tempNote?: string;
  tempFolderId?: string;
  returnTo?: "folders_list" | "main_menu";
}