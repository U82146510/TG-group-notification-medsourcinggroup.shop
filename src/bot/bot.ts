import { InlineKeyboard,Bot,Context, Api } from "grammy";
import dotenv from "dotenv";
import {fileURLToPath} from 'url';
import path from "path";
import {logger} from './logger/logger.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path:path.resolve(__dirname,'../../.env')
});

const token = process.env.bot_token;
if(!token){
    throw new Error('missing telegram token');
}

const bot:Bot<Context,Api> = new Bot(token);

