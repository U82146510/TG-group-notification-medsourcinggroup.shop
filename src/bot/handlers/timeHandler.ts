import { Bot,Context } from "grammy";
import { logger } from "../logger/logger.ts";

export function registerTimeHandler(bot:Bot<Context>){
    bot.callbackQuery('set_time',async(ctx:Context)=>{
        try {
            
        } catch (error) {
            logger.error(error)
        }
    });
}