import {Context,Bot} from "grammy";
import {getMainMenu} from './handlers/getmainMenu.ts';
export function registerStartMenu(bot:Bot<Context>){
    bot.command("start",async(ctx:Context)=>{
        await ctx.reply('Welcome to main Menu:',{parse_mode:'Markdown',reply_markup:getMainMenu()})
    });
};