import { Context as GrammyContext, SessionFlavor } from "grammy";
import { SessionData } from "./session.js";

export type Context = GrammyContext & SessionFlavor<SessionData>;