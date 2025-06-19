import cron from 'node-cron';

export function setupSchedules(){
    cron.schedule("0 8 * * 1-5",async()=>{
        
    });
}