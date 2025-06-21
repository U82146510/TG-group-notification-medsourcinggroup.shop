import cron from "node-cron";
import { sendMessageToGroup } from '../messages/sendMessageToGroup.ts';
import { logger } from "../logger/logger.ts";

interface msgForm {
  msg: string;
  time: string;
  day: string;
}

const cronJobs = new Map<number, cron.ScheduledTask>();

export function buildMessages(db: Array<msgForm>) {
  console.log("🧩 Building messages for:", db);

  cronJobs.clear(); // 🔄 clear previous jobs

  db.forEach((input, index) => {
    const { time, day, msg } = input;

    if (!/^\d{2}:\d{2}$/.test(time)) {
      console.warn(`⛔ Invalid time format: ${time}`);
      return;
    }

    if (!/^([1-7](-[1-7])?)$/.test(day)) {
      console.warn(`⛔ Invalid day format: ${day}`);
      return;
    }

    const [hourStr, minuteStr] = time.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    const cronExpr = `${minute} ${hour} * * ${day}`;
    console.log(`✅ Scheduling: ${cronExpr}`);

    try {
      const job = cron.schedule(cronExpr, async () => {
        console.log(`🚀 Sending scheduled message: "${msg}"`);
        await sendMessageToGroup(msg);
      }, {
        // @ts-expect-error: TS typing issue
        scheduled: false,
      });

      cronJobs.set(index, job);
    } catch (error) {
      logger.error(`❌ Failed to schedule [${cronExpr}]`, error);
    }
  });
}

export function startAllJobs() {
  console.log("▶️ Starting all cron jobs...");
  cronJobs.forEach(job => job.start());
}

export function stopAllJobs() {
  console.log("⏹️ Stopping all cron jobs...");
  cronJobs.forEach(job => job.stop());
}
