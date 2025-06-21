import {bot} from '../bot.ts';
import { logger } from '../logger/logger.ts';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filanem = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filanem);

dotenv.config({
    path:path.resolve(__dirname,'../../../.env')
});

const group_id = process.env.group;
if (!group_id) {
  throw new Error("missing group id");
}

export async function sendMessageToGroup(msg:string){
    try {
        console.log('test')
        await bot.api.sendMessage(-Number(group_id) ,msg)
    } catch (error) {
        logger.error(error);
    }
}
