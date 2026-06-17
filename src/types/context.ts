import { Context as GrammyContext, SessionFlavor } from "grammy";
import { SessionData } from "./session";

export type Context = GrammyContext & SessionFlavor<SessionData>;