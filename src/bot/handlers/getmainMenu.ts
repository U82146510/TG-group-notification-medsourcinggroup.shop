import { InlineKeyboard } from "grammy";

export function getMainMenu():InlineKeyboard{
    return new InlineKeyboard()
    .text('Set Message','set_msg').row()
    .text('Set Time','set_time').row()
    .text('Delete all Schedules','delete_all').row()
    .text('List all Schedules','all_schedules').row()
};