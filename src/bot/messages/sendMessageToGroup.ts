import {bot} from '../bot.ts';
import { logger } from '../logger/logger.ts';
export async function sendMessageToGroup(msg:string){
    try {
       await bot.api.sendMessage(-4880467474,msg)
    } catch (error) {
        logger.error(error);
    }
}