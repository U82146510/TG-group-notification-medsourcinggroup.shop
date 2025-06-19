import { InlineKeyboard,Bot,Context, Api } from "grammy";
import dotenv from "dotenv";
import {fileURLToPath} from 'url';
import path from "path";
import {logger} from './logger/logger.ts';
import {registerStartMenu} from './index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path:path.resolve(__dirname,'../../.env')
});

const token = process.env.bot_token;
if(!token){
    logger.error('missing telegram token')
    throw new Error('missing telegram token');
}

const bot:Bot<Context,Api> = new Bot(token);

const start = async()=>{
    try {
        registerStartMenu(bot);
        await bot.start();      
    } catch (error) {
        logger.error(error);
    }
};

start()