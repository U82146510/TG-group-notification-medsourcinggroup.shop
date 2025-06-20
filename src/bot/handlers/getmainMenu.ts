import { InlineKeyboard } from "grammy";

export function getMainMenu(): InlineKeyboard {
  return new InlineKeyboard()
    .text('📝 Set Message', 'set_msg').row()
    .text('⏰ Set Time', 'set_time')
    .text('📅 Set Days', 'set_day').row()
    .text('➕ Add Schedule', 'add').row()
    .text('▶️ Start All', 'start')
    .text('⏸️ Stop All', 'stop').row()
    .text('📋 View Schedules', 'all_schedules').row()
    .text('🗑️ Delete All', 'delete_all').row();
}