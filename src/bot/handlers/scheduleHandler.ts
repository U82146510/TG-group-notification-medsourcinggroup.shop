import { Bot,Context } from "grammy";
import { logger } from "../logger/logger.ts";

export function registerScheduleHandler(bot:Bot<Context>){
    bot.callbackQuery('all_schedules',async(ctx:Context)=>{
        try {
            console.log("done")
        } catch (error) {
            logger.error(error)
        }
    });
};