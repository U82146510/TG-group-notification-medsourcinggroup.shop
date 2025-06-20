import { Bot, Context, InlineKeyboard } from "grammy";
import { logger } from "../logger/logger.ts";
import { deleteCachedMessages } from "../utils/clean.ts";

// Core state
const UserState = new Map<number, string>();
const UserStateFlow = new Map<string, number[]>();
const TimeSelection = new Map<number, { hour?: number; minute?: number }>();

export function registerMessagHandler(bot: Bot<Context>) {

  bot.callbackQuery("set_time", async (ctx) => {
    try {
      const userId = Number(ctx.from?.id);
      if (!userId) return;

      await clearUserFlow(ctx, userId);

      const keyboard = new InlineKeyboard();
      for (let i = 0; i < 24; i++) {
        const padded = i.toString().padStart(2, "0");
        keyboard.text(padded, `pick_hour_${padded}`);
        if ((i + 1) % 6 === 0) keyboard.row();
      }

      const msg = await ctx.reply("🕐 Pick an hour:", { reply_markup: keyboard });

      trackUserMessage(userId, msg.message_id);
      UserState.set(userId, "picking_hour");
    } catch (error) {
      logger.error(error);
    }
  });

  // ⌚ Hour Selected → Show Minutes
  bot.callbackQuery(/^pick_hour_\d{2}$/, async (ctx) => {
    const userId = Number(ctx.from?.id);
    if (!userId) return;

    const hour = parseInt(ctx.callbackQuery.data.split("_")[2]);
    TimeSelection.set(userId, { hour });

    const keyboard = new InlineKeyboard();
    for (let i = 0; i < 60; i += 15) {
      const padded = i.toString().padStart(2, "0");
      keyboard.text(padded, `pick_minute_${padded}`);
      if ((i + 1) % 4 === 0) keyboard.row();
    }

    await ctx.editMessageText(`✅ Hour selected: ${hour}\nNow pick minutes:`, {
      reply_markup: keyboard,
    });

    UserState.set(userId, "picking_minute");
  });

  // ✅ Final Minute Selected → Done
  bot.callbackQuery(/^pick_minute_\d{2}$/, async (ctx) => {
    const userId = Number(ctx.from?.id);
    if (!userId) return;

    const minute = parseInt(ctx.callbackQuery.data.split("_")[2]);
    const timeData = TimeSelection.get(userId);
    if (!timeData?.hour) return ctx.reply("❌ Hour not selected.");

    const finalTime = `${timeData.hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;

    await ctx.editMessageText(`✅ Time set: ${finalTime}`);

    TimeSelection.delete(userId);
    UserState.delete(userId);
    UserStateFlow.delete(`flow_${userId}`);
  });

  // 💬 General message input handler
  bot.on("message:text", async (ctx) => {
    const userId = Number(ctx.from?.id);
    const state = UserState.get(userId);
    const msgId = ctx.message?.message_id;
    if (!msgId) return;

    if (state === "await_msg") {
      await clearUserFlow(ctx, userId, msgId);
      console.log("User message:", ctx.message.text);
      const msg = await ctx.reply("📨 Message set.");
      trackUserMessage(userId, msg.message_id);
      UserState.delete(userId);
    }
  });

  // 📩 Set custom message manually
  bot.callbackQuery("set_msg", async (ctx) => {
    try {
      const userId = Number(ctx.from?.id);
      if (!userId) return;

      await clearUserFlow(ctx, userId);

      const msg = await ctx.reply("✉️ Please send your message:");
      trackUserMessage(userId, msg.message_id);
      UserState.set(userId, "await_msg");
    } catch (error) {
      logger.error(error);
    }
  });

  // 🆔 Set group ID
  bot.callbackQuery("delete_all", async (ctx) => {
    try {
      const userId = Number(ctx.from?.id);
      if (!userId) return;

      await clearUserFlow(ctx, userId);

      const msg = await ctx.reply("🆔 Please send the Group ID:");
      trackUserMessage(userId, msg.message_id);
      UserState.set(userId, "await_group");
    } catch (error) {
      logger.error(error);
    }
  });
}



function trackUserMessage(userId: number, msgId: number) {
  const key = `flow_${userId}`;
  const current = UserStateFlow.get(key) ?? [];
  current.push(msgId);
  UserStateFlow.set(key, current);
}

async function clearUserFlow(ctx: Context, userId: number, newMsgId?: number) {
  const key = `flow_${userId}`;
  const ids = UserStateFlow.get(key) ?? [];
  if (newMsgId) ids.push(newMsgId);
  if (ids.length > 0) {
    await deleteCachedMessages(ctx, ids);
    UserStateFlow.delete(key);
  }
}