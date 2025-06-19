import { InlineKeyboard } from "grammy";

export function getMainMenu():InlineKeyboard{
    return new InlineKeyboard()
    .text('Set Message','set_msg').row()
    .text('Set Time','set_time').row()
}