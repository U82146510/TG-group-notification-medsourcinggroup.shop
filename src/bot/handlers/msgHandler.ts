import { Bot,Context } from "grammy";
import { logger } from "../logger/logger.ts";

export function registerMessagHandler(bot:Bot<Context>){
    bot.callbackQuery('set_msg',async(ctx:Context)=>{
        try {
            
        } catch (error) {
            logger.error(error)
        }
    });
}