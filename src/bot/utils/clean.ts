import { Context } from "grammy";
import { logger } from "../logger/logger.ts";


export async function deleteCachedMessages(ctx: Context, messageIds: number[]) {
  try {
    for (const id of messageIds) {
      try {
        await ctx.api.deleteMessage(ctx.chat!.id, Number(id));
      } catch (e) {
        logger.debug(`Failed to delete message `);
      }
    }
  } catch (e) {
    logger.warn(`Failed to clean messages `);
  }
}