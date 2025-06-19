import { InlineKeyboard } from "grammy";

export function getMainMenu():InlineKeyboard{
    return new InlineKeyboard()
    .text('Set Message','set_msg').row()
    .text('Set Time','set_time').row()
    .text('Set Group','set_group').row()
    .text('List all Schedules','all_schedules').row()
};