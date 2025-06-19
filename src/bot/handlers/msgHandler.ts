import { Bot,Context } from "grammy";
import { logger } from "../logger/logger.ts";
import {deleteCachedMessages} from '../utils/clean.ts';
import fs from 'fs';

const UserState = new Map<number,string>();
const UserStateFlow = new Map<string,number[]>();
export function registerMessagHandler(bot:Bot<Context>){
    bot.callbackQuery('set_msg',async(ctx:Context)=>{
        try {
            const userId:number = Number(ctx.from?.id);
            if(!userId) return;
            const msg = await ctx.reply("Please set your message now:");
            UserState.set(userId, "await_msg");
            UserStateFlow.set(`set_msg_${userId}`, [msg.message_id]); 
        } catch (error) {
            logger.error(error)
        }
    });

    bot.callbackQuery('set_time',async(ctx:Context)=>{
        try {
            const userId:number = Number(ctx.from?.id);
            if(!userId) return;
            const ids = UserStateFlow.get(`set_msg_${userId}`);
            if(!ids) return;
            await deleteCachedMessages(ctx,ids)
            UserState.delete(userId);
            const msg = await ctx.reply("Please set you time:");
            UserState.set(userId,"await_time");
        } catch (error) {
            logger.error(error)
        }
    });

    bot.callbackQuery('set_group',async(ctx:Context)=>{
        try {
            const userId:number = Number(ctx.from?.id);
            if(!userId) return;
            const msg = await ctx.reply("Please set group ID:");
            UserState.set(userId,"await_group");
        } catch (error) {
            logger.error(error)
        }
    });

    bot.on('message:text',async(ctx:Context)=>{
        const userId:number = Number(ctx.from?.id);
        const typeInput = UserState.get(userId);
        const userInputId = ctx.message?.message_id;
        
        if(typeInput==='await_time'){
            if (typeof userInputId !== 'number') return; 
            const ids = UserStateFlow.get(`set_msg_${userId}`);
            if (ids) {
                await deleteCachedMessages(ctx, [...ids, userInputId]); // delete all prompts + user input
                UserStateFlow.delete(`set_msg_${userId}`);
            }
            UserState.delete(userId);
            console.log(ctx.message?.text)
            ctx.reply('time set');
        }
        if(typeInput==='await_msg'){
            UserState.delete(userId);
            console.log(ctx.message?.text);

            const msg = await ctx.reply('msg set');
            const key = `set_msg_${userId}`;
            const current = UserStateFlow.get(key) ?? [];
            current.push(msg.message_id);
            UserStateFlow.set(key, current);
        }
        if(typeInput==='await_group'){
            UserState.delete(userId);
            console.log(ctx.message?.text)
            ctx.reply('group set');
        }
    });
}