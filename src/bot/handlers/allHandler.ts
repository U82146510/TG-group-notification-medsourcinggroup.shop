import { Bot, Context, InlineKeyboard } from "grammy";
import { logger } from "../logger/logger.ts";
import { deleteCachedMessages } from "../utils/clean.ts";
import {startAllJobs,stopAllJobs} from '../services/cronJob.ts';

//Container of all messages

interface msgForm {
    msg:string;
    time:string;
    day:string;
};

const db = new Array<Partial<msgForm>>();
const setData:Partial<msgForm> = {} 

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
    setData.time = finalTime;
    await ctx.editMessageText(`✅ Time set: ${finalTime}`);
    const originalMsgId = ctx.callbackQuery.message?.message_id;
    if (originalMsgId) {
        trackUserMessage(userId, originalMsgId); // ✅ this is now tracked for deletion
    }
    TimeSelection.delete(userId);
    UserState.delete(userId);
  });

  // 💬 General message input handler
  bot.on("message:text", async (ctx) => {
    const userId = Number(ctx.from?.id);
    const state = UserState.get(userId);
    const msgId = ctx.message?.message_id;
    if (!msgId) return;

    if (state === "await_msg") {
      await clearUserFlow(ctx, userId, msgId);
      setData.msg = ctx.message.text;
      const msg = await ctx.reply("📨 Message set.");
      trackUserMessage(userId, msg.message_id);
      UserState.delete(userId);
    }
   if (state === "await_day") {
        await clearUserFlow(ctx, userId, msgId);
        const input = ctx.message.text.trim();

        const isValidDay = /^([1-7]|[1-7]-[1-7])$/.test(input);
        if (!isValidDay) {
            const msg = await ctx.reply("❌ Invalid format. Please send a single number (1–7) or a range like 1-6.");
            trackUserMessage(userId, msg.message_id);
            return;
        }

        if (input.includes("-")) {
            const [start, end] = input.split("-").map(Number);
            if (start >= end) {
                const msg = await ctx.reply("❌ Invalid range. Start must be less than end.");
                trackUserMessage(userId, msg.message_id);
                return;
            }
            setData.day = `${start}-${end}`;
        } else {
            setData.day = input;
        }

        const msg = await ctx.reply("📨 Days set.");
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

  bot.callbackQuery("set_day", async (ctx) => {
    try {
      const userId = Number(ctx.from?.id);
      if (!userId) return;

      await clearUserFlow(ctx, userId);

      const msg = await ctx.reply("✉️ Please send your days of week:");
      trackUserMessage(userId, msg.message_id);
      UserState.set(userId, "await_day");
    } catch (error) {
      logger.error(error);
    }
  });

   bot.callbackQuery("add", async (ctx) => {
    try {
            const userId = Number(ctx.from?.id);
            if (!userId) return;

            await clearUserFlow(ctx, userId);

            if (!setData.day) {
            const msg = await ctx.reply("📅 Please set the day(s) of the week first.");
            trackUserMessage(userId, msg.message_id);
            return;
            }

            if (!setData.time) {
            const msg = await ctx.reply("⏰ Please set the time before adding.");
            trackUserMessage(userId, msg.message_id);
            return;
            }

            if (!setData.msg) {
            const msg = await ctx.reply("📝 Please provide the message content.");
            trackUserMessage(userId, msg.message_id);
            return;
            }

            db.push({ ...setData });

            const msg = await ctx.reply(
            `✅ Schedule added successfully!\n\n` +
            `📝 Message: ${setData.msg}\n` +
            `⏰ Time: ${setData.time}\n` +
            `📅 Day(s): ${setData.day}`
            );

            Object.keys(setData).forEach((key) => delete (setData as any)[key]);
            trackUserMessage(userId, msg.message_id);
            UserState.set(userId, "await_day");
        } catch (error) {
            logger.error(error);
        }
    });




    bot.callbackQuery('all_schedules', async (ctx: Context) => {
        try {
            const userId = Number(ctx.from?.id);
            if (!userId) return;

            await clearUserFlow(ctx, userId);

            if (db.length === 0) {
            const msg = await ctx.reply("📭 No scheduled messages found.");
            trackUserMessage(userId, msg.message_id);
            return;
            }

            for (const [index, entry] of db.entries()) {
            const msg = await ctx.reply(
                `📦 <b>Schedule #${index + 1}</b>\n\n` +
                `📝 <b>Message:</b> ${entry.msg}\n` +
                `⏰ <b>Time:</b> ${entry.time}\n` +
                `📅 <b>Day(s):</b> ${entry.day}`,
                { parse_mode: "HTML" }
            );
            trackUserMessage(userId, msg.message_id);
            }
        } catch (error) {
            logger.error(error);
        }
    });


    bot.callbackQuery("delete_all", async (ctx:Context) => {
        try {
            const userId = Number(ctx.from?.id);
            if (!userId) return;

            await clearUserFlow(ctx, userId);
            
            const total = db.length;
            const plural = total === 1 ? "was" : "were";
            const label = total === 1 ? "message" : "messages";

            const msg = await ctx.reply(`🗑️ <b>Total:</b> ${total} ${label} ${plural} deleted.`, {
            parse_mode: "HTML",
            });
            trackUserMessage(userId, msg.message_id);
        } catch (error) {
        logger.error(error);
        }
    });
    
    bot.callbackQuery("start", async (ctx: Context) => {
    try {
      const userId = Number(ctx.from?.id);
      if (!userId) return;

      await clearUserFlow(ctx, userId);

      startAllJobs(); // ✅ starts all tracked jobs

      const msg = await ctx.reply("▶️ All schedules have been started.");
      trackUserMessage(userId, msg.message_id);
    } catch (error) {
      logger.error(error);
    }
  });

  bot.callbackQuery("stop", async (ctx: Context) => {
    try {
      const userId = Number(ctx.from?.id);
      if (!userId) return;

      await clearUserFlow(ctx, userId);

      stopAllJobs(); // ✅ stops all tracked jobs

      const msg = await ctx.reply("⏸️ All schedules have been stopped.");
      trackUserMessage(userId, msg.message_id);
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