import { Bot,Context } from "grammy";
import { logger } from "../logger/logger.ts";

export function registerGroupHandler(bot:Bot<Context>){
    bot.callbackQuery('set_group',async(ctx:Context)=>{
        try {
            
        } catch (error) {
            logger.error(error)
        }
    });
};