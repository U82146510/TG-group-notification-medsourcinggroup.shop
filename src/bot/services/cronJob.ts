import cron from "node-cron";
import {sendMessageToGroup} from '../messages/sendMessageToGroup.ts'

interface msgForm {
    msg:string;
    time:string;
    day:string;
};

const cronJobs = new Map<number, cron.ScheduledTask>();

export function buildMessages(db: Array<msgForm>) {
  db.forEach((input, index) => {
    const [hourStr, minuteStr] = input.time.split(":");
    const hour = String(Number(hourStr));    // safely remove leading 0
    const minute = String(Number(minuteStr));

    const cronExpr = `${minute} ${hour} * * ${input.day}`;

    const job = cron.schedule(cronExpr, async () => {
      await sendMessageToGroup(input.msg);
    }, {
      scheduled: false, // Don't auto-start
    } as any);

    cronJobs.set(index, job); // Track by index
  });
}

export function startAllJobs() {
  cronJobs.forEach(job => job.start());
}

export function stopAllJobs() {
  cronJobs.forEach(job => job.stop());
}



